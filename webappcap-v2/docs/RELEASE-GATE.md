# WebAppCap v2 — Release Gate

Status: **migração funcional, de domínios e da branch `main` concluída.**

Estado confirmado em 11/09/2026:
- `webappcap.com.br` e `www.webappcap.com.br` servem a plataforma v2.
- `capellari.webappcap.com.br` serve o portfólio nativo publicado.
- `*.webappcap.com.br` está vinculado ao projeto v2.
- Projetos de teste e o domínio Fábio foram removidos.
- Rascunho, preview, publicação, login/logout, leads, exclusão e layouts desktop/mobile foram homologados.
- A branch `main` recebeu a versão homologada pelo PR #20 em 11/09/2026.
- A branch `backup/main-before-webappcap-v2-2026-09-11` preserva o ponto de restauração anterior.

## 1. Segurança e isolamento
- [x] Acesso de projeto resolvido server-side por usuário + projeto.
- [x] Capacidades verificadas nas server actions antes de conteúdo, mídia, aparência, domínio e publicação.
- [x] Upload limitado a JPG/PNG/WebP/GIF, 10 MB e assinatura binária válida.
- [x] Endpoint público de leads valida tipo de request, payload, projeto publicado, honeypot e limite básico por IP/projeto.
- [x] Conteúdo público separado do rascunho.
- [x] Publicação valida onboarding, segmento/modelo e conteúdo mínimo.

## 2. Regressão funcional concluída
- [x] Login owner e logout.
- [x] Salvar Conteúdo e confirmar alteração somente no Preview.
- [x] Upload e troca de mídia.
- [x] Alterar Aparência e conferir Preview.
- [x] Publicar e confirmar sincronização rascunho → público.
- [x] Enviar lead real pelo site publicado e confirmar em Leads.
- [x] Confirmar `capellari.webappcap.com.br` no desktop e mobile.
- [x] Confirmar a raiz comercial em `webappcap.com.br` e `www.webappcap.com.br`.

## 3. Domínios
- [x] Automação Vercel configurada no projeto v2.
- [x] Wildcard transferido e tenant inexistente validado com resposta 404.
- [x] Endereço canônico do portfólio definido como `capellari.webappcap.com.br`.
- [x] Alias histórico redirecionado para o endereço canônico.
- [ ] Homologar attach/verify/remove de domínio externo quando um projeto futuro precisar desse recurso.

## 4. Resultado da migração
1. `main` é a branch oficial de produção.
2. `webappcap.com.br` e `www.webappcap.com.br` servem a raiz comercial.
3. `*.webappcap.com.br` resolve projetos publicados.
4. `capellari.webappcap.com.br` é o endereço canônico do portfólio.
5. O projeto legado e a branch de backup permanecem temporariamente como rollback.

## 5. Critério de conclusão
Concluído em 12/09/2026: CI/Vercel verdes, regressão homologada e produção controlada pela `main`, sem falhas conhecidas de isolamento, publicação, leads ou roteamento.
