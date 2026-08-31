# WebAppCap — Bloco A (Fases 12–14)

## Fase 12 — Domínios e publicação

A rota permanente de todo projeto é `/p/<slug>`. Ela continua funcionando mesmo quando nenhum domínio próprio está ativo e deve ser tratada como fallback operacional.

Para subdomínios WebAppCap, a infraestrutura da Vercel deve aceitar `*.webappcap.com.br`. Isso é uma configuração única da plataforma. Cada projeto salva apenas o label do subdomínio (`cliente`, por exemplo), nunca uma URL completa.

Para domínio próprio, o hostname deve ser adicionado ao projeto WebAppCap na Vercel e o DNS deve ser configurado conforme os registros mostrados pela própria Vercel. Não fixe IPs ou CNAMEs no código: a Vercel é a fonte de verdade para os registros exigidos.

Estados de domínio:

- `unconfigured`: sem hostname configurado;
- `pending`: hostname salvo, ainda não promovido para produção;
- `active`: hostname validado operacionalmente e usado como URL pública preferencial.

Enquanto estiver `pending`, o painel de Publicação pode abrir o hostname com `?webappcap_validate=<slug>`. O renderer aceita esse modo apenas quando o hostname realmente corresponde ao projeto solicitado. Isso permite validar o projeto antes de promovê-lo a `active`.

A migration `supabase-block-a-phases-12-14.sql` adiciona unicidade case-insensitive e RPCs autenticados para configuração/ativação de domínio. Owner/Admin são os únicos perfis autorizados.

## Fase 13 — Templates independentes

`platform_templates` é a biblioteca global. Alterar uma entrada da biblioteca não altera automaticamente projetos já existentes.

Cada aplicação de template grava:

1. uma cópia da estrutura/tema no `project_drafts.snapshot`;
2. uma atribuição em `project_template_assignments`, incluindo chave, versão e snapshot do padrão aplicado.

A tela de Templates mostra apenas padrões compatíveis com o tipo do projeto. Alias legados são normalizados (`journalist → editorial`, `language_teacher → educator`, `local_business → local`, `personal_trainer → personal_trainer`).

Atualizar um template da biblioteca apenas oferece uma nova versão ao projeto. O projeto só muda quando Owner/Admin escolhe aplicar/atualizar explicitamente.

## Fase 14 — Experiência por perfil

Contrato de acesso esperado:

- Owner: administração completa do projeto e funções de plataforma permitidas;
- Admin: administração do projeto, sem assumir propriedade da plataforma;
- Editor: conteúdo, mídia, Preview, histórico de leitura e publicação; sem domínio/equipe/templates/analytics/leads;
- Viewer: Preview e site público, sem escrita/publicação/histórico administrativo.

A segurança real permanece no Supabase (RLS/RPC/Edge Functions). Ocultar botões ou redirecionar rotas é apenas UX.

## Homologação do Bloco A

Antes do merge:

1. Executar `supabase-block-a-phases-12-14.sql` no Supabase.
2. Owner/Admin: abrir Templates e confirmar que só aparecem templates do tipo do projeto.
3. Aplicar/reaplicar um template; confirmar que conteúdo/fotos permanecem e o Preview muda apenas em estrutura/aparência.
4. Publicar e confirmar que `/p/<slug>` continua funcionando.
5. Configurar um subdomínio/domínio de teste, manter `pending`, abrir a validação e só depois marcar `active`.
6. Editor: confirmar edição, mídia, Preview e publicação; negar domínio/equipe/templates/analytics/leads.
7. Viewer: confirmar Preview/site e negar escrita/publicação/histórico/leads/analytics.
8. Testar pelo menos dois projetos de tipos diferentes para confirmar isolamento de template e tenant.
