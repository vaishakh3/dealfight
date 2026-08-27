alter table public.submissions
  rename column payment_received_cents to payment_received_minor;

alter table public.submissions
  drop constraint if exists submissions_payment_received_nonnegative;

alter table public.submissions
  add constraint submissions_payment_received_minor_nonnegative
    check (payment_received_minor is null or payment_received_minor >= 0),
  add column payment_currency text
    constraint submissions_payment_currency_iso4217
      check (payment_currency is null or payment_currency ~ '^[A-Z]{3}$'),
  add column settlement_amount_minor bigint
    constraint submissions_settlement_amount_minor_nonnegative
      check (settlement_amount_minor is null or settlement_amount_minor >= 0),
  add column settlement_currency text
    constraint submissions_settlement_currency_iso4217
      check (settlement_currency is null or settlement_currency ~ '^[A-Z]{3}$');

comment on column public.submissions.payment_received_minor is
  'Total charged to the customer, including tax, in payment_currency minor units.';

comment on column public.submissions.payment_currency is
  'ISO 4217 currency used for the customer charge.';

comment on column public.submissions.settlement_amount_minor is
  'Amount credited to the Dodo balance in settlement_currency minor units.';

comment on column public.submissions.settlement_currency is
  'ISO 4217 currency used for Dodo settlement.';
