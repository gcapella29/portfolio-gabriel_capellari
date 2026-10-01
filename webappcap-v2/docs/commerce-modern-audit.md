# Auditoria técnica — commerce-modern-1

Data: 2026-10-01. Branch: `feat/commerce-modern-1`. Base auditada: `3cd8fbdea013bd5b7eb0d79fb3110f8060ea5c1b`.

## Correções

- Modern não chamava o histórico de pedidos. Agora usa a API existente, envia referências originais dos produtos e inclui nome/telefone no drawer e na mensagem de WhatsApp. Preview explícito não grava pedidos.
- Clássico e Venda rápida enviavam índices da lista filtrada por produtos ativos. Um produto desativado podia deslocar o pedido para outro produto no banco. Os três modelos agora preservam índices do catálogo original, inclusive quando existem entradas inválidas.
- localStorage era escrito antes da restauração e aceitava quantidades arbitrárias. A gravação aguarda a restauração, valida quantidades inteiras entre 1 e 999 e separa preview de publicado. O carrinho é invalidado quando o catálogo muda; carrinhos antigos sem assinatura são descartados por segurança. Não são persistidos nome/telefone.
- IntersectionObserver rodava antes da montagem do portal. Agora observa o conteúdo montado e reage à visibilidade de seções, com fallback quando indisponível.
- Timeout de assets e timers/frames do pulso do carrinho agora são limpos. Montagem e limpeza do Shadow DOM foram verificadas em StrictMode.
- Nunito passa a registrar suas declarações de fonte no documento, com referência compartilhada e limpeza. O CSS visual e a estrutura continuam isolados no Shadow DOM. Propriedades tipográficas herdáveis são definidas na raiz interna.
- Âncoras internas usam scrollIntoView dentro do Shadow DOM. Bloqueio de rolagem do drawer/lightbox usa overflow real do body e restaura o valor anterior; a antiga classe lock não era estilizada fora do Shadow DOM.
- Foco do drawer consulta ShadowRoot.activeElement, inclui inputs, mantém Tab/Shift+Tab e retorna ao botão do carrinho ao fechar. Drawer fechado usa inert/aria-hidden. Imagens ampliáveis recebem operação por teclado. O X do lightbox mantém posicionamento absoluto.
- Indicador do carrossel calcula colunas pelo tamanho/gap real, responde a resize e evita atualizações de estado quando a faixa não muda.
- prefers-reduced-motion agora cobre marquee, skeleton, entradas, hover/transições e rolagem; mantém enquadramento estático das imagens.
- Preços/promoções dos destaques acompanham o catálogo em vez de valores fixos. Produtos de destaque têm fallback para itens reais quando as categorias da referência não existem.
- Campos Modern de título/introdução dos destaques e contato abaixo do catálogo passam a ser usados. Mensagens configuráveis de WhatsApp, visibilidade de catálogo/carrinho/Instagram/Sobre e enquadramento/zoom de imagens são respeitados.
- Campos do quadro lateral removido e campos sem efeito no Modern deixam de aparecer nesse editor. Os dados anteriores permanecem preservados. Textos do editor identificam Modern corretamente fora da Vet-se.
- Modern recebe definição de editor e defaults com sua própria chave. Publicação não exige uma tagline do Clássico que o Modern não renderiza. Título automático do preview de comércio deixa de usar “Portfólio profissional”.
- Removido CSS Module sem imports; mantido commerce-modern-source.css como referência original. Removida duplicação da regra comum de centralização dos X, preservando o CSS visual existente e suas camadas de ajustes.
- Parser monetário compartilhado corrige R$ 1.234,56 e rejeita valores não finitos. Quantidades inválidas de promoção deixam de divergir do cálculo SQL.
- API rejeita integralmente referências inválidas, fracionárias, duplicadas ou fora dos limites em vez de registrar um subconjunto. Suporta até 1000 produtos distintos por pedido, com até 999 unidades de cada.
- Migração **024_validate_commerce_order_references.sql** reforça a função existente contra índice/quantidade ausentes/nulos, duplicatas e produtos desativados. Migração 023 permanece intacta para instalações onde já foi aplicada. Preços e promoções continuam reconstruídos exclusivamente do catálogo publicado.
- Falha de rede no tracking é capturada, preservando o fluxo de WhatsApp existente.

## Arquitetura conferida

Visualizar com `?template=` somente escolhe um renderer compatível/ready e não grava dados. Aplicar grava apenas `appearance.preview_template_key` no rascunho com verificação de acesso/permissão. Catálogo, contato, mídia e conteúdo permanecem na mesma linha de dados. Publicar continua chamando `publish_v2_project_atomic`: snapshot público, estado e visibilidade são publicados juntos. Leitura pública usa o snapshot publicado e a chave publicada; preview usa o rascunho. Invalidadores de cache existentes foram preservados.

