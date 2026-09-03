# WebAppCap v2 — Production Migration Runbook

## Current safety boundary

- Keep `main` unchanged until the final cutover is approved.
- Keep the legacy Vercel project serving `webappcap.com.br` and `www.webappcap.com.br` during the first migration stage.
- Keep the wildcard `*.webappcap.com.br` on the legacy project until the canary subdomain is validated on v2.
- Keep `webappcap-v2-preview` on branch `refactor/webappcap-core-v2`, root directory `webappcap-v2`, Framework Preset `Next.js`.
- Supabase migrations 001–006 must already be applied.

## Stage 1 — Canary production subdomain

Move/assign only `fabio-ferrari.webappcap.com.br` to `webappcap-v2-preview`.

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
6. `webappcap.com.br` still renders the legacy Gabriel portfolio unchanged.

Rollback for Stage 1:

- Remove/move `fabio-ferrari.webappcap.com.br` back to the legacy project.
- Do not change DNS records if Vercel already owns/serves the apex domain.

## Stage 2 — Wildcard cutover

Only after Stage 1 passes, move `*.webappcap.com.br` from the legacy project to the v2 project.

Expected behavior:

- tenant subdomains route to v2 through middleware and `/_tenant`.
- apex `webappcap.com.br` remains on the legacy project.
- `www.webappcap.com.br` remains on the legacy project.

Before moving wildcard, inventory every currently used legacy subdomain. Any legacy subdomain without a published v2 project will return no tenant site after the cutover.

Rollback for Stage 2:

- Move `*.webappcap.com.br` back to the legacy project.
- Leave Supabase state unchanged; routing rollback is enough to restore legacy traffic.

## Stage 3 — Main branch / permanent v2 project

Do not merge the v2 branch to `main` merely to move tenant traffic. First decide whether:

1. `webappcap-v2-preview` becomes the permanent tenant project, or
2. the v2 app is promoted into a new permanent Vercel project / repository structure.

The legacy apex portfolio can stay isolated until a native portfolio renderer or explicit legacy adapter is ready.

## Custom domains

Current v2 code validates DNS and marks `domain_status=active`, but Vercel also needs the customer's domain associated with the tenant project. DNS validation alone is not sufficient.

Before selling custom-domain automation as complete, add/test Vercel project-domain provisioning using a server-side Vercel token and project ID. Never expose the token to the browser.

## Final acceptance checks

- Owner login
- Client/admin login
- New client creation
- Invite/password flow
- Onboarding
- Media upload
- Draft vs published separation
- Preview
- Publish / republish
- Native subdomain
- Leads
- Mobile layout
- Custom-domain provisioning + DNS verification
- Rollback rehearsal
