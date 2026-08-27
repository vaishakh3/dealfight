create table dealfight_private.request_rate_limits (
  bucket text not null
    constraint request_rate_limits_bucket_length check (char_length(bucket) between 2 and 40),
  fingerprint text not null
    constraint request_rate_limits_fingerprint_sha256 check (fingerprint ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null
    constraint request_rate_limits_count_positive check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (bucket, fingerprint, window_started_at)
);

alter table dealfight_private.request_rate_limits enable row level security;

revoke all on table dealfight_private.request_rate_limits
  from public, anon, authenticated, service_role;

create index request_rate_limits_cleanup_idx
  on dealfight_private.request_rate_limits (window_started_at);

create function public.consume_dealfight_rate_limit(
  p_bucket text,
  p_fingerprint text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
  current_window timestamptz;
begin
  if char_length(p_bucket) not between 2 and 40
    or p_fingerprint !~ '^[a-f0-9]{64}$'
    or p_max_requests not between 1 and 10000
    or p_window_seconds not between 10 and 86400 then
    raise exception 'Invalid rate limit parameters';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from statement_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into dealfight_private.request_rate_limits (
    bucket,
    fingerprint,
    window_started_at,
    request_count
  ) values (
    p_bucket,
    p_fingerprint,
    current_window,
    1
  )
  on conflict (bucket, fingerprint, window_started_at)
  do update set
    request_count = dealfight_private.request_rate_limits.request_count + 1,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_max_requests;
end;
$$;

revoke execute on function public.consume_dealfight_rate_limit(text, text, integer, integer)
  from public, anon, authenticated, service_role;

grant execute on function public.consume_dealfight_rate_limit(text, text, integer, integer)
  to anon;

comment on table dealfight_private.request_rate_limits is
  'Fixed-window request counters keyed by a server-generated HMAC; raw client IPs are never stored.';
