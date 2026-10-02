# Institucional — integração e validação

Modelo `institutional-main-1`, categoria `institutional`. Referência: `references/institutional-main-1.html`, fornecida pelo cliente. O `public/templates/institutional/styles.css` corresponde ao bloco CSS original, sem conversão para Tailwind. Cormorant Garamond e Source Sans 3, cores, seções, cartões, breakpoints e animação de entrada foram preservados.

React controla dados, navegação por hash, abas da gestão, filtro de álbuns, dialog de fotos, clipboard e formulário WhatsApp. Shadow DOM isola os seletores genéricos; a ponte aplica as variáveis/reset do documento, mede a barra para posicionar as seções, mantém o zoom dentro da área da foto, centraliza o X e respeita movimento reduzido. Nomes longos podem quebrar linha e os campos mobile usam 16px para evitar zoom involuntário. Não há carrinho, pedidos, cobrança, reserva ou captura automática de leads.

## Dados e editor

- Identidade e contatos seguem `identity` e `contact` compartilhados. Chave/beneficiário Pix ficam em `contact.pix` / `contact.pix_name`.
- `content.hero_title` / `hero_text` são compartilhados. Os demais textos visuais ficam em `institutional_main_*`.
- Projetos, doações, campanhas, linha do tempo, valores, diretorias, membros e álbuns são listas `institutional_*`, independentes do modelo visual.
- Períodos, introdução da história e opções de demonstração/fotos também pertencem ao conteúdo institucional.
- Cada item tem ID estável. Reordenar/remover um item não associa a foto a outro item. As fotos de um álbum têm slots que não mudam durante a edição; slots removidos são compactados somente ao salvar.
- Imagens usam os mesmos uploads, permissões e controles do editor existente, com quadros 16:10 nos cartões e 1:1 para pessoas/álbuns, largura máxima 420px. O enquadramento é preservado no site.
- O editor `/dashboard/[slug]/editor/institutional` usa EditorBlock e ContentWorkspace com o mesmo desenho, estado de rascunho, confirmação de upload e Preview dos outros editores.

Novos projetos recebem exemplos independentes, sem faixa de demonstração no site. WhatsApp, e-mail, endereço, Instagram e Pix iniciam vazios; não são copiados os destinos fictícios do HTML. A introdução e o marco de fundação usam o nome do projeto. Projetos existentes sem listas permanecem vazios. Na demonstração, álbuns vazios podem mostrar as ilustrações originais; ao desativar as fotos ilustrativas, somente fotos cadastradas aparecem.

## Supabase

Execute `supabase/migrations/026_institutional_segment.sql` antes de criar projetos institucionais. A migração somente amplia a constraint de `project_v2_state.segment`; não atualiza projetos existentes, não publica e não altera a RPC de publicação.

A função existente de criação recebe `site_type=local_business`, compatível com o tipo já usado para negócios, enquanto `project_v2_state.segment=institutional` define a categoria real do WebAppCap. A leitura privada e pública reconhece esse segmento. Não é necessária uma nova API de pedidos nem função de pagamentos.

O Preview com `?template=institutional-main-1` lê o rascunho e não salva. Aplicar altera somente `appearance.preview_template_key`. Publicar valida nome, título e WhatsApp com DDI e chama a RPC atômica existente. Alterações posteriores permanecem no rascunho até nova publicação. A badge PUBLICADO exige publicação efetiva, não apenas modelo inicial selecionado.

## Verificação local realizada

Typecheck, suíte de testes do projeto e build de produção. Testes adicionais em DOM simulado: StrictMode, navegação por hash e âncoras, abas de gestão via teclado, filtro de álbum, abrir/fechar lightbox, copiar Pix, mensagem de WhatsApp, desativar exemplos e limpeza de fontes/observers. Ação de salvar com dependências simuladas: reordenação mantém fotos, upload externo ao projeto é rejeitado antes de gravar, URL arbitrária não vira foto, viewer não salva, IDs duplicados são rejeitados e remoção de foto preserva as sobreviventes.

Esses testes não substituem conferência visual no navegador nem fluxo com Supabase real. A migração não foi aplicada remotamente e nenhum convite, publicação ou alteração em projeto real foi executado para testar.

## Teste manual

1. Aplicar a migração e criar um projeto de teste da categoria Institucional. Confira o modelo inicial e o acesso pelo editor e por Modelos.
2. Comparar o Preview com a referência em desktop, tablet e celular: fontes, hero, barra superior, cartões, gestão, fotos e contato. Testar nome longo e zoom do navegador.
3. Usar Início/História/Gestão/Fotos/Contato e Voltar/Avançar do navegador. Os CTAs do hero devem chegar a Projetos e Contato; Projetos/Doações/Campanhas devem ficar abaixo da barra.
4. Editar, adicionar, remover e mover itens. Subir uma imagem para dois projetos, trocar a ordem, salvar e conferir cada foto. Repetir com pessoas, campanhas e fotos dos álbuns. Testar zoom, posição e contain.
5. Alterar períodos e usar as abas de gestão por clique e teclado. Testar sem diretoria, somente um dirigente, sem membros e com fotos ocultadas.
6. Filtrar álbuns; abrir e fechar fotos pelo X, Escape e fundo; conferir retorno de foco. Testar álbum vazio e apenas uma foto.
7. Configurar contatos reais de teste, copiar Pix e verificar beneficiário. Enviar formulário em branco deve focar o campo obrigatório; preenchido deve abrir WhatsApp com assunto, contato e mensagem. Confira o CTA individual do projeto, data, horário e local.
8. Desativar demonstração: fotos ilustrativas dos álbuns desaparecem; as fotos cadastradas continuam.
9. Salvar, visualizar e aplicar modelo sem publicar: o site público deve permanecer igual. Publicar projeto de teste; editar novamente; conferir que a alteração aparece somente depois de republicar.
10. Validar owner/admin/editor/viewer conforme as permissões existentes. Viewer não deve editar/aplicar/publicar.

