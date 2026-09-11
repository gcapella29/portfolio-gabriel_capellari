-- Harden WebAppCap v2 public host resolution for legacy/native-subdomain data shapes.
-- Some existing projects may store either the subdomain label or the full hostname.

create or replace function public.resolve_v2_public_site(requested_host text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with input as (
    select lower(trim(trailing '.' from regexp_replace(coalesce(requested_host, ''), '^https?://', ''))) as raw
  ),
  normalized as (
    select split_part(raw, '/', 1) as host
    from input
  ),
  request as (
    select
      host,
      case
        when host like '%.webappcap.com.br'
          then left(host, length(host) - length('.webappcap.com.br'))
        else null
      end as native_label
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
    cross join request r
    where p.is_published = true
      and p.archived_at is null
      and s.lifecycle = 'published'
      and s.template_key is not null
      and (
        (
          r.native_label is not null
          and (
            lower(trim(coalesce(s.native_subdomain, ''))) = r.native_label
            or lower(trim(coalesce(s.native_subdomain, ''))) = r.host
            or lower(trim(coalesce(p.slug, ''))) = r.native_label
          )
        )
        or (
          s.custom_domain is not null
          and s.domain_status = 'active'
          and lower(trim(trailing '.' from regexp_replace(s.custom_domain, '^https?://', ''))) = r.host
        )
      )
    order by
      case
        when lower(trim(coalesce(s.native_subdomain, ''))) = r.native_label then 0
        when lower(trim(coalesce(s.native_subdomain, ''))) = r.host then 1
        when lower(trim(coalesce(p.slug, ''))) = r.native_label then 2
        else 3
      end
    limit 1
  )
  select to_jsonb(target) from target;
$$;

revoke all on function public.resolve_v2_public_site(text) from public;
grant execute on function public.resolve_v2_public_site(text) to anon, authenticated;
