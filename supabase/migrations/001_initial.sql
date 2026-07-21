-- DealVault Initial Schema
-- ==============

-- Custom enum types
CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'unpaid',
  'paused'
);

CREATE TYPE billing_interval AS ENUM ('day', 'week', 'month', 'year');

CREATE TYPE deal_source AS ENUM ('amazon', 'bestbuy', 'walmart', 'target', 'costco', 'ebay', 'other');

CREATE TYPE alert_frequency AS ENUM ('instant', 'daily', 'weekly');

-- ==============
-- users (extends auth.users)
-- ==============
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  trial_starts_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- customers (stripe customer mapping)
-- ==============
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_stripe_customer_id ON public.customers(stripe_customer_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer record"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all customers"
  ON public.customers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- subscriptions
-- ==============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  stripe_current_period_end TIMESTAMPTZ,
  stripe_cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- products
-- ==============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_stripe_product_id ON public.products(stripe_product_id);
CREATE INDEX idx_products_active ON public.products(active);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- prices
-- ==============
CREATE TABLE public.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  unit_amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval billing_interval,
  interval_count INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prices_product_id ON public.prices(product_id);
CREATE INDEX idx_prices_stripe_price_id ON public.prices(stripe_price_id);
CREATE INDEX idx_prices_active ON public.prices(active);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prices are viewable by everyone"
  ON public.prices FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage prices"
  ON public.prices FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- retailers
-- ==============
CREATE TABLE public.retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  source deal_source NOT NULL DEFAULT 'other',
  affiliate_base_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_retailers_slug ON public.retailers(slug);
CREATE INDEX idx_retailers_source ON public.retailers(source);
CREATE INDEX idx_retailers_active ON public.retailers(is_active);

ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Retailers are viewable by everyone"
  ON public.retailers FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage retailers"
  ON public.retailers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- deals
-- ==============
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES public.retailers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  product_url TEXT NOT NULL,
  original_price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2) NOT NULL,
  discount_percent NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE
      WHEN original_price > 0 THEN ROUND(((original_price - sale_price) / original_price) * 100, 2)
      ELSE 0
    END
  ) STORED,
  currency TEXT NOT NULL DEFAULT 'usd',
  source deal_source NOT NULL DEFAULT 'other',
  source_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_retailer_id ON public.deals(retailer_id);
CREATE INDEX idx_deals_product_id ON public.deals(product_id);
CREATE INDEX idx_deals_source ON public.deals(source);
CREATE INDEX idx_deals_is_active ON public.deals(is_active);
CREATE INDEX idx_deals_is_featured ON public.deals(is_featured);
CREATE INDEX idx_deals_is_urgent ON public.deals(is_urgent);
CREATE INDEX idx_deals_discount_percent ON public.deals(discount_percent DESC);
CREATE INDEX idx_deals_sale_price ON public.deals(sale_price);
CREATE INDEX idx_deals_ends_at ON public.deals(ends_at);
CREATE INDEX idx_deals_created_at ON public.deals(created_at DESC);
CREATE INDEX idx_deals_source_hash ON public.deals(source_hash);

-- Full-text search index on title and description
CREATE INDEX idx_deals_search ON public.deals
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals are viewable by everyone"
  ON public.deals FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage deals"
  ON public.deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- saved_deals
-- ==============
CREATE TABLE public.saved_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

CREATE INDEX idx_saved_deals_user_id ON public.saved_deals(user_id);
CREATE INDEX idx_saved_deals_deal_id ON public.saved_deals(deal_id);

ALTER TABLE public.saved_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved deals"
  ON public.saved_deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved deals"
  ON public.saved_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved deals"
  ON public.saved_deals FOR DELETE
  USING (auth.uid() = user_id);

-- ==============
-- deal_alerts
-- ==============
CREATE TABLE public.deal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  min_discount NUMERIC(5, 2),
  max_price NUMERIC(12, 2),
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE SET NULL,
  frequency alert_frequency NOT NULL DEFAULT 'instant',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deal_alerts_user_id ON public.deal_alerts(user_id);
CREATE INDEX idx_deal_alerts_is_active ON public.deal_alerts(is_active);
CREATE INDEX idx_deal_alerts_keyword ON public.deal_alerts USING gin (to_tsvector('english', keyword));

ALTER TABLE public.deal_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON public.deal_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON public.deal_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.deal_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.deal_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ==============
-- deal_clicks (analytics)
-- ==============
CREATE TABLE public.deal_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  retailer_id UUID REFERENCES public.retailers(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deal_clicks_deal_id ON public.deal_clicks(deal_id);
CREATE INDEX idx_deal_clicks_user_id ON public.deal_clicks(user_id);
CREATE INDEX idx_deal_clicks_retailer_id ON public.deal_clicks(retailer_id);
CREATE INDEX idx_deal_clicks_clicked_at ON public.deal_clicks(clicked_at DESC);

ALTER TABLE public.deal_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clicks"
  ON public.deal_clicks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can record a click"
  ON public.deal_clicks FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view all clicks"
  ON public.deal_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = TRUE));

-- ==============
-- updated_at trigger function
-- ==============
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_prices_updated_at
  BEFORE UPDATE ON public.prices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_retailers_updated_at
  BEFORE UPDATE ON public.retailers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_deal_alerts_updated_at
  BEFORE UPDATE ON public.deal_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============
-- handle_new_user trigger
-- Creates a profile row in public.users when a new auth.users row is inserted.
-- Also sets up trial period (7 days).
-- ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, trial_starts_at, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============
-- Helper function to upsert customer
-- ==============
CREATE OR REPLACE FUNCTION public.upsert_customer(
  p_user_id UUID,
  p_stripe_customer_id TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.customers (user_id, stripe_customer_id)
  VALUES (p_user_id, p_stripe_customer_id)
  ON CONFLICT (stripe_customer_id) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============
-- webhook_events (idempotency tracking)
-- ==============
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON public.webhook_events(event_id);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert webhook events"
  ON public.webhook_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role can view webhook events"
  ON public.webhook_events FOR SELECT
  USING (TRUE);

-- ==============
-- customers INSERT/UPDATE policies (defense-in-depth)
-- ==============
CREATE POLICY "Users can insert own customer record"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customer record"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============
-- deal_clicks restricted INSERT policy
-- ==============
DROP POLICY IF EXISTS "Anyone can record a click" ON public.deal_clicks;

CREATE POLICY "Authenticated users can record a click"
  ON public.deal_clicks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==============
-- webhook_dead_letter (failed event tracking for replay)
-- ==============
CREATE TABLE public.webhook_dead_letter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  stripe_object_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  reason TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_dead_letter_unresolved
  ON public.webhook_dead_letter (created_at)
  WHERE resolved_at IS NULL;

ALTER TABLE public.webhook_dead_letter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage dead letter"
  ON public.webhook_dead_letter FOR ALL
  USING (TRUE);
