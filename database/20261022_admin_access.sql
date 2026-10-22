begin;
create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create or replace function app_private.is_mandal_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a
    join auth.users u on lower(a.email) = lower(u.email)
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;
revoke all on function app_private.is_mandal_admin() from public, anon;
grant execute on function app_private.is_mandal_admin() to authenticated;

alter table public.admin_users enable row level security;
drop policy if exists admin_users_access_policy on public.admin_users;
create policy admin_users_verified_admin on public.admin_users
for all to authenticated
using ((select app_private.is_mandal_admin()))
with check ((select app_private.is_mandal_admin()));
commit;
