# WebAppCap v2 — Production Migration Runbook

> **Status em 12/09/2026:** migração de domínios e integração com `main` concluídas. A raiz
> `webappcap.com.br`, `www.webappcap.com.br` e o wildcard `*.webappcap.com.br`
> estão no projeto v2; o portfólio está publicado em
> `capellari.webappcap.com.br`. O projeto Fábio e seu domínio foram removidos.
> A branch oficial de produção é `main`. As etapas abaixo permanecem como histórico e plano de rollback; instruções
> que mandam manter apex ou wildcard no projeto legado não representam mais o
> estado atual.

## Current safety boundary

- Keep `main` unchanged until the final cutover is explicitly approved.
- Keep the legacy Vercel project serving `webappcap.com.br` and `www.webappcap.com.br` during the migration stages.
- Keep the wildcard `*.webappcap.com.br` on the legacy project until the tenant migration gate is approved.
- Keep `webappcap-v2-preview` on branch `refactor/webappcap-core-v2`, root directory `webappcap-v2`, Framework Preset `Next.js`.
- Supabase migrations 001–013 must be reviewed/applied as required for the current environment before final homologation.
- Do not move apex, wildcard or merge the v2 branch merely because an isolated preview works.

## Stage 1 — Canary production subdomain

Assign only `fabio-ferrari.webappcap.com.br` to `webappcap-v2-preview`.

Expected behavior:

- `webappcap.com.br` remains on the legacy project.
- `www.webappcap.com.br` remains on the legacy project.
- wildcard remains on the legacy project.
- only `fabio-ferrari.webappcap.com.br` reaches v2.

Validate:

1. `fabio-ferrari.webappcap.com.br` renders the v2 Personal Trainer site.
2. No flash of the legacy portfolio before render.
3. HTTPS certificate is valid.
4. Preview/dashboard/login continue to work on the v2 Vercel URL.
5. Publish from CMS updates the public Fabio site.
6. Public lead submission succeeds and the lead appears in the project dashboard.
7. `webappcap.com.br` still renders the legacy Gabriel portfolio unchanged.

Rollback for Stage 1:

- Remove/move `fabio-ferrari.webappcap.com.br` back to the legacy project.
- Do not change DNS records if Vercel already owns/serves the apex domain.

## Portfolio compatibility bridge

The existing `gabriel-capellari` project can be rendered by v2 with the
`portfolio-legacy-1` template before the apex domain is moved. Migration 012
only creates the missing v2 state/content rows; it does not delete or rewrite
legacy snapshots.

Validate the bridge first at `/preview/gabriel-capellari` while authenticated,
then at `/site/gabriel-capellari` after publishing. Keep the apex domain on the
legacy Vercel project until visual parity, links, language switching, downloads,
mobile behavior and SEO redirects have all been accepted.

Bridge rollback:

- Restore the project's previous `template_key` if it had one.
- Keep all legacy tables, files and the legacy Vercel project unchanged.
- No domain or wildcard rollback is needed because this stage does not move them.

## Portfolio native snapshot

After the compatibility bridge is validated, migration 013 copies the current
portfolio into the v2 draft and public snapshots without changing the active
`portfolio-legacy-1` renderer. Existing v2 keys take precedence, so rerunning the
migration does not erase later CMS edits.

Validate the isolated React renderer at `/native-preview/portfolio`. This route
must render `portfolio-native-1` directly and must remain `noindex` during
homologation. Do not change the project's active `template_key` from
`portfolio-legacy-1` to `portfolio-native-1` until desktop/mobile parity,
language switching, links, downloads, media, lead capture and accessibility are
accepted.

Templates marked `planned` are not publishable. Promote `portfolio-native-1` to
`ready` only after the acceptance review is complete.

## Stage 2 — Custom-domain end-to-end test

Before marketing custom domains as complete, validate one disposable external
domain or subdomain outside `webappcap.com.br` through the full lifecycle:

1. save the custom domain in project settings;
2. attach it to the v2 Vercel project through server-side automation;
3. configure the DNS records returned/required by Vercel;
4. verify the domain;
5. confirm HTTPS and tenant routing;
6. replace or remove it;
7. confirm the old Vercel binding is detached.

Never expose `VERCEL_API_TOKEN` to the browser.

## Stage 3 — Tenant wildcard cutover

Only after the canary, custom-domain test and regression gate pass, consider
moving `*.webappcap.com.br` from the legacy project to the v2 project.

Expected behavior:

- tenant subdomains route to v2 through middleware and `/tenant`;
- apex `webappcap.com.br` remains on the legacy project;
- `www.webappcap.com.br` remains on the legacy project.

Before moving wildcard, inventory every currently used legacy subdomain. Any
legacy subdomain without a published v2 project may stop resolving to a valid
tenant site after the cutover.

Rollback for Stage 3:

- Move `*.webappcap.com.br` back to the legacy project.
- Leave Supabase state unchanged; routing rollback is enough to restore legacy traffic.

## Stage 4 — Main branch / permanent v2 project

Do not merge the v2 branch to `main` merely to move tenant traffic. First decide whether:

1. `webappcap-v2-preview` becomes the permanent tenant project, or
2. the v2 app is promoted into a new permanent Vercel project / repository structure.

The legacy apex portfolio can remain isolated until the native portfolio renderer
has passed its own migration gate.

## Final acceptance checks

- Owner login/logout
- Client/admin login
- New client creation
- Invite/password flow
- Onboarding
- Media upload and invalid-file rejection
- Draft vs published separation
- Preview
- Publish / republish
- Planned-template publication rejection
- Native subdomain
- Leads from public site to dashboard
- Mobile and desktop layout
- Portfolio legacy bridge
- Portfolio native isolated preview
- Custom-domain provisioning + DNS verification + removal
- Tenant isolation / authorization regression
- Legacy subdomain inventory
- Rollback rehearsal

## Explicit production gate

No wildcard move, apex move, destructive legacy cleanup or `main` merge is
implicitly authorized by this runbook. Those operations require an explicit
production-impact approval after the acceptance checks above are complete.
