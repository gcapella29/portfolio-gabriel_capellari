# WebAppCap

Aplicação oficial da plataforma e do primeiro projeto nativo, o portfólio de Gabriel Capellari.

## Produção

- Plataforma: `https://www.webappcap.com.br`
- Portfólio canônico: `https://capellari.webappcap.com.br`
- Branch de produção: `main`
- Root Directory na Vercel: `webappcap-v2`

## Arquitetura

- Next.js App Router, React e TypeScript.
- Supabase Auth, Postgres/RLS e Storage.
- `project_v2_content` guarda o rascunho.
- `project_v2_public_content` guarda o snapshot publicado.
- O middleware separa a plataforma dos hosts de projetos antes da renderização.
- Preview e site publicado usam o mesmo registry de templates.

O produto atual oferece somente o segmento Portfólio. As chaves dos demais segmentos continuam no domínio e no banco para compatibilidade, sem templates selecionáveis ou renderers ativos.

## Migrações

As migrações em `supabase/migrations` são ordenadas e cumulativas. A `014_harden_public_lead_project_state.sql` é o fechamento de segurança da migração e exige que projeto e estado v2 estejam simultaneamente ativos antes de aceitar um lead anônimo.

## Operação

- Owner: `/owner/projects`
- Entrada autenticada: `/entry`
- Editor de projeto: `/dashboard/[slug]/content`
- Preview privado: `/preview/[slug]`
- Renderização pública por host: `/tenant`

Consulte `docs/ARVORE-DEFINITIVA.md` para rotas, permissões, itens preservados e restauração.
