# personal-trainer-main-1

## Referência e fidelidade

Fonte visual: personal-trainer-react.zip fornecido pelo usuário. Todos os arquivos do TXT conferem com o ZIP. O styles.css em public/templates/personal-trainer/styles.css é cópia byte a byte do React e corresponde ao style do HTML original. Classes, ordem das seções, Barlow/Barlow Condensed, cores, grid, comparador e breakpoints foram preservados. Não houve conversão para Tailwind nem redesenho.

O renderer usa Shadow DOM para impedir interferência do globals.css. As variáveis/body originais são aplicadas no wrapper do template; padding mobile do body e estado data-agenda são locais. Fontes são registradas no head para funcionar no Shadow DOM e removidas por contagem de instâncias. Navegação por âncoras busca a seção no próprio shadow root. IntersectionObserver é desconectado ao desmontar. O bridge respeita redução de movimento e adiciona margem para a navbar nas âncoras.

O botão demonstrativo de alternar agenda foi removido conforme o README da referência. O estado é editado e salvo no painel. Campos vazios são respeitados; resultados vazios não provocam erro e os links correspondentes são ocultados. Tabs têm foco móvel e setas/Home/End. O slider permanece o range nativo do projeto. Fotos enviadas conservam fit/position/zoom.

## Dados

- Compartilhados do perfil: identity.name/browser_title, contact.whatsapp e media.hero.
- Compartilhados entre templates do segmento: trainer_agenda, trainer_cref, trainer_goals, trainer_stats, trainer_method, trainer_results, trainer_modes, testimonials e faq.
- Conteúdo de abertura: hero_title/hero_text/hero_kicker, compatíveis com os campos centrais.
- Específicos de apresentação: trainer_main_* (ênfase e continuação do título, textos das seções, navegação, formulário e chamadas por estado).
- Antes/depois são imagens do respectivo resultado, não catálogo nem mídia global duplicada. Os metadados de enquadramento ficam junto à imagem.

Novos projetos têm os exemplos da referência. O editor informa que indicadores, casos e depoimentos precisam ser substituídos por informações reais. O CREF e WhatsApp ficam vazios, sem atribuir credenciais ou telefone fictícios ao cliente. A publicação exige WhatsApp configurado. Projetos existentes não são preenchidos automaticamente com exemplos nem desarquivados.

## Integração

Template registrado em segmentos, renderer, contrato, defaults e definição própria de editor. Biblioteca Modelos aceita Personal Trainer; visualizar não salva e aplicar só altera preview_template_key do rascunho. Links do painel/owner e da rota de conteúdo direcionam ao editor próprio. As ações validam o segmento, editContent e manageMedia, limitam listas a 30 e verificam caminhos de upload pertencentes ao projeto antes das gravações. Apenas os campos permitidos são aceitos. URLs executáveis são descartadas.

A publicação usa a RPC publish_v2_project_atomic existente, sem alterar SQL. Não utiliza API, índices ou histórico de pedidos de comércio. Não foi necessária migração nova. O formulário mantém o comportamento original: valida nome/telefone e abre WhatsApp com mensagem; não agenda horários e não grava contatos em site_leads. Nenhum envio de convite, criação de cliente ou alteração do projeto Fabio foi realizado automaticamente.

## Validação

Typecheck, testes de core (incluindo isolamento dos defaults, estado dos CTAs e tratamento de URLs/fotos) e build. DOM em StrictMode: estado da agenda isolado, seções da referência, ausência do botão demonstrativo, navegação no Shadow DOM, tabs por teclado, range, mensagem do formulário, estado fechado, resultados vazios e cleanup de fontes/observer. Comparação byte a byte do CSS.

Não foi possível medir aparência em navegador real neste ambiente. Integração de upload/Server Actions/RLS/publicação em Supabase real precisa ser confirmada no preview. Os testes de DOM não são comprovação visual.

## Testes manuais

1. Em novo projeto de Personal Trainer ou projeto existente não arquivado, abrir Modelos, visualizar e aplicar ao rascunho. Conferir que o público só muda após publicação.
2. Abrir editor próprio: nome, CREF, foto, títulos, indicadores, método, modalidades, casos, depoimentos e FAQ. Salvar e recarregar; conferir manutenção dos dados.
3. Alterar aberta/fechada: selo, textos, formulário, CTAs e barra mobile devem acompanhar o estado salvo. Usuário do site não pode alterná-lo.
4. Upload de hero e antes/depois: ajustar enquadramento, salvar/reabrir; adicionar/remover primeiro item e conferir que uploads dos demais permanecem associados ao item correto.
5. Trocar caso com clique/setas/Home/End e comparar imagens com mouse, toque e teclado. Excluir todos os resultados e conferir ausência de erro e links quebrados.
6. Enviar formulário sem nome/telefone e depois com dados válidos; conferir mensagem e destino de WhatsApp nos dois estados. Sem WhatsApp, publicação deve ser bloqueada com explicação.
7. Comparar com o React em 1440, 900, 700 e 390px; fontes, hero, quadros, grid, FAQ, dock e espaço inferior. Testar redução de movimento.
8. Confirmar Clássico, Modern, Padaria e Portfólio no mesmo deploy. Conferir aplicação/publicação com owner/admin e bloqueio de troca com editor/viewer.

