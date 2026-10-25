# Padrão de integração de modelos

## Antes de implementar

- Analisar todo o React fornecido: componentes, estilos, fontes, assets, animações, estados, breakpoints e dependências. Registrar comportamento e comparar com a referência.
- Tratar a referência como fonte de verdade visual. Não redesenhar nem converter CSS para Tailwind. Preservar o CSS original; correções e refinamentos autorizados ficam isolados e documentados.
- Definir segmento e contrato de dados. Compartilhar identidade, contato e mídia quando tiverem o mesmo significado. Não adaptar um segmento ao catálogo de Comércio por conveniência.
- Distinguir conteúdo compartilhado de textos e apresentação exclusivos. Campos exclusivos usam namespace do modelo; defaults de novos projetos não substituem silenciosamente dados existentes.

## Integração

Registrar modelo em segmentos, registry, contrato e editor. Conferir defaults, redirects, biblioteca, permissões, metadados, estado vazio e dados legados. Modelos incompatíveis ou indisponíveis não podem ser aplicados/publicados.

Quando CSS genérico conflitar com a aplicação, usar isolamento como Shadow DOM. Escopar seletores e observers, resolver navegação por hash dentro da raiz e registrar fontes onde o navegador consiga carregá-las. Limpar listeners, observers, timers, links e efeitos ao desmontar; conferir StrictMode, hidratação e movimento reduzido.

Editor segue o design compartilhado; organização deve respeitar o modelo. Fotos usam proporções por campo em `image-editor-frame.ts`, com limite de largura. Capas fluidas são referências explícitas e precisam de Preview responsivo. Salvamento deve preservar campos não editados, validar mídia/URLs e respeitar a permissão da ação no servidor.

## Contrato de publicação

| Operação | Fonte/destino | Efeito no público |
|---|---|---|
| Visualizar alternativa | GET `/preview/[slug]?template=...`, com acesso autenticado | Nenhum |
| Aplicar ao rascunho | `appearance.preview_template_key` em `project_v2_content` | Nenhum |
| Editar/salvar | Seções do rascunho | Nenhum |
| Publicar | `publish_v2_project_atomic` copia o rascunho para `project_v2_public_content` e atualiza estado/visibilidade na transação | Atualiza após invalidar cache |
| Visitar site | Snapshot público por slug/host | Não lê o rascunho |

A operação SQL exige owner/admin, projeto não arquivado e bloqueia as linhas relevantes. As Server Actions validam modelo e campos antes da chamada. Não substituir a transação por múltiplos writes de publicação no cliente/servidor.

O editor atual de Personal Trainer salva as seções do rascunho em sequência; isso não torna o salvamento inteiro atômico nem fornece controle de concorrência entre duas abas. Não confundir essa limitação com a atomicidade da publicação. Evitar duas pessoas salvando o mesmo projeto simultaneamente; uma futura mudança de concorrência precisa de bloco próprio.

## Verificação e entrega

Branch por feature, mudanças agrupadas e validação local antes de push: `npm run typecheck`, `npm test`, `npm run build`. Repetir apenas após alteração/falha relevante. Conferir diffs, dados vazios, uploads, teclado/foco, responsive, StrictMode, URLs, permissões e limpeza.

Comparar aparência com a referência em navegador real. Testes de DOM não validam geometria ou recorte. Testar conta editor/viewer, rascunho separado de publicação, host/subdomínio, metadados e regressão dos demais modelos. Não enviar convites nem publicar dados de clientes só para validar integração.

Abrir PR com problema, resultado, validação, limites e migrações. Não criar exceção por slug quando a regra puder ser do segmento/modelo. Manter checklist manual e guia de cliente atualizados. Merge/publicação requer autorização da sessão.
