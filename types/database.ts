export interface Database {
  /**
   * The `__InternalSupabase` key is required by the Supabase SSR client type system.
   * It is used by `Omit<Database, '__InternalSupabase'>` to extract the schema.
   * Do not use this key at runtime — it's purely a type marker.
   */
  __InternalSupabase: unknown;
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          trial_starts_at: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          trial_starts_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          trial_starts_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string | null;
          stripe_current_period_end: string | null;
          stripe_cancel_at_period_end: boolean;
          status: SubscriptionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id?: string | null;
          stripe_current_period_end?: string | null;
          stripe_cancel_at_period_end?: boolean;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string | null;
          stripe_current_period_end?: string | null;
          stripe_cancel_at_period_end?: boolean;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          stripe_product_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stripe_product_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stripe_product_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          stripe_price_id: string;
          unit_amount: number;
          currency: string;
          interval: BillingInterval | null;
          interval_count: number;
          active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          stripe_price_id: string;
          unit_amount: number;
          currency?: string;
          interval?: BillingInterval | null;
          interval_count?: number;
          active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          stripe_price_id?: string;
          unit_amount?: number;
          currency?: string;
          interval?: BillingInterval | null;
          interval_count?: number;
          active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      retailers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          source: DealSource;
          affiliate_base_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          source?: DealSource;
          affiliate_base_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          source?: DealSource;
          affiliate_base_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          retailer_id: string;
          product_id: string | null;
          title: string;
          description: string | null;
          image_url: string | null;
          product_url: string;
          original_price: string;
          sale_price: string;
          discount_percent: string;
          currency: string;
          source: DealSource;
          source_hash: string;
          is_active: boolean;
          is_featured: boolean;
          is_urgent: boolean;
          starts_at: string | null;
          ends_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          product_id?: string | null;
          title: string;
          description?: string | null;
          image_url?: string | null;
          product_url: string;
          original_price: string;
          sale_price: string;
          discount_percent?: string;
          currency?: string;
          source?: DealSource;
          source_hash: string;
          is_active?: boolean;
          is_featured?: boolean;
          is_urgent?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          product_id?: string | null;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          product_url?: string;
          original_price?: string;
          sale_price?: string;
          discount_percent?: string;
          currency?: string;
          source?: DealSource;
          source_hash?: string;
          is_active?: boolean;
          is_featured?: boolean;
          is_urgent?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_deals: {
        Row: {
          id: string;
          user_id: string;
          deal_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          deal_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deal_id?: string;
          created_at?: string;
        };
      };
      deal_alerts: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          min_discount: string | null;
          max_price: string | null;
          retailer_id: string | null;
          frequency: AlertFrequency;
          is_active: boolean;
          last_triggered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          min_discount?: string | null;
          max_price?: string | null;
          retailer_id?: string | null;
          frequency?: AlertFrequency;
          is_active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          min_discount?: string | null;
          max_price?: string | null;
          retailer_id?: string | null;
          frequency?: AlertFrequency;
          is_active?: boolean;
          last_triggered_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deal_clicks: {
        Row: {
          id: string;
          deal_id: string;
          user_id: string | null;
          retailer_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          user_id?: string | null;
          retailer_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          user_id?: string | null;
          retailer_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          clicked_at?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
      };
    };
  };
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused';

export type BillingInterval = 'day' | 'week' | 'month' | 'year';

export type DealSource =
  | 'amazon'
  | 'bestbuy'
  | 'walmart'
  | 'target'
  | 'costco'
  | 'ebay'
  | 'other';

export type AlertFrequency = 'instant' | 'daily' | 'weekly';

export interface Json {
  [key: string]: unknown;
}


