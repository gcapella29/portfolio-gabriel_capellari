# Capellari: integração do rascunho do Owner

Escopo exclusivo: `PRJ-0002`, slug `capellari`, PR #137,
branch `feat/capellari-multidisciplinary-concept`. Sem merge ou publicação.

## Fluxo disponível no frontend

O Owner gera um arquivo com `mode: draft`, token e validade. `/draft-preview`
valida esses dados, lê `snapshot.v2` e seleciona o renderizador de
`appearance.preview_template_key`. Para Capellari, a barra de comparação
permite visualizar ambos os modelos usando `layout=classic` ou
`layout=multidisciplinary`. A seleção é temporária e não altera o Owner.
Manter o token e a expiração: gerar outro preview pelo Owner quando expirar.

`/portfolio-concept` continua sendo a referência visual alimentada pelo
snapshot **publicado**. Ela não representa o rascunho do Owner e informa essa
origem no título e na faixa de referência. O preview do rascunho identifica
a data de geração e, quando fornecido pelo Owner RC5.3, o hash do conteúdo.

## Contrato para o editor do Owner

Preservar chaves desconhecidas em todas as seções; salvar apenas a seção
editada. Não reconstruir o documento inteiro a partir de campos do formulário.

### Aparência

- Clássico: `appearance.preview_template_key = portfolio-legacy-1`.
- Multidisciplinar: `appearance.preview_template_key = portfolio-multidisciplinary-1`.
- A troca deve alterar apenas essa chave, com controle de versão do rascunho.
- Não publicar durante a troca; rollback persistente é voltar à chave clássica.
- A aparência CSS aprovada permanece como padrão; controles de fontes, cores,
  densidade e alinhamento ainda precisam ser mapeados ao conceito antes de
  serem apresentados como funcionais no Owner.

### Conteúdo

O conceito lê `content.portfolio_concept_*`: `hero_title_pt/en`,
`hero_accent_pt/en`, `intro_pt/en`, `about_a_pt/en`, `about_b_pt/en`,
`contact_pt/en` e `cases`. Campos vazios usam o texto visual aprovado.

Cada case aceita `title`, `type_pt/en`, `description_pt/en`, `stack`, `url`
e `image` (URL ou objeto com `url`). O frontend limita a 12 cases. Publicações
anteriores mantêm os quatro cases padrão quando a lista está vazia. Ao editar
a lista, o Owner RC5.3 salva `portfolio_concept_cases_configured: true`; com
essa marca, uma lista vazia oculta os cards. Não apagar os campos clássicos
`hero_title`, `hero_text`, `about`, `proof` e suas traduções.

Trajetória, formação, links editoriais e competências continuam lendo
`portfolio_career`, `portfolio_education`, `portfolio_links`, `portfolio_skills`.
Contatos permanecem em `contact`.

### Mídia

`media.hero`, `media.about`, `media.gallery` continuam sendo as fontes herdadas.
Para trocar fotos somente no conceito, salvar substituições em
`media.portfolio_concept` com as mesmas chaves. Exemplo:

```json
{"portfolio_concept":{"hero":{"url":"/assets/media/hero-gabriel.jpg"}}}
```

Não copiar essas substituições para os slots clássicos. Metadados acessíveis
da galeria usam `content.portfolio_gallery_meta[].alt_pt/en`.

## Pendências para concluir a integração

O pacote local RC5.3 corrige leitura de dados mutáveis, proteção de versão,
salvamento com recuperação, comparação de conteúdo antes de `no_changes` e
arquivos publicados versionados. Ele precisa ser validado numa cópia do Apps
Script antes de implantação; nenhuma atualização de dados é implícita no pacote.
O rascunho v11 divergente exige reconciliação aprovada, preservando ambos os lados.

1. Auditar os arquivos atuais do Apps Script do Owner antes de aplicar o contrato.
2. Auditar os handlers de leitura, gravação e geração de preview antes de editar.
3. Separar Aparência, Conteúdo e Mídia no Owner usando o contrato acima.
4. Conferir preservação de chaves e concorrência de versões no salvamento.
5. Gerar preview atualizado e testar edição → Sheets → arquivo → renderização.
6. Testar desktop/mobile, PT/EN, todas as imagens, links e comparação de modelos.
7. Solicitar aprovação do preview; não fazer merge nem publicar no domínio.