## Refinamentos autorizados

Hero, hierarquia dos botões e comparação antes/depois preservados. `styles.css` segue idêntico à referência; `refinements.css` contém apenas os ajustes autorizados: revelação mais curta e suave, entrada sequencial das modalidades, benefícios com marcadores, acabamento dos cards e campo opcional compartilhado `trainer_modes[].audience` (“Para quem é indicado”). Conteúdo existente sem esse campo continua válido; nenhum perfil de público é inventado a partir do nome da modalidade.

No mobile: formulário em uma coluna e campos de 16px para evitar zoom automático no iOS, espaçamento dos cards, quebra de textos longos no topo e dock e safe area inferior. ResizeObserver mede topo e dock para ajustar margem de rolagem e espaço inferior; observer ou listener de fallback é removido no unmount. Movimento reduzido continua respeitado.

Validação adicional: compatibilidade dos dados antigos e campo opcional, DOM em StrictMode com altura dinâmica do dock/nav, exibição do público e benefícios e cleanup do observer. Conferir visualmente em 320/390/700px, incluindo texto longo na barra fixa, teclado aberto no formulário e preferência de movimento reduzido.

## Ajustes de enquadramento e caso único

O editor da foto do personal usa quadro 4:5 com largura máxima de 420px, reproduzindo a proporção da foto no site e os mesmos object-fit/object-position/zoom. Os componentes compartilhados aceitam dimensões opcionais; os demais editores mantêm seu quadro anterior. Não é necessário alterar ou migrar a mídia salva.

Quando existe apenas um resultado, a identificação é estática e alinhada ao topo da comparação, sem um seletor que não tem alternativa. O slider antes/depois permanece igual. Vários casos continuam com tabs e navegação por teclado; zero casos continuam ocultando a seção. O CREF permanece como etiqueta inferior na foto, com quebra segura para textos longos; o campo deve conter o registro completo, incluindo o prefixo se desejado.

Verificação: typecheck, 37 testes e build; DOM confirmou quadro proporcional, posição/zoom e edição por teclado, caso único sem tablist, slider mantido e vínculo acessível de identificação, além dos fluxos já verificados. Conferir visualmente o crop entre editor/preview e layouts com zero, um e vários casos.

## Padronização visual dos editores

Os nove grupos do Personal Trainer continuam na mesma ordem e com os mesmos campos. O acabamento usa o bloco compartilhado dos editores de Comércio: número em destaque, título/subtítulo, indicador de abertura, bordas, sombra, espaçamento responsivo e superfície do editor. O workspace compartilhado fornece o dock de salvar/preview, aviso de rascunho e bloqueio de salvamento durante uploads. Ajustar imagens por teclado também marca alterações não salvas.

Os quadros de imagem são limitados a 420px e usam proporções por slot/modelo em `image-editor-frame.ts`. Personal: hero e antes/depois 4:5; catálogo Modern quadrado, Clássico 1.18:1; criadora quadrada; portfólio perfil quadrado, Sobre 4:5 e Contato 16:10. Capas fluidas de Comércio, Modern, Padaria e Venda Rápida usam referência desktop explicitada no editor. Suas alturas dependem da tela/texto; no Modern mobile a foto inteira usa proporção natural, portanto o Preview responsivo continua sendo a referência final. Os ajustes não impõem 4:5 a todos os modelos nem alteram o site publicado. Slots genéricos sem geometria contratada usam referência quadrada. A área de mídia utiliza quadros estáticos correspondentes; não ganha novos controles ou regras de persistência.

Validação final: typecheck, 39 testes e build; DOM do editor em StrictMode verificou ordem dos nove grupos, formulário sem aninhamento, foto proporcional, alteração por teclado e indicação de pendência, remoção de item com atualização do JSON, dock no sidebar e Preview do modelo correto com cleanup. Revisão visual manual permanece necessária para Personal e para os quadros de capa dos demais modelos, incluindo desktop/mobile.
