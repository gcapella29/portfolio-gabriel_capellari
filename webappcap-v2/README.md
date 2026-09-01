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
- Supabase Auth/Postgres/RLS/Storage
- Tailwind CSS
- Vercel

## Bloco 1 — Core concluído

A base v2 possui contratos de domínio tipados, registro de segmentos/templates, permissões centralizadas, clientes Supabase server/browser, resolução server-side de sessão e projeto, roteamento determinístico, middleware de proteção, callback de autenticação, hubs de Owner/Dashboard e estado aditivo em `project_v2_state`.

## Bloco 2 — Onboarding concluído

O fluxo guiado está implementado de ponta a ponta na nova arquitetura:

Owner → Novo cliente → segmento + administrador → convite → callback → criação de senha → conta → escolha de modelo → identidade → conteúdo → fotos → aparência → contato → endereço → revisão → Preview → Publicar → Dashboard.

### Decisões de UX

- Owner não escolhe o template visual do cliente; escolhe apenas o segmento.
- O cliente enxerga somente templates compatíveis com seu segmento.
- Modelos ainda não construídos aparecem como `Em breve` e não podem ser aplicados.
- O progresso é salvo no servidor e o usuário nunca é enviado para uma tela genérica de “projeto não selecionado”.
- Etapas já concluídas podem ser revisitadas sem regredir o progresso.
- Preview permanece disponível durante a configuração.
- Subdomínio `*.webappcap.com.br` é nativo e não exige validação manual.
- Domínio próprio entra como `pending` para validação posterior.
- Uploads usam bucket separado `webappcap-v2-sites`, com RLS por projeto.

### Dados

`project_v2_content` separa os dados novos em `identity`, `content`, `media`, `appearance` e `contact`. Nenhum campo do onboarding precisa reutilizar nomes como `wsop`, `coverage` ou `portfolio` de outro segmento.

O Preview atual é estrutural e serve para validar o fluxo/dados. O renderer visual definitivo de cada modelo será construído no Bloco 4.

## Migrações necessárias

Aplicar em ordem:

1. `supabase/migrations/001_core_v2.sql`
2. `supabase/migrations/002_onboarding_v2.sql`

As migrações são aditivas e não substituem o conteúdo do Portfólio legado.

## Fluxo obrigatório antes do merge na produção

Owner cria projeto → convite → criação de senha → onboarding → escolha de template → preenchimento → preview → domínio → publicação → dashboard → edição → republicação.

A v2 permanece em `webappcap-v2/` e na branch `refactor/webappcap-core-v2` até o fluxo inteiro ser validado.
