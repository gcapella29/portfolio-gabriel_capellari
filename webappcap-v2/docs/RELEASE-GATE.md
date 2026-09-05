# WebAppCap v2 — Release Gate

Status: **homologação estrutural pronta; migração de produção bloqueada até aprovação explícita.**

## 1. Segurança e isolamento
- [x] Acesso de projeto resolvido server-side por usuário + projeto.
- [x] Capacidades verificadas nas server actions antes de conteúdo, mídia, aparência, domínio e publicação.
- [x] Upload limitado a JPG/PNG/WebP/GIF, 10 MB e assinatura binária válida.
- [x] Endpoint público de leads valida tipo de request, payload, projeto publicado, honeypot e limite básico por IP/projeto.
- [x] Conteúdo público separado do rascunho.
- [x] Publicação valida onboarding, segmento/modelo e conteúdo mínimo.

## 2. Regressão funcional obrigatória
Executar no `webappcap-v2-preview` antes de qualquer migração:
- [ ] Login owner e logout.
- [ ] Owner abre Fabio e navega por todas as áreas.
- [ ] Salvar Conteúdo e confirmar alteração somente no Preview.
- [ ] Upload de JPG/PNG válido; rejeitar arquivo não-imagem renomeado.
- [ ] Alterar Aparência e conferir Preview.
- [ ] Publicar e confirmar sincronização rascunho → público.
- [ ] Enviar lead real pelo site publicado e confirmar em Leads.
- [ ] Confirmar `fabio-ferrari.webappcap.com.br` no desktop e mobile.
- [ ] Confirmar que `webappcap.com.br` legado permanece inalterado.

## 3. Domínios
- [x] Canary nativo Fabio funcional.
- [x] Automação Vercel configurada no projeto v2.
- [ ] Homologar attach/verify/remove de domínio externo quando houver domínio controlado disponível.
- [ ] Antes do wildcard: inventariar todos os subdomínios atualmente servidos pelo projeto legado.

## 4. Gate de migração
Não executar automaticamente:
1. Não fazer merge em `main`.
2. Não mover `webappcap.com.br` apex.
3. Não remover o wildcard do projeto legado.
4. Somente após regressão acima e inventário, solicitar aprovação explícita para mover `*.webappcap.com.br` ao v2.
5. Manter plano de rollback: wildcard volta ao projeto legado; branch v2 permanece isolada.

## 5. Critério de conclusão
O v2 é candidato a produção quando CI/Vercel estiverem verdes, checklist de regressão estiver concluído e não houver falhas de isolamento, publicação, leads ou roteamento. A migração de infraestrutura continua sendo uma decisão separada e explícita.
