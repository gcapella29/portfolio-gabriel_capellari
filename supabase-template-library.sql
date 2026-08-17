-- WebAppCap · Persistent Template Library
-- Run once in Supabase SQL Editor.

create table if not exists public.platform_templates (
  key text primary key,
  name text not null,
  site_type text not null,
  description text not null default '',
  visual text not null default '',
  color text not null default '#ffffff',
  chips jsonb not null default '[]'::jsonb,
  layout jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id)
);

alter table public.platform_templates enable row level security;

drop policy if exists "platform templates authenticated read" on public.platform_templates;
create policy "platform templates authenticated read"
on public.platform_templates for select
to authenticated
using (true);

drop policy if exists "platform templates owner insert" on public.platform_templates;
create policy "platform templates owner insert"
on public.platform_templates for insert
to authenticated
with check (
  exists (
    select 1 from public.projects p
    where p.slug = 'gabriel-capellari' and p.owner_id = auth.uid()
  )
);

drop policy if exists "platform templates owner update" on public.platform_templates;
create policy "platform templates owner update"
on public.platform_templates for update
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.slug = 'gabriel-capellari' and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.slug = 'gabriel-capellari' and p.owner_id = auth.uid()
  )
);

drop policy if exists "platform templates owner delete" on public.platform_templates;
create policy "platform templates owner delete"
on public.platform_templates for delete
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.slug = 'gabriel-capellari' and p.owner_id = auth.uid()
  )
);

create index if not exists platform_templates_site_type_idx
on public.platform_templates(site_type, is_active);
