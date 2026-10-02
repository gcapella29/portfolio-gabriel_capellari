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