Permanece a limitação anterior de gravações sequenciais das seções do rascunho e de edições concorrentes; o fluxo de publicação continua atômico. A validação da criação/convite, Storage, permissões reais, domínio e cache exige ambiente Supabase de teste.

## Refinamentos solicitados

A faixa de demonstração foi removida do site. A opção do editor controla somente as fotos ilustrativas dos álbuns vazios. Diretoria e membros atuais/anteriores têm campo Instagram (link ou @usuário); o avatar abre esse perfil em nova aba, e sem perfil cadastrado permanece sem link. Destinos fora de instagram.com são rejeitados pelo normalizador.

`media.hero` aceita foto opcional de fundo com posição, ajuste e zoom no editor compartilhado. A camada escura preserva legibilidade. O quadro do editor usa uma referência desktop 1440:720; a altura real é fluida e deve ser conferida no Preview, especialmente no mobile. Sem foto, permanece o gradiente original.

`refinements.css` separado adiciona entrada suave no hero, revelação das seções, hover de cartões/avatares e microinterações dos botões. Movimento reduzido é respeitado e os observers são desconectados. O CSS da referência continua intacto.

Teste também: remover/restaurar a capa; mudar zoom e posição; salvar/republicar; clicar nos avatares das duas gestões; perfil ausente; teclado; navegação entre páginas com animação; preferência de movimento reduzido.

O hero também possui CTA “Seguir no Instagram”, configurado em Contato/Instagram, com texto editável. O botão é omitido enquanto não houver perfil válido. O editor institucional usa grade própria responsiva, campos curtos em inputs, descrições em áreas de texto, cabeçalhos identificados por cargo/nome e controles de ordenação nas duas direções. A foto de cada pessoa fica ao lado dos dados no desktop e abaixo no mobile, com preview compacto de 180px mantendo proporção 1:1. Membros podem ter cargo/função opcional, sem alterar os cadastros existentes.


### Identidade institucional e posicionamento compartilhado

A identidade autorizada utiliza azul royal #282582, azul profundo #17164F, dourado #D4A545, fundo #F5F6FA e cartões brancos. O dourado escuro #806019 mantém contraste nos pequenos textos sobre fundo claro. As fontes originais continuam preservadas. O hero mantém a imagem grande como fundo em toda a largura, com sobreposição para leitura dos textos. O editor utiliza uma referência desktop 2:1; a altura real varia com o conteúdo e a tela. Arraste livre e zoom continuam disponíveis. Use **Preencher o quadro** para ocupar toda a capa; **Mostrar inteira** pode deixar áreas vazias.

Todos os controles individuais usam `src/core/image-placement.ts` e `DraggableImagePreview`: arraste relativo ao ponto inicial, deslocamento proporcional de -100% a 100% por eixo, zoom 50–200%, setas/Shift e centralização. O formato `pan(x,y)|posição anterior` preserva o enquadramento anterior e não exige migração. Novo template deve usar `imageMediaStyle` (ou `imagePositionStyle` quando o CSS controla animação/zoom), o componente compartilhado e `normalizeImagePosition` no salvamento. Publicação e leitura de preview continuam iguais.

Teste manual: mover nos quatro sentidos, reduzir zoom e mostrar inteira, salvar/reabrir, comparar Preview desktop/mobile, publicar e comparar o site. Repetir nos modelos Comércio Clássico, Moderno, Padaria, Portfólio e Personal Trainer. Verificar também imagens de cards e antes/depois. Arrastar além do quadro pode deixar áreas vazias intencionalmente; Centralizar restaura o centro sem alterar o zoom. A galeria genérica continua com upload múltiplo; controles de fotos individuais existem nos editores que possuem esses slots.


No editor, Identidade e hero contém a frase acima do título (organização/cidade) e os seletores de visibilidade de hero, números, projetos, doações, campanhas, chamada final, história, valores, gestão/membros, fotos e contato. Desativar preserva conteúdo e esconde navegação/CTAs correspondentes; links diretos de páginas desativadas voltam ao início. Configurações ausentes em projetos antigos mantêm todos os blocos ativos.

Os avisos introdutório e de salvamento acima do editor foram removidos; o status de rascunho permanece no controle compartilhado de salvamento. Cada seletor de ativação fica no início do respectivo bloco de edição. Hero/números ficam em Identidade, e chamada final em Textos. Diretorias e membros das duas gestões têm visibilidade independente; a página Gestão fica oculta se os quatro grupos forem desativados.

Cards de WhatsApp, Instagram e e-mail são links completos com foco de teclado, ícones e hover suave. O hero usa dourado para Projetos, azul para Doação e claro para Instagram. O hero aprovado continua com sua geometria anterior; não foi expandido após a confirmação de que o preview local estava desatualizado.

A lista existente institutional_campaigns passa a Projetos em andamento, logo após o hero/menu local, antes dos projetos realizados. Os cards grandes têm rolagem lateral, setas (quando há mais de um), foto, descrição, data, horário e local. Datas antigas dia/mês são preservadas no campo Data. Campos de meta, arrecadado, unidade e progresso foram removidos. Quero ajudar abre WhatsApp com o título do projeto; sem WhatsApp válido o CTA fica desabilitado. Nenhuma lista ou dado foi duplicado.

Data recebe selo destacado e Quero ajudar usa botão dourado mais largo. Os fundos seguem a nova ordem: projetos em andamento cinza claro, realizados branco, doações azul profundo e chamada final azul claro.
