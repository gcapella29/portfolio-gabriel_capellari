# Revisão técnica geral — 02/10/2026

Branch: `chore/code-quality-audit`, baseada na main após o PR #115. Correções agrupadas; PR #116 mergeado após CI e preview aprovados. O fechamento das pendências está em `docs/audit-follow-up-2026-10-02.md`.

## Correções

- **Salvar rascunho:** formulário de conteúdo geral, Personal Trainer, Institucional e Padaria agora enviam todas as seções juntas em um único UPDATE. A inicialização usa `ignoreDuplicates`, preservando o conteúdo existente. Formulários completos passam de 8–10 operações de escrita para 2, com um único cliente Supabase. Nenhum campo do formulário é gravado antes de terminar a validação. Uploads continuam separados do UPDATE.
- **Padaria/pedidos:** produtos ativos preservam o índice original do catálogo publicado. Itens desativados e registros malformados não deslocam a referência enviada à API. O editor mantém o campo `active` ao salvar.
- **Carrinho:** Padaria restaura apenas quantidades inteiras de 1 a 999 e uma assinatura idêntica do catálogo. Mudança de catálogo descarta referências posicionais antigas. Carrinhos antigos sem assinatura são descartados uma vez para não atribuir produtos incorretos. Preview possui armazenamento separado e não registra pedidos. Os modelos Clássico e Vendas também limitam quantidades a 999.
- **Histórico de pedidos:** consultas atual e legada em paralelo; erros reais do banco são propagados. A compatibilidade com tabela ainda ausente permanece, sem fingir que uma falha de permissão é um histórico vazio.
- **Analytics:** leitura de sessionStorage protegida; cliques em links dentro de Shadow DOM usam `composedPath`. Listeners removidos no unmount.
- **APIs:** JSON null/array é rejeitado em analytics, telemetria e pedidos. Pedidos validam UUID antes da consulta. Leads exigem ao menos 8 dígitos no telefone. Limitador compartilhado mantém as cotas existentes, limita a memória a 10 mil chaves por rota e evita varredura repetida enquanto nenhuma janela pode expirar.
- **Mídia:** Personal Trainer preserva metadados de Storage ao editar imagens existentes e rejeita substituições não cadastradas ou caminhos com segmentos de navegação. Remoção compartilhada de mídia valida esses segmentos também.
- **Publicação/acesso:** mensagem correta para WhatsApp incompleto; erro ao carregar estado não vira configuração padrão. Autenticação e acesso deduplicados por requisição React, sem cache global de usuários. Leituras independentes de projetos e status de publicação em paralelo. RPC de publicação atômica preservado.
- **Interações:** carrossel da raiz agrupa medições de scroll por frame. Portfólio tolera localStorage bloqueado, cancela timer de compartilhamento e pausa autoplay em segundo plano. Raiz respeita movimento reduzido. Foco inicial, Tab/Shift+Tab, contenção e restauração de foco nos diálogos dos modelos Clássico, Vendas e Padaria.
- **Dependências/CSS:** Next permanece em 15.5.25; PostCSS compartilhado e corrigido em 8.5.28, com override específico para Next e lockfile validado por npm ci. Alinhamentos CSS normalizados para flex-end; sem redesenho de modelos.

## Validação local

- `npm run typecheck`: aprovado.
- `npm test`: 66 testes aprovados, incluindo gravação conjunta, falhas do banco, histórico legado, carrinho e limites de requisições.
- `npm run build`: aprovado.
- `npm audit`: zero vulnerabilidades conhecidas nesta execução.
- Simulações DOM: carrossel da raiz, navegação/modal institucional, ações institucional e trainer, analytics com storage bloqueado/Shadow DOM e foco de diálogos; aprovadas.
- HTTP sobre build de produção: raiz 200; seis payloads inválidos em analytics, telemetria e pedidos retornaram 400.

As simulações usam adaptadores para banco/DOM; não substituem teste visual em navegador real ou acesso ao Supabase de produção. Nenhum pedido, lead ou publicação real foi enviado nesta revisão.

## Testes manuais para homologação

1. Em cada editor, mudar texto e enquadramento de imagem; salvar, recarregar e conferir o preview. O site publicado só deve mudar após publicar.
2. Visualizar outro modelo sem aplicar; verificar que o rascunho continua com o modelo anterior. Depois aplicar ao rascunho e conferir os dados compartilhados.
3. Padaria: desativar o primeiro produto, pedir outro e verificar o nome/quantidade no histórico. Recarregar carrinho, alterar/reordenar catálogo e confirmar que nenhum item é transferido para outro produto.
4. Antes/depois do trainer: editar textos, reordenar resultados, salvar e conferir imagens e enquadramentos.
5. Percorrer diálogos com teclado, fechar com Escape e conferir a volta do foco. Conferir desktop, Android e Safari/iPhone.
6. Na raiz: carrossel por toque/setas; formulário de contato e chegada em Leads. Nos modelos com Shadow DOM: WhatsApp/Instagram e métricas de cliques.
7. Conferir histórico atual/legado, acesso de owner/admin/editor/viewer e publicação com/sem WhatsApp válido, usando projetos de teste.

## Pontos que ainda merecem atenção

- Rate limiting em memória funciona por instância; uma cota global entre instâncias exige infraestrutura compartilhada.
- Uploads feitos antes de uma falha no salvamento podem deixar arquivos sem referência. Limpeza futura precisa respeitar snapshots publicados.
- Builds dependem da disponibilidade das fontes remotas; eventual adoção de fontes locais exige conferir os arquivos e a aparência.
- Modelos em Shadow DOM montam o conteúdo no cliente; SEO/primeiro render podem exigir uma rodada específica, preservando isolamento e visual.
- O script antigo `lint` usa `next lint`; configuração de ESLint fica para uma rodada própria. Os checks utilizados aqui são typecheck, testes e build.
- RLS, migrações aplicadas, domínios personalizados e envio real de contatos/pedidos precisam de homologação no ambiente configurado.
