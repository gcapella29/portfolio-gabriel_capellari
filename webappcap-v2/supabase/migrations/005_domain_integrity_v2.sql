-- WebAppCap v2 tenant-domain integrity.
-- Prevents two active projects from claiming the same WebAppCap subdomain or custom domain.
create unique index if not exists project_v2_state_native_subdomain_unique
  on public.project_v2_state (lower(native_subdomain))
  where native_subdomain is not null and btrim(native_subdomain)<>'';

create unique index if not exists project_v2_state_custom_domain_unique
  on public.project_v2_state (lower(custom_domain))
  where custom_domain is not null and btrim(custom_domain)<>'';

create index if not exists project_v2_state_public_native_lookup
  on public.project_v2_state (lower(native_subdomain), lifecycle)
  where native_subdomain is not null;

create index if not exists project_v2_state_public_custom_lookup
  on public.project_v2_state (lower(custom_domain), domain_status, lifecycle)
  where custom_domain is not null;
