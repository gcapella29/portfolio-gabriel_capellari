# WebAppCap v2

Nova base da plataforma, isolada do renderer legado do portfólio.

## Princípios

1. O Portfólio legado permanece intacto até a migração ser explicitamente aprovada.
2. Segmento e template são entidades diferentes: um segmento pode oferecer vários templates.
3. O projeto define o segmento; o cliente escolhe um template compatível no onboarding.
4. Conteúdo é estruturado por segmento, nunca por nomes herdados de outro projeto.
5. Preview e Publicar são ações globais, não áreas concorrentes.
6. Projeto, usuário e destino são resolvidos antes de renderizar a tela, evitando flashes e rotas ambíguas.
7. Subdomínios WebAppCap são infraestrutura nativa; domínio próprio passa por validação separada.

## Stack

- Next.js + React + TypeScript
- Supabase Auth/Postgres/RLS
- Tailwind CSS
- Vercel

## Bloco 1 — Core concluído

A base v2 agora possui contratos de domínio tipados, registro de segmentos/templates, permissões centralizadas, clientes Supabase server/browser, resolução server-side de sessão e projeto, roteamento determinístico, middleware de proteção, callback de autenticação, hubs iniciais de Owner/Dashboard, rota guardada de onboarding e uma migração SQL aditiva `project_v2_state`.

O schema v2 é aditivo: usa `projects` e `project_members` existentes como identidade/permissão e guarda apenas o estado novo em `project_v2_state`. O Portfólio atual é registrado como `portfolio-legacy-1` com onboarding concluído, sem alterar seu renderer público.

### Regra de entrada

- sem sessão → `/login`
- Owner → `/owner/projects`
- cliente com um projeto e onboarding pendente → etapa exata em `/setup/...`
- cliente com onboarding concluído → `/dashboard/...`
- sem acesso → `/unauthorized`

Nenhuma página deve renderizar uma interface de outro contexto antes de redirecionar.

## Fluxo obrigatório antes do merge na produção

Owner cria projeto → convite → criação de senha → onboarding → escolha de template → preenchimento → preview → domínio → publicação → dashboard → edição → republicação.

A v2 permanece em `webappcap-v2/` e na branch `refactor/webappcap-core-v2` até o fluxo inteiro ser validado.
