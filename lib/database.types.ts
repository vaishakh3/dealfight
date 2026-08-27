export type Database = {
  public: {
    Tables: {
      engagement_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: number;
          offer_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: never;
          offer_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: never;
          offer_id?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          amount_due_cents: number;
          category: string;
          coupon_code: string;
          created_at: string;
          discount_percent: number;
          email: string;
          fight_price_cents: number;
          id: string;
          dodo_checkout_session_id: string | null;
          dodo_payment_id: string | null;
          last_payment_event_id: string | null;
          list_price_cents: number;
          normalized_url: string;
          paid_at: string | null;
          payment_received_cents: number | null;
          product_name: string;
          product_url: string;
          review_status: string;
          status: string;
          tagline: string;
          target_bid_cents: number;
          updated_at: string;
        };
        Insert: {
          amount_due_cents: number;
          category: string;
          coupon_code: string;
          created_at?: string;
          discount_percent: number;
          email: string;
          fight_price_cents: number;
          id?: string;
          dodo_checkout_session_id?: string | null;
          dodo_payment_id?: string | null;
          last_payment_event_id?: string | null;
          list_price_cents: number;
          normalized_url: string;
          paid_at?: string | null;
          payment_received_cents?: number | null;
          product_name: string;
          product_url: string;
          review_status?: string;
          status?: string;
          tagline: string;
          target_bid_cents: number;
          updated_at?: string;
        };
        Update: {
          amount_due_cents?: number;
          category?: string;
          coupon_code?: string;
          created_at?: string;
          discount_percent?: number;
          email?: string;
          fight_price_cents?: number;
          id?: string;
          dodo_checkout_session_id?: string | null;
          dodo_payment_id?: string | null;
          last_payment_event_id?: string | null;
          list_price_cents?: number;
          normalized_url?: string;
          paid_at?: string | null;
          payment_received_cents?: number | null;
          product_name?: string;
          product_url?: string;
          review_status?: string;
          status?: string;
          tagline?: string;
          target_bid_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
