-- WebAppCap v2 public host resolver.
-- Resolve published tenant sites without depending on table-level RLS visibility
-- for anonymous requests arriving on customer subdomains/custom domains.

create or replace function public.resolve_v2_public_site(requested_host text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with normalized as (
    select lower(trim(trailing '.' from split_part(split_part(coalesce(requested_host,''),'://',2), '/', 1))) as host
  ),
  normalized_fallback as (
    select case
      when host = '' then lower(trim(trailing '.' from split_part(coalesce(requested_host,''), '/', 1)))
      else host
    end as host
    from normalized
  ),
  target as (
    select
      p.id,
      p.slug,
      p.name,
      p.site_type,
      s.segment,
      s.template_key,
      s.lifecycle,
      s.native_subdomain,
      s.custom_domain,
      s.domain_status,
      c.identity,
      c.content,
      c.media,
      c.appearance,
      c.contact
    from public.projects p
    join public.project_v2_state s on s.project_id = p.id
    join public.project_v2_public_content c on c.project_id = p.id
    cross join normalized_fallback n
    where p.is_published = true
      and p.archived_at is null
      and s.lifecycle = 'published'
      and s.template_key is not null
      and (
        (
          n.host like '%.webappcap.com.br'
          and lower(s.native_subdomain) = lower(left(n.host, length(n.host) - length('.webappcap.com.br')))
        )
        or (
          s.custom_domain is not null
          and s.domain_status = 'active'
          and lower(s.custom_domain) = n.host
        )
      )
    limit 1
  )
  select to_jsonb(target) from target;
$$;

revoke all on function public.resolve_v2_public_site(text) from public;
grant execute on function public.resolve_v2_public_site(text) to anon, authenticated;
