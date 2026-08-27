revoke all on table public.submissions from service_role;
revoke all on table public.engagement_events from service_role;
revoke all on sequence public.engagement_events_id_seq from service_role;

grant select, insert, update on table public.submissions to service_role;
grant select, insert on table public.engagement_events to service_role;
grant usage, select on sequence public.engagement_events_id_seq to service_role;

revoke execute on function public.set_updated_at() from public, anon, authenticated, service_role;
