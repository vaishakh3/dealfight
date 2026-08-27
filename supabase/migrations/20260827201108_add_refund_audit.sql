create table public.payment_refunds (
  refund_id text primary key
    constraint payment_refunds_id_length check (char_length(refund_id) between 8 and 120),
  submission_id uuid not null references public.submissions (id) on delete restrict,
  payment_id text not null
    constraint payment_refunds_payment_id_length check (char_length(payment_id) between 8 and 120),
  amount_minor bigint
    constraint payment_refunds_amount_nonnegative check (amount_minor is null or amount_minor >= 0),
  currency text
    constraint payment_refunds_currency_iso4217 check (currency is null or currency ~ '^[A-Z]{3}$'),
  is_partial boolean not null,
  status text not null
    constraint payment_refunds_status_valid check (status in ('pending', 'succeeded', 'failed', 'review')),
  reason text
    constraint payment_refunds_reason_length check (reason is null or char_length(reason) <= 3000),
  provider_created_at timestamptz not null,
  last_event_id text not null
    constraint payment_refunds_event_id_length check (char_length(last_event_id) between 8 and 160),
  last_event_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_refunds_submission_created_idx
  on public.payment_refunds (submission_id, provider_created_at desc);

create index payment_refunds_payment_created_idx
  on public.payment_refunds (payment_id, provider_created_at desc);

create trigger payment_refunds_set_updated_at
before update on public.payment_refunds
for each row execute function public.set_updated_at();

alter table public.payment_refunds enable row level security;

revoke all on table public.payment_refunds
  from public, anon, authenticated, service_role;

grant select, insert, update on table public.payment_refunds
  to service_role;

grant select, insert, update on table public.payment_refunds
  to anon;

create policy payment_refunds_server_select
on public.payment_refunds for select
to anon
using ((select dealfight_private.request_is_authorized()));

create policy payment_refunds_server_insert
on public.payment_refunds for insert
to anon
with check ((select dealfight_private.request_is_authorized()));

create policy payment_refunds_server_update
on public.payment_refunds for update
to anon
using ((select dealfight_private.request_is_authorized()))
with check ((select dealfight_private.request_is_authorized()));

comment on table public.payment_refunds is
  'Signed Dodo refund outcomes linked to Deal Fight submissions. Full successful refunds unpublish the associated listing.';
