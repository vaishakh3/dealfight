alter table public.submissions
  add column review_status text not null default 'pending'
    constraint submissions_review_status_valid check (review_status in ('pending', 'approved', 'rejected')),
  add column dodo_checkout_session_id text,
  add column dodo_payment_id text,
  add column payment_received_cents bigint
    constraint submissions_payment_received_nonnegative check (payment_received_cents is null or payment_received_cents >= 0),
  add column paid_at timestamptz,
  add column last_payment_event_id text;

create unique index submissions_dodo_checkout_session_unique_idx
  on public.submissions (dodo_checkout_session_id)
  where dodo_checkout_session_id is not null;

create unique index submissions_dodo_payment_unique_idx
  on public.submissions (dodo_payment_id)
  where dodo_payment_id is not null;

create index submissions_published_rank_idx
  on public.submissions (target_bid_cents desc, paid_at asc)
  where status = 'paid' and review_status = 'approved';
