# Revisão de padronização do WebAppCap

Escopo: navegação do painel, editores compartilhados e por template, biblioteca de modelos, aparência, catálogo, mídia, pedidos, analytics, equipe, domínio, conta e área do owner. Revisão estática dos componentes e caminhos, com verificações locais das alterações. Não equivale a uma auditoria visual de todas as páginas em navegador real nem a um teste de produção/Supabase.

## Corrigido

- Nomes dos templates: pedidos e cards do owner consultam a definição central. Modern deixa de ser chamado de “Site completo” ou “Modelo completo”; Clássico, Padaria e Venda rápida preservam seus nomes. Referências desconhecidas têm fallback explícito.
- Rascunho versus preview: telas de aparência e editores indicam “no rascunho” e “Aplicar ao rascunho”. Visualizar um template sem salvar continua separado de aplicá-lo.
- Acesso a Modelos: leitores podem visualizar a biblioteca; a aplicação permanece protegida por editAppearance na interface e na Server Action. Nenhuma permissão de gravação foi ampliada.
- Comparação de modelos da Loja Digital direciona à biblioteca atual. Demais segmentos mantêm o laboratório existente.
- Preview do editor: foco inicial em Fechar, retorno ao controle de origem, ciclo de Tab nos controles externos, Escape, bloqueio de rolagem e fundo inert enquanto aberto. Cleanup restaura o estado anterior. Mudanças do pai não reiniciam o iframe por alteração da identidade do callback.
- Toolbar do preview pode quebrar em linhas nas larguras intermediárias e tem foco visível explícito.
- Menu desktop em janelas baixas permite rolagem interna, mantendo as ações inferiores acessíveis. Em altura normal permanece fixo.
- Troca de senha captura o formulário antes da operação assíncrona, trata exceções e sempre libera o estado ocupado. Mensagens usam alert/status.

## Preservado

CSS e composição dos sites públicos aprovados, catálogo e dados compartilhados, snapshots de rascunho/publicação e publicação atômica. Rotas históricas não foram excluídas. Nenhum trabalho no Personal Trainer.

## Merece atenção em próximos blocos

- Há camadas acumuladas de overrides em globals.css e nos módulos do painel. Não removi regras em massa sem comparação visual, pois isso pode regredir projetos antigos. Consolidação deve vir com screenshots por página e breakpoint.
- A aposentadoria de Venda rápida ainda tem condições específicas para o slug Vet-se. Uma política central de disponibilidade e compatibilidade de templates precisa definir como tratar outros projetos já publicados antes de substituir essas condições.
- Diálogos de exclusão do owner ainda têm implementação própria e merecem o mesmo padrão de foco/rolagem em um bloco específico. O preview contém iframe: teclado dentro da página incorporada pertence ao seu documento; Escape e Tab devem ser testados também com foco dentro dele em navegador real.
- O Modern não expõe todos os controles visuais do editor genérico de Aparência. A composição dele permanece protegida conforme a referência aprovada; não prometemos aplicação de campos que ele não consome.
- As migrações de pedidos 023/024 continuam pendentes de confirmação de aplicação no Supabase remoto. As ações verificadas mantêm autenticação, escopo de projeto e validação de permissões no servidor; isso não substitui auditoria completa de RLS e infraestrutura.

## Validação e roteiro manual

Typecheck, 33 testes e build local. Checagem de DOM em StrictMode do preview: foco, ciclo Tab, Escape, preservação do iframe após rerender e restauração de overflow ao fechar/desmontar. Essa checagem não mede layout real.

1. Abrir o editor em desktop, janela baixa e mobile; alcançar salvar, Configurações, Trocar projeto e Sair.
2. Abrir Preview pelo teclado, alternar Desktop/Mobile, Atualizar e fechar; conferir foco de retorno, fundo bloqueado e rolagem restaurada. Repetir com foco dentro do iframe.
3. Visualizar Modern sem aplicar, conferir que o rascunho não mudou, depois aplicar e conferir os rótulos. Publicar somente se desejar mudar o site público.
4. Conferir pedidos históricos e cards do owner com os nomes corretos dos modelos.
5. Trocar a senha com dados válidos, testar confirmação divergente e falha de conexão; conferir mensagem e botão liberado.
6. Conferir editor/viewer: pode visualizar Modelos, mas não pode aplicar/publicar. Owner/admin mantém aplicação autorizada.
