import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_SUBSCRIPTION_STATUSES = new Set([
  'trialing', 'active', 'canceled', 'incomplete',
  'incomplete_expired', 'past_due', 'unpaid', 'paused'
]);

function safeSubscriptionStatus(status: string | undefined): string {
  if (!status || !VALID_SUBSCRIPTION_STATUSES.has(status)) {
    return 'incomplete';
  }
  return status;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    // Atomically claim the event (idempotent)
    const { error: claimError } = await supabase
      .from('webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    if (claimError && claimError.code === '23505') {
      // Already processed (unique violation)
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (claimError) {
      console.error('Webhook event claim error:', claimError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    switch (event.type) {
      // ========================================
      // Checkout Session
      // ========================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve the customer's user_id from client_reference_id
        const userId = session.client_reference_id;
        const customerId = session.customer as string;

        // Validate client_reference_id maps to a real user
        const { data: userExists } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (!userExists) {
          console.error(`No user found for client_reference_id: ${userId}`);
          break;
        }

        if (userId && customerId) {
          // Upsert customer mapping
          await supabase
            .from('customers')
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
            }, { onConflict: 'stripe_customer_id' });

          // If there's a subscription, sync it
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );

            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
                stripe_current_period_end: new Date(
                  (subscription.items.data[0]?.current_period_end ?? 0) * 1000
                ).toISOString(),
                stripe_cancel_at_period_end: subscription.cancel_at_period_end,
                status: safeSubscriptionStatus(subscription.status),
              }, { onConflict: 'stripe_subscription_id' });
          }
        }
        break;
      }

      // ========================================
      // Customer Subscription
      // ========================================
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Re-fetch from Stripe API for authoritative state (webhooks can be unordered)
        const freshSubscription = await stripe.subscriptions.retrieve(subscription.id);
        await syncSubscription(supabase, freshSubscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark subscription as canceled rather than deleting
        await supabase
          .from('subscriptions')
          .update({
            status: safeSubscriptionStatus(subscription.status),
            stripe_cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      // ========================================
      // Products
      // ========================================
      case 'product.created': {
        const product = event.data.object as Stripe.Product;
        await supabase.from('products').upsert({
          stripe_product_id: product.id,
          name: product.name,
          description: product.description,
          image_url: product.images?.[0] ?? null,
          active: product.active,
          metadata: product.metadata as Record<string, string>,
        }, { onConflict: 'stripe_product_id' });
        break;
      }

      case 'product.updated': {
        const product = event.data.object as Stripe.Product;
        await supabase.from('products').upsert({
          stripe_product_id: product.id,
          name: product.name,
          description: product.description,
          image_url: product.images?.[0] ?? null,
          active: product.active,
          metadata: product.metadata as Record<string, string>,
        }, { onConflict: 'stripe_product_id' });
        break;
      }

      case 'product.deleted': {
        const product = event.data.object as Stripe.Product;
        await supabase
          .from('products')
          .delete()
          .eq('stripe_product_id', product.id);
        break;
      }

      // ========================================
      // Prices
      // ========================================
      case 'price.created': {
        const price = event.data.object as Stripe.Price;
        await syncPrice(supabase, price);
        break;
      }

      case 'price.updated': {
        const price = event.data.object as Stripe.Price;
        await syncPrice(supabase, price);
        break;
      }

      case 'price.deleted': {
        const price = event.data.object as Stripe.Price;
        await supabase
          .from('prices')
          .delete()
          .eq('stripe_price_id', price.id);
        break;
      }

      default:
        // Unhandled event type — log but don't error
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ========================================
// Helper functions
// ========================================

async function syncSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  // Look up the customer to find the user_id
  const { data: customer } = await supabase
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (!customer) {
    // Log to dead-letter for manual replay
    console.error(
      `No customer found for stripe_customer_id: ${subscription.customer}. Logging to dead_letter.`
    );
    try {
      await supabase.from('webhook_dead_letter').insert({
        event_type: 'customer.subscription.updated',
        stripe_object_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        reason: 'no_customer_mapping',
        payload: { subscription_id: subscription.id, customer: subscription.customer },
      });
    } catch {
      // Don't fail the webhook if dead-letter insert fails
    }
    return;
  }

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: customer.user_id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
      stripe_current_period_end: new Date(
        (subscription.items.data[0]?.current_period_end ?? 0) * 1000
      ).toISOString(),
      stripe_cancel_at_period_end: subscription.cancel_at_period_end,
      status: safeSubscriptionStatus(subscription.status),
    }, { onConflict: 'stripe_subscription_id' });
}

async function syncPrice(
  supabase: ReturnType<typeof createAdminClient>,
  price: Stripe.Price
) {
  // Look up the product in our DB
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('stripe_product_id', price.product as string)
    .single();

  if (!product) {
    console.error(
      `No product found for stripe_product_id: ${price.product}`
    );
    return;
  }

  await supabase.from('prices').upsert({
    product_id: product.id,
    stripe_price_id: price.id,
    unit_amount: price.unit_amount ?? 0,
    currency: price.currency,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? 1,
    active: price.active,
    metadata: price.metadata as Record<string, string>,
  }, { onConflict: 'stripe_price_id' });
}
