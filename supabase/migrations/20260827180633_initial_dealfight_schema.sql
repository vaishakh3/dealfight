create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  product_name text not null constraint submissions_product_name_length check (char_length(product_name) between 2 and 60),
  product_url text not null constraint submissions_product_url_length check (char_length(product_url) between 8 and 400),
  normalized_url text not null constraint submissions_normalized_url_length check (char_length(normalized_url) between 8 and 400),
  email text not null constraint submissions_email_length check (char_length(email) between 3 and 160),
  tagline text not null constraint submissions_tagline_length check (char_length(tagline) between 8 and 140),
  list_price_cents bigint not null constraint submissions_list_price_positive check (list_price_cents > 0),
  fight_price_cents bigint not null constraint submissions_fight_price_valid check (fight_price_cents > 0 and fight_price_cents < list_price_cents),
  discount_percent smallint not null constraint submissions_discount_valid check (discount_percent between 10 and 100),
  coupon_code text not null constraint submissions_coupon_length check (char_length(coupon_code) between 3 and 32),
  category text not null constraint submissions_category_valid check (category in ('AI', 'Design', 'Dev tools', 'Marketing', 'Productivity', 'Ecommerce')),
  target_bid_cents bigint not null constraint submissions_target_bid_valid check (target_bid_cents between 500 and 100000000),
  amount_due_cents bigint not null constraint submissions_amount_due_valid check (amount_due_cents >= 0 and amount_due_cents <= target_bid_cents),
  status text not null default 'pending_payment' constraint submissions_status_valid check (status in ('pending_payment', 'paid', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.engagement_events (
  id bigint generated always as identity primary key,
  offer_id text not null constraint engagement_events_offer_id_valid check (offer_id ~ '^[a-z0-9-]{2,80}$'),
  event_type text not null constraint engagement_events_type_valid check (event_type in ('claim', 'click', 'share')),
  created_at timestamptz not null default now()
);

create index submissions_paid_url_bid_idx
  on public.submissions (normalized_url, target_bid_cents desc)
  where status = 'paid';

create index submissions_status_created_idx
  on public.submissions (status, created_at desc);

create index engagement_events_offer_type_idx
  on public.engagement_events (offer_id, event_type);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

alter table public.submissions enable row level security;
alter table public.engagement_events enable row level security;

revoke all on table public.submissions from anon, authenticated;
revoke all on table public.engagement_events from anon, authenticated;
revoke all on sequence public.engagement_events_id_seq from anon, authenticated;

grant select, insert, update on table public.submissions to service_role;
grant select, insert on table public.engagement_events to service_role;
grant usage, select on sequence public.engagement_events_id_seq to service_role;
