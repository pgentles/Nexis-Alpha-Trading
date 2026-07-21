import { NextRequest, NextResponse } from 'next/server';
import { stripe, getURL } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // CSRF: Validate Origin header matches expected origin (exact match)
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const normalizedOrigin = origin?.replace(/\/$/, '');
    const normalizedExpected = expectedOrigin.replace(/\/$/, '');
    if (!normalizedOrigin || normalizedOrigin !== normalizedExpected) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting: 5 checkout attempts per minute per IP
    const { allowed, remaining } = checkRateLimit(
      getRateLimitKey(request, 'checkout'),
      5,
      60 * 1000
    );
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { price_id } = await request.json();

    if (!price_id) {
      return NextResponse.json(
        { error: 'Missing price_id' },
        { status: 400 }
      );
    }

    // Validate price_id against the prices table using admin client
    const adminSupabase = createAdminClient();
    const { data: priceRecord } = await adminSupabase
      .from('prices')
      .select('stripe_price_id')
      .eq('stripe_price_id', price_id)
      .eq('active', true)
      .single();

    if (!priceRecord) {
      return NextResponse.json(
        { error: 'Invalid or inactive price' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const { data: customer, error: customerError } = await adminSupabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Error fetching customer:', customerError);
    }

    let stripeCustomerId: string | undefined = customer?.stripe_customer_id;

    // Create a new Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          user_id: user.id,
        },
      });

      stripeCustomerId = newCustomer.id;

      // Save the customer mapping using admin client (bypasses RLS)
      const { error: insertError } = await adminSupabase
        .from('customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
        });

      if (insertError) {
        console.error('Error saving customer mapping:', insertError);
      }
    }

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: user.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${getURL('/dashboard?checkout=success')}`,
      cancel_url: `${getURL('/pricing?checkout=cancelled')}`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
