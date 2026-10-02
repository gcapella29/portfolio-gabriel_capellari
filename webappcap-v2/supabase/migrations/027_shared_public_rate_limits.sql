-- Optional shared quotas across Vercel instances. Only trusted server routes can consume them.
create table if not exists public.webappcap_rate_limits (
  key text primary key check (key ~ '^[0-9a-f]{64}$'),
  hits integer not null check (hits > 0),
  expires_at timestamptz not null
);
create index if not exists webappcap_rate_limits_expiry on public.webappcap_rate_limits(expires_at);
alter table public.webappcap_rate_limits enable row level security;
revoke all on public.webappcap_rate_limits from public, anon, authenticated;

create or replace function public.webappcap_consume_rate_limit(p_key text,p_limit integer,p_window_seconds integer default 60)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_now timestamptz := clock_timestamp();
  v_hits integer;
begin
  if p_key is null or p_key !~ '^[0-9a-f]{64}$'
     or p_limit is null or p_limit < 1 or p_limit > 1000
     or p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 3600 then
    raise exception 'invalid rate limit parameters';
  end if;
  -- Bounded cleanup: no cron dependency, no raw visitor identifiers.
  delete from public.webappcap_rate_limits where key in (
    select key from public.webappcap_rate_limits where expires_at <= v_now
    order by expires_at limit 100 for update skip locked
  );
  insert into public.webappcap_rate_limits(key,hits,expires_at)
  values(p_key,1,v_now+make_interval(secs=>p_window_seconds))
  on conflict (key) do update set
    hits=case when webappcap_rate_limits.expires_at<=v_now then 1
         else least(webappcap_rate_limits.hits+1,p_limit+1) end,
    expires_at=case when webappcap_rate_limits.expires_at<=v_now
         then v_now+make_interval(secs=>p_window_seconds) else webappcap_rate_limits.expires_at end
  returning hits into v_hits;
  return v_hits<=p_limit;
end;
$$;
revoke all on function public.webappcap_consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.webappcap_consume_rate_limit(text,integer,integer) to service_role;
