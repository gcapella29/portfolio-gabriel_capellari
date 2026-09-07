# WebAppCap v2 — Próximos passos após estabilização

Este documento registra a sequência recomendada após o bloco curto de estabilização concluído em setembro de 2026. O objetivo é evitar nova refatoração estrutural sem necessidade e avançar de plataforma funcional para produto comercial homologado.

## Fase A — Fechar o Portfolio nativo

Objetivo: transformar `portfolio-native-1` de renderer em homologação para template publicável.

Checklist:

- comparar `/native-preview/portfolio` com o portfólio atual em desktop e mobile;
- revisar português e inglês;
- validar troca de idioma e persistência de preferência;
- validar galeria/carrossel, swipe e teclado;
- validar CV, links externos, redes sociais e compartilhamento;
- validar lead capture;
- revisar foco, navegação por teclado, alt texts e `prefers-reduced-motion`;
- revisar performance de imagens e fontes;
- remover dependências do legado que não sejam necessárias ao renderer nativo;
- somente após aprovação mudar `portfolio-native-1` de `planned` para `ready`.

Não mover `webappcap.com.br` nesta fase.

## Fase B — Provar troca real de template

Objetivo: validar a promessa arquitetural de conteúdo independente do layout.

Usar um projeto Personal Trainer existente e manter exatamente o mesmo conteúdo, mídia e contato enquanto são criados:

- `trainer-performance-1`;
- `trainer-template-2`;
- `trainer-template-3`.

Critério de sucesso: trocar apenas `template_key` deve produzir três experiências visuais distintas sem exigir recadastro dos dados centrais do cliente.

Evitar campos específicos de template sempre que o dado representar conteúdo do negócio. Campos realmente exclusivos de layout devem ficar em `appearance` ou em configuração de template bem delimitada.

## Fase C — Segundo segmento comercial

Objetivo: provar que a arquitetura não está acoplada a Portfolio/Personal Trainer.

Segmento recomendado: `food-business`.

Antes do renderer, definir o modelo de conteúdo do segmento, incluindo quando aplicável:

- produtos/cardápio;
- preço;
- categorias;
- horários;
- localização;
- delivery/WhatsApp;
- galeria;
- avaliações/prova social;
- CTAs.

Critério de sucesso: o core multi-tenant, publicação, domínio, mídia e leads devem permanecer inalterados. Mudanças devem se concentrar no schema extensível de conteúdo e nos templates do segmento.

## Fase D — Domínio personalizado E2E

Objetivo: homologar a automação já implementada.

Usar um domínio/subdomínio descartável fora de `webappcap.com.br` e validar:

attach -> DNS -> verify -> HTTPS -> tenant routing -> replace/remove -> detach.

Registrar qualquer diferença real entre a API da Vercel e o estado esperado pelo código antes de considerar a funcionalidade comercialmente pronta.

## Fase E — Auditoria de segurança e isolamento

Executar uma rodada específica tentando quebrar o isolamento entre tenants.

Casos mínimos:

- usuário do projeto A tentando ler/escrever projeto B;
- acesso direto a rotas internas por slug de outro cliente;
- uploads em pasta de outro projeto;
- leitura de leads de outro projeto;
- chamadas RPC com `project_id` não autorizado;
- ações owner acessadas por cliente comum;
- revisão das funções `SECURITY DEFINER` e `search_path`;
- revisão de RLS das tabelas v2 e do bucket de mídia.

O objetivo é encontrar falhas, não apenas confirmar happy paths.

## Fase F — Homologação comercial

Executar um projeto novo do zero como se fosse cliente real e medir o processo:

Owner cria cliente -> convite -> onboarding -> conteúdo -> fotos -> aparência -> preview -> publicação -> lead.

Meta operacional: reduzir o tempo e a fricção para colocar um site simples no ar sem intervenção técnica.

Registrar pontos em que o usuário depende do Owner para concluir algo que deveria conseguir fazer sozinho.

## Fase G — Gate de migração

Somente depois das fases anteriores:

- inventariar todos os subdomínios legados;
- executar regressão final;
- testar rollback;
- decidir destino permanente do projeto v2 na Vercel;
- avaliar movimentação de `*.webappcap.com.br`;
- manter o apex separado até o Portfolio nativo estar formalmente aceito;
- decidir merge para `main` separadamente.

Nenhuma dessas operações deve acontecer automaticamente.

## Prioridade resumida

1. Portfolio nativo: homologação e promoção para `ready`.
2. Personal Trainer: templates 2 e 3 e teste real de troca.
3. Food Business: primeiro segundo segmento comercial completo.
4. Domínio personalizado E2E.
5. Auditoria de segurança/isolamento.
6. Homologação comercial ponta a ponta.
7. Migração controlada de wildcard/produção.

## Regra de arquitetura daqui em diante

Evitar nova reconstrução do core enquanto não houver um problema concreto que a justifique. A prioridade agora é usar a arquitetura existente repetidamente e identificar acoplamentos através de casos reais.
