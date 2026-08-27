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
      payment_refunds: {
        Row: {
          amount_minor: number | null;
          created_at: string;
          currency: string | null;
          is_partial: boolean;
          last_event_at: string;
          last_event_id: string;
          payment_id: string;
          provider_created_at: string;
          reason: string | null;
          refund_id: string;
          status: string;
          submission_id: string;
          updated_at: string;
        };
        Insert: {
          amount_minor?: number | null;
          created_at?: string;
          currency?: string | null;
          is_partial: boolean;
          last_event_at: string;
          last_event_id: string;
          payment_id: string;
          provider_created_at: string;
          reason?: string | null;
          refund_id: string;
          status: string;
          submission_id: string;
          updated_at?: string;
        };
        Update: {
          amount_minor?: number | null;
          created_at?: string;
          currency?: string | null;
          is_partial?: boolean;
          last_event_at?: string;
          last_event_id?: string;
          payment_id?: string;
          provider_created_at?: string;
          reason?: string | null;
          refund_id?: string;
          status?: string;
          submission_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_refunds_submission_id_fkey';
            columns: ['submission_id'];
            isOneToOne: false;
            referencedRelation: 'submissions';
            referencedColumns: ['id'];
          },
        ];
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
          payment_currency: string | null;
          payment_received_minor: number | null;
          product_name: string;
          product_url: string;
          review_status: string;
          settlement_amount_minor: number | null;
          settlement_currency: string | null;
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
          payment_currency?: string | null;
          payment_received_minor?: number | null;
          product_name: string;
          product_url: string;
          review_status?: string;
          settlement_amount_minor?: number | null;
          settlement_currency?: string | null;
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
          payment_currency?: string | null;
          payment_received_minor?: number | null;
          product_name?: string;
          product_url?: string;
          review_status?: string;
          settlement_amount_minor?: number | null;
          settlement_currency?: string | null;
          status?: string;
          tagline?: string;
          target_bid_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      consume_dealfight_rate_limit: {
        Args: {
          p_bucket: string;
          p_fingerprint: string;
          p_max_requests: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
