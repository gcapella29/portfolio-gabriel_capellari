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

## Blocos concluídos

### Bloco 1 — Core
Contratos tipados, segmentos/templates separados, permissões, Supabase server/browser, sessão, projeto e roteamento autenticado.

### Bloco 2 — Onboarding
Owner → projeto/segmento → convite → senha → template compatível → identidade → conteúdo → fotos → aparência → contato → endereço → revisão → Preview → Publicar → Dashboard.

### Bloco 3 — CMS pós-publicação
Navegação reduzida a Início, Conteúdo, Fotos, Aparência, Leads e Configurações. Preview, Ver site e Publicar são ações globais. `project_v2_content` é rascunho; `project_v2_public_content` é produção.

### Bloco 4 — Renderer nativo
O Personal Trainer — Performance é o primeiro renderer React nativo da v2. Preview e produção usam o mesmo componente. Conteúdo do segmento permanece independente do design, preparando a troca futura entre modelos sem recadastro.

### Bloco 5 — Produção, hosts e domínios
O middleware classifica o hostname antes da renderização. `*.webappcap.com.br` e domínios próprios são reescritos para uma única rota pública `_tenant`, que resolve exatamente um projeto publicado e usa o mesmo registry de templates do Preview.

Subdomínio WebAppCap é resolvido por `native_subdomain`. Domínio próprio só é servido quando `domain_status=active`; o Dashboard oferece verificação DNS. Índices únicos impedem dois projetos de reivindicarem o mesmo subdomínio ou domínio próprio.

Esse desenho remove a antiga resolução concorrente de host e evita o flash de outro projeto antes do site correto.

## Dados v2

- `project_v2_state`: segmento, template, lifecycle, onboarding e domínio.
- `project_v2_content`: rascunho atual.
- `project_v2_public_content`: snapshot publicado.
- `webappcap-v2-sites`: mídia dos novos projetos.

## Migrações necessárias

Aplicar em ordem:

1. `supabase/migrations/001_core_v2.sql`
2. `supabase/migrations/002_onboarding_v2.sql`
3. `supabase/migrations/003_published_content_v2.sql`
4. `supabase/migrations/004_public_template_state_v2.sql`
5. `supabase/migrations/005_domain_integrity_v2.sql`

As migrações são aditivas e não substituem o conteúdo do Portfólio legado.

## Variáveis de ambiente

Obrigatórias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Domínio próprio:
- `WEBAPPCAP_DOMAIN_CNAME` — alvo CNAME esperado; padrão `cname.vercel-dns.com`.
- `WEBAPPCAP_DOMAIN_TXT` — token TXT opcional.

## Gate de produção

Antes do merge em `main`, validar em Preview Deployment:

Owner cria projeto → convite → senha → onboarding → template → conteúdo → preview → subdomínio → publicação → site público → dashboard → edição → republicação.

Depois testar domínio próprio com DNS real e confirmar que host desconhecido retorna 404, projeto não publicado não é exposto e o Portfólio legado continua idêntico.

A v2 permanece em `webappcap-v2/` e na branch `refactor/webappcap-core-v2` até esse gate ser aprovado. Não fazer merge automático em produção sem a validação humana do fluxo.
