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

Owner → Novo cliente → segmento + administrador → convite → callback → criação de senha → conta → escolha de modelo → identidade → conteúdo → fotos → aparência → contato → endereço → revisão → Preview → Publicar → Dashboard.

O cliente vê somente templates compatíveis com o segmento; etapas concluídas podem ser revisitadas sem regredir o progresso; Preview permanece disponível; subdomínio WebAppCap é nativo; domínio próprio entra como pendente; uploads usam bucket dedicado com RLS.

## Bloco 3 — CMS pós-publicação concluído

O cliente passa a ter uma navegação única e pequena:

- Início
- Conteúdo
- Fotos
- Aparência
- Leads
- Configurações

`Preview`, `Ver site` e `Publicar` são ações globais da barra superior e não páginas concorrentes. O Dashboard mostra modelo, endereço, última publicação e se existem alterações pendentes.

### Rascunho x produção

`project_v2_content` é sempre o rascunho editável. A publicação copia o snapshot inteiro para `project_v2_public_content`. Portanto, salvar Conteúdo/Fotos/Aparência não muda o site público; somente `Publicar` promove o rascunho atual. O Preview continua lendo o rascunho.

Leads continuam usando `site_leads`, agora dentro da navegação v2 e respeitando a capacidade `viewLeads`.

## Bloco 4 — Renderer de templates concluído

A renderização pública deixou de depender de scripts que alteram HTML depois da página carregar. Existe agora um registry explícito em `src/templates/registry.tsx`: o projeto resolve `segment + templateKey` e entrega o mesmo conjunto de dados ao componente visual correspondente.

### Personal Trainer · Modelo 1 — Performance

`trainer-performance-1` é o primeiro renderer nativo da v2. Ele reconstrói a linguagem visual aprovada do Fitness em React/CSS Modules, sem `fitness-public-enhancer`, sem `coverage`, sem `wsop` e sem módulos herdados do Portfólio.

O modelo possui navbar, hero comercial, prova/diferenciais, acompanhamento, resultados, agenda, método, apresentação profissional, credenciais, CTA final e CTA móvel. Se uma seção não possui dados reais, ela é omitida sempre que possível; CREF e credenciais nunca são inventados.

O CMS de Personal Trainer ganhou campos próprios (`trainer_*`) para especialidade, CREF, serviços, resultados, agenda, método e credenciais. Esses dados pertencem ao segmento e não ao template, permitindo que futuros Modelos 2 e 3 consumam exatamente o mesmo conteúdo.

O Preview e a rota pública `/site/[slug]` usam o mesmo renderer. A diferença é apenas a fonte de dados: Preview lê `project_v2_content` (rascunho) e o site público lê `project_v2_public_content` (snapshot publicado).

O renderer também consome os tokens seguros de Aparência: cor de destaque, fonte de títulos, fonte de texto, escala, alinhamento e densidade, sem permitir que a personalização quebre a responsividade do modelo.

## Dados v2

- `project_v2_state`: segmento, template, lifecycle, onboarding e domínio.
- `project_v2_content`: rascunho atual (`identity`, `content`, `media`, `appearance`, `contact`).
- `project_v2_public_content`: snapshot publicado.
- `webappcap-v2-sites`: mídia dos novos projetos.

Nenhum conteúdo novo precisa reutilizar nomes herdados como `wsop`, `coverage` ou `portfolio`.

## Migrações necessárias

Aplicar em ordem:

1. `supabase/migrations/001_core_v2.sql`
2. `supabase/migrations/002_onboarding_v2.sql`
3. `supabase/migrations/003_published_content_v2.sql`
4. `supabase/migrations/004_public_template_state_v2.sql`

As migrações são aditivas e não substituem o conteúdo do Portfólio legado.

## Fluxo obrigatório antes do merge na produção

Owner cria projeto → convite → criação de senha → onboarding → escolha de template → preenchimento → preview → domínio → publicação → dashboard → edição → republicação.

A v2 permanece em `webappcap-v2/` e na branch `refactor/webappcap-core-v2` até o fluxo inteiro ser validado.
