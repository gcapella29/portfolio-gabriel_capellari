# Auditoria de estabilidade — Vet-se / WebAppCap

Data: 2026-09-25  
Escopo principal: site público `vet-se.webappcap.com.br`, template Comércio completo e Venda rápida.

## Sintoma observado

No iPhone/Safari, a página ocasionalmente exibe a mensagem de que "um problema ocorreu repetidamente" e volta a funcionar após recarregar.

Esse aviso é diferente de um erro normal de React/Next.js. Ele é compatível com o processo de conteúdo do WebKit sendo encerrado/reiniciado, normalmente por pressão de memória, GPU/composição ou falha nativa do navegador. O código não permite afirmar uma causa única, mas há alguns fatores que aumentavam esse risco.

## Pontos de maior risco encontrados

### 1. Animação infinita de filtro sobre imagem grande do hero

O hero mantinha `filter: saturate()/brightness()` animado continuamente. Em mobile, a mesma imagem também participava de transformações de parallax e de uma camada com `will-change: transform`.

Essa combinação força composição contínua de um bitmap grande e é um candidato forte a pressão de GPU/memória em iOS.

Correção aplicada nesta branch:
- desliga somente o "breathing" de filtro do hero no mobile;
- mantém sweep, underline, microinterações e parallax;
- remove `will-change` persistente no mobile.

### 2. Ciclo automático de DOM concorrendo com o spotlight mobile

O template mantinha um `setInterval` percorrendo produtos e outros blocos a cada ~2 s, ao mesmo tempo em que o mobile já possuía um `IntersectionObserver` para destacar o conteúdo no centro da tela.

Correção aplicada:
- em mobile, o ciclo automático não roda;
- o spotlight por viewport continua;
- desktop mantém o ciclo.

Isso reduz consultas repetidas ao DOM, mudanças de atributos, style recalculation e pintura sem perda funcional no celular.

### 3. Lightbox do Comércio completo carregava a imagem original sem otimização

Ao ampliar um produto, o código usava uma tag `<img>` diretamente com a URL original. Uma foto grande pode ser decodificada em resolução completa e ocupar dezenas de MB de memória no Safari.

Correção aplicada:
- o lightbox agora usa `next/image`;
- a imagem é servida no tamanho adequado ao viewport;
- o comportamento visual permanece o mesmo.

### 4. Hint de tamanho incorreto para a foto da criadora

A imagem aparece com aproximadamente 78–96 px no mobile, mas o `sizes` dizia ao Next.js que ela ocupava cerca de 92% da largura da tela.

Correção aplicada:
- `sizes` agora representa o tamanho real;
- reduz download, decode e memória.

### 5. Backdrop filters em mobile

Existem vários `backdrop-filter: blur(...)`, que podem criar superfícies extras de composição no WebKit.

Correção aplicada nos controles mobile mais recorrentes:
- remove blur de backdrop onde o fundo/cores já preservam o visual;
- mantém geometria, cores, sombras e hierarquia.

### 6. Derivações de catálogo recalculadas em toda interação

No Comércio completo, `menu`, categorias, filtro e carrinho derivado eram recriados em cada render. Como os campos Nome/Telefone ficam no mesmo componente da vitrine inteira, cada tecla podia provocar recomputação da árvore de produtos.

Correção aplicada:
- memoização de menu, categorias, catálogo filtrado e itens escolhidos;
- mesma abordagem no template Venda rápida.

Ainda existe oportunidade futura de dividir o template em componentes menores/memoizados, mas isso deve ser feito em uma refatoração separada para reduzir risco visual.

### 7. Falta de error boundary específico no site público

Uma falha transitória de renderização/server data podia cair no tratamento genérico do framework.

Correção aplicada:
- criado `src/app/tenant/error.tsx`;
- oferece uma tela simples e botão de recarregar para falhas recuperáveis.

Observação: um crash do processo WebKit acontece abaixo do React e não pode ser capturado por um error boundary. A correção atua nos erros de aplicação, enquanto os ajustes de GPU/memória atacam o risco do Safari.

## Arquitetura / manutenção

### CSS acumulado

Os arquivos do Comércio possuem diversas camadas sucessivas de media queries e overrides com `!important`, especialmente na topbar e no bloco Sobre. Isso funciona hoje, mas aumenta o risco de regressões futuras.

Recomendação:
- consolidar os overrides mobile em uma única seção canônica;
- remover CSS morto de componentes já retirados;
- fazer isso em PR separada e com comparação visual desktop/mobile.

### Componente principal grande

`commerce.tsx` concentra hero, catálogo, carrinho, Instagram, Sobre, lightbox e vários effects.

Recomendação:
- extrair `CatalogSection`, `CartSection`, `StorySection` e hooks de motion;
- usar `React.memo` em cartões e seções estáveis;
- manter estado de formulário o mais local possível.

Isso melhora previsibilidade e reduz a área rerenderizada por interação.

### Site público dinâmico

A rota tenant é `force-dynamic` e resolve o projeto no Supabase em toda requisição. Isso é coerente com publicação imediata, mas cria dependência direta da latência/disponibilidade do banco em cada abertura.

Melhoria futura recomendada:
- cache curto do snapshot publicado + invalidação explícita no ato de publicar;
- manter Supabase/Sheets? aqui Supabase como fonte publicada, sem alterar fluxo editorial.

Isso é uma melhoria de disponibilidade/TTFB e deve ser implementado separadamente da correção do Safari.

## Prioridade sugerida

1. Estabilização Safari/mobile — aplicada nesta branch.
2. Teste real em iPhone por alguns ciclos: abrir, navegar, rolar catálogo, ampliar imagens, carrinho e voltar pelo WhatsApp.
3. Refatoração de CSS sem alteração visual.
4. Divisão do componente Comércio em blocos memoizados.
5. Cache/invalidação do site público.
6. Observabilidade de erros client-side e Web Vitals.

## Observabilidade

Os logs de runtime da Vercel seriam úteis para separar falhas de servidor de crashes do WebKit. Nesta auditoria, a conexão Vercel disponível não retornou nenhum time/projeto acessível, então não foi possível consultar os runtime errors diretamente.

O próximo passo ideal é conectar/autorizar a Vercel no ChatGPT ou consultar os Runtime Logs do projeto durante uma ocorrência. Para crashes nativos do Safari, os logs do servidor podem permanecer limpos — por isso os ajustes de composição/memória continuam relevantes mesmo sem erro de backend.