A biblioteca continua limitada ao segmento Loja Digital neste estágio. O editor próprio do Personal Trainer deverá ser registrado quando seu React for recebido, sem reaproveitar automaticamente a estrutura de Comércio. A exceção preexistente que oculta Venda rápida da Vet-se foi mantida; não foram adicionadas exceções por cliente.

## Validação

- `npm run typecheck`: aprovado.
- `npm test`: **33 testes aprovados**.
- `npm run build`: aprovado. Avisos preexistentes de Autoprefixer sobre `start/end` em CSS de catálogo/owner/padaria; sem falha de compilação.
- PostgreSQL local via PGlite: migrações 023/024 executadas em schema mínimo; promoções e separador de milhar corretos; 15 casos de payload inválido/inativo/duplicado/modelo divergente/projeto não publicado rejeitados sem criar pedidos.
- DOM simulado via Happy DOM com o componente React real: StrictMode monta uma única raiz, limpa fonte/efeitos, restaura carrinho, invalida catálogo reordenado, respeita visibilidade, aplica promoções e mantém foco/Tab/Escape no Shadow DOM.
- Browser real: bloqueado por restrições locais de processo/socket. Happy DOM **não comprova layout, fontes renderizadas, hidratação no navegador ou comportamento real do dialog**. Não há aprovação visual automática.
- Supabase remoto não foi acessado para aplicar migrações ou criar pedidos; publicação e autenticação reais dependem dos testes abaixo.

## Atenção antes de merge

1. Aplicar 023 se ainda pendente e depois 024 no ambiente de banco apropriado antes de testar/publicar o fluxo novo. Nenhuma migração foi aplicada remotamente nesta revisão.
2. Validar visual desktop/mobile, especialmente os dois campos novos no drawer, enquadramento compartilhado e carregamento efetivo da Nunito. Estrutura, estilos originais e composição foram preservados; dados antes ignorados agora podem mudar o conteúdo/enquadramento exibido.
3. API pública ainda não possui rate limiting/idempotência. Cliques repetidos podem gerar pedidos repetidos e tracking permanece best effort: falha no histórico não impede abertura do WhatsApp. Não foi alterado esse contrato de checkout.
4. Referências no servidor continuam posicionais. Uma aba já aberta durante uma republicação que reordene o catálogo deve ser recarregada antes de enviar. A assinatura evita restauração incorreta ao recarregar; resolver também abas antigas exigirá IDs estáveis/versionamento de catálogo na arquitetura de pedidos.
5. O tracking existente é suprimido em localhost, previews e domínios .vercel.app. Confirmar histórico no domínio publicado próprio, não no preview da Vercel.
6. Conteúdo demonstrativo original do template permanece nos fallbacks. Campos reais devem estar preenchidos para outras lojas; esta auditoria não redesenhou nem criou um novo sistema de curadoria de destaques.

## Roteiro manual

1. Em Modelos, abrir Modern via Visualizar; verificar que modelo do rascunho/publicado e dados não mudam.
2. Aplicar Modern ao rascunho; editar textos exclusivos, contato, imagens e mensagens; salvar/reabrir preview. Confirmar que o site publicado continua Clássico até Publicar.
3. Alternar Clássico/Modern; conferir catálogo, categorias, promoções, produtos inativos, imagens, contatos e dados institucionais preservados.
4. No Modern desktop/mobile: conferir duas linhas, cartões quadrados, setas, contador, última coluna ímpar, busca vazia/sem resultados, categorias ordenadas e uma categoria chamada Todos.
5. Abrir imagens pelo mouse e Enter/Espaço; fechar pelo X e Escape. Abrir drawer, mudar quantidade, remover, navegar com Tab/Shift+Tab e conferir foco ao fechar. Testar carrinho cheio em celular/teclado virtual e tela baixa.
6. Adicionar produtos, recarregar e conferir persistência. Reordenar/desativar catálogo, publicar e recarregar: carrinho antigo deve ser limpo. Dados inválidos no localStorage não devem quebrar a página.
7. Testar promoções para 1/2/3/4 unidades, preços com milhar, ausência de WhatsApp e nome/telefone incompletos. Conferir mensagem personalizada e totals.
8. No domínio publicado próprio, enviar pedido contendo produto após um desativado; conferir nome, telefone, produto, quantidade, promoção, total e chave Modern no histórico. Preview não deve criar pedidos.
9. Desativar e reativar cada bloco no editor e conferir site/links. Testar Nunito, navegação entre seções e preferência de movimento reduzido.
10. Publicar após aprovação visual; conferir snapshot e repetir envio no domínio real. Só depois considerar merge.

Sem merge e sem implementação do Personal Trainer.
