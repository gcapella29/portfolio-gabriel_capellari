# WebAppCap v2 — Production Migration Runbook

> **Status em 28/09/2026:** a aplicação v2 está em produção na branch `main`.
> `webappcap.com.br`, `www.webappcap.com.br` e `*.webappcap.com.br` estão no
> projeto atual. O portfólio está publicado em `capellari.webappcap.com.br` e
> projetos de Loja Digital, como Vet-se, usam a mesma base.
>
> As migrations versionadas atualmente vão de `001` a `021`. Este documento
> preserva o histórico de cutover abaixo, mas o bloco **Estado atual e operação**
> deve ser usado como referência para novas mudanças.

## Estado atual e operação

- Branch oficial de produção: `main`.
- Aplicação: `webappcap-v2`.
- Antes de qualquer merge relevante, execute `npm run check`.
- O CI deve executar `typecheck`, `npm test` e `build`.
- Antes de subir código que dependa de uma migration nova, aplique e valide a
  migration correspondente de forma coordenada para evitar incompatibilidade
  temporária entre banco e aplicação.
- Migrations de produção versionadas: `001`–`021`.
- O fluxo de pedidos usa `commerce_orders`; preços e promoções são reconciliados
  no banco a partir do catálogo publicado.
- Leads públicos exigem consentimento explícito e o RPC de gravação é restrito
  ao servidor confiável.
- A publicação v2 é atômica via `publish_v2_project_atomic`: snapshot público,
  estado/template e `projects.is_published` são confirmados na mesma transação.

### Cache de mídia

Uploads v2 recebem nomes imutáveis com `crypto.randomUUID()` e usam
`upsert:false`. Por isso o `cacheControl: '31536000'` é intencional e seguro:
uma nova imagem gera uma nova URL em vez de substituir o arquivo anterior.
Se no futuro algum fluxo passar a sobrescrever arquivos mantendo a mesma URL,
o cache longo deve ser revisto nesse fluxo específico.

## Histórico de migração / cutover

As etapas abaixo permanecem como registro histórico do processo de migração.
Instruções que descrevem o projeto legado como destino atual não representam
mais o estado de produção.

### Stage 1 — Canary production subdomain

O canary foi usado para validar o comportamento v2 antes do cutover completo.

Validações históricas:
1. renderização do tenant v2;
2. ausência de flash do legado;
3. HTTPS válido;
4. preview/dashboard/login funcionais;
5. publicação pelo CMS;
6. envio de leads;
7. preservação do site legado durante o canary.

### Portfolio compatibility bridge

O projeto `gabriel-capellari` foi migrado para a arquitetura v2 preservando
compatibilidade durante a transição. As migrations `012` e `013` continuam
versionadas como parte do histórico do banco.

### Stage 2 — Custom-domain end-to-end test

Para novos domínios próprios, continue validando:
1. salvar o domínio;
2. anexar via automação da Vercel;
3. configurar DNS;
4. verificar domínio;
5. confirmar HTTPS e roteamento;
6. substituir/remover;
7. confirmar remoção do vínculo antigo.

Nunca exponha `VERCEL_API_TOKEN` ao navegador.

### Stage 3 — Tenant wildcard cutover

O wildcard já está no projeto v2. Para alterações futuras de roteamento,
mantenha inventário dos subdomínios ativos e tenha um rollback de DNS/Vercel
antes de mudanças globais.

### Stage 4 — Main branch / produção

A branch `main` é a fonte de produção. Mudanças devem passar por:
1. teste local;
2. `npm run check`;
3. preview/CI;
4. revisão;
5. merge explícito.

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
- Consentimento de leads
- Pedidos e histórico
- Totais de pedidos reconciliados no servidor
- Mobile and desktop layout
- Portfolio
- Custom-domain provisioning + DNS verification + removal
- Tenant isolation / authorization regression
- Rollback rehearsal

## Production gate

Mudanças de domínio, wildcard, migrations destrutivas, remoção de tabelas,
alterações de autenticação ou mudanças no fluxo de publicação exigem validação
específica antes do merge. Nunca trate um preview isolado como autorização
automática para impacto em produção.
