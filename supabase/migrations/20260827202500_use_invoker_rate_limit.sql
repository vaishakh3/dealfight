grant select, insert, update, delete on table dealfight_private.request_rate_limits
  to anon;

create policy request_rate_limits_server_select
on dealfight_private.request_rate_limits for select
to anon
using ((select dealfight_private.request_is_authorized()));

create policy request_rate_limits_server_insert
on dealfight_private.request_rate_limits for insert
to anon
with check ((select dealfight_private.request_is_authorized()));

create policy request_rate_limits_server_update
on dealfight_private.request_rate_limits for update
to anon
using ((select dealfight_private.request_is_authorized()))
with check ((select dealfight_private.request_is_authorized()));

create policy request_rate_limits_server_delete
on dealfight_private.request_rate_limits for delete
to anon
using ((select dealfight_private.request_is_authorized()));

create or replace function public.consume_dealfight_rate_limit(
  p_bucket text,
  p_fingerprint text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security invoker
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

  delete from dealfight_private.request_rate_limits
  where window_started_at < statement_timestamp() - interval '2 days';

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
