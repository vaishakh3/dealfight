create schema if not exists dealfight_private;

revoke all on schema dealfight_private from public;

create table dealfight_private.server_api_keys (
  id uuid primary key,
  label text not null constraint server_api_keys_label_length check (char_length(label) between 2 and 80),
  created_at timestamptz not null default now()
);

alter table dealfight_private.server_api_keys enable row level security;

revoke all on table dealfight_private.server_api_keys from public, anon, authenticated, service_role;

create function dealfight_private.request_is_authorized()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from dealfight_private.server_api_keys
    where id::text = coalesce(
      coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb ->> 'x-dealfight-secret',
      ''
    )
  );
$$;

revoke execute on function dealfight_private.request_is_authorized() from public, anon, authenticated, service_role;
grant usage on schema dealfight_private to anon;
grant execute on function dealfight_private.request_is_authorized() to anon;

create function public.check_dealfight_request()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  jwt_role text := coalesce(
    coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb ->> 'role',
    ''
  );
begin
  if jwt_role <> 'anon' then
    return;
  end if;

  if dealfight_private.request_is_authorized() then
    return;
  end if;

  raise sqlstate 'PGRST' using
    message = json_build_object(
      'code', 'DEALFIGHT_DATABASE_UNAUTHORIZED',
      'message', 'A valid server database credential is required.'
    )::text,
    detail = json_build_object(
      'status', 403,
      'headers', json_build_object()
    )::text;
end;
$$;

revoke execute on function public.check_dealfight_request() from public, anon, authenticated, service_role;
grant execute on function public.check_dealfight_request() to authenticator, anon, authenticated, service_role;

alter role authenticator set pgrst.db_pre_request = 'public.check_dealfight_request';
notify pgrst, 'reload config';

grant select, insert, update on table public.submissions to anon;
grant select, insert on table public.engagement_events to anon;
grant usage, select on sequence public.engagement_events_id_seq to anon;

create policy submissions_server_select
on public.submissions for select
to anon
using ((select dealfight_private.request_is_authorized()));

create policy submissions_server_insert
on public.submissions for insert
to anon
with check ((select dealfight_private.request_is_authorized()));

create policy submissions_server_update
on public.submissions for update
to anon
using ((select dealfight_private.request_is_authorized()))
with check ((select dealfight_private.request_is_authorized()));

create policy engagement_events_server_select
on public.engagement_events for select
to anon
using ((select dealfight_private.request_is_authorized()));

create policy engagement_events_server_insert
on public.engagement_events for insert
to anon
with check ((select dealfight_private.request_is_authorized()));

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;
