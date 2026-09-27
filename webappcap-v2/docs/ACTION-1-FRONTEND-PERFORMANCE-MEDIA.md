# Ação 1 — Frontend, performance e mídia

Status: em validação  
Escopo: blocos 1–4 do plano de modernização do WebAppCap.

## Bloco 1 — Limpeza e consolidação do frontend

- Consolidada a topbar mobile do template Comércio em uma única regra canônica.
- Removidas camadas sucessivas de overrides criadas durante os ajustes visuais.
- Consolidado o layout mobile de Sobre/criadora e checkout.
- Removido CSS morto do antigo modal de categoria no Comércio completo e Venda rápida.
- Mantido o visual homologado do Vet-se.

## Bloco 2 — Arquitetura do template Comércio

- O arquivo `commerce.tsx` passa a ser somente o dispatcher entre os modelos.
- O renderer completo foi extraído para `commerce-complete.tsx`.
- O renderer Venda rápida permanece independente.
- Essa separação reduz o tamanho do ponto de entrada e facilita futuras extrações por seção.

## Bloco 3 — Motion e performance

- Criado `commerce-motion.ts` como ciclo de vida único para reveal, spotlight, parallax e ciclos de destaque.
- O comportamento mobile e desktop continua respeitando `prefers-reduced-motion`.
- O ciclo automático fica restrito a desktop; mobile usa spotlight por viewport.
- Parallax só trabalha enquanto o hero está na área visível.
- Mantidas as proteções de Safari adicionadas na auditoria anterior.

## Bloco 4 — Imagens e mídia

- Uploads estáticos grandes são preparados no navegador antes de ir ao Supabase.
- JPG, PNG e WebP acima de 2400 px no maior lado são redimensionados.
- Arquivos estáticos acima de 3 MB também tentam compressão sem aumentar o tamanho final.
- GIF é preservado sem canvas para não perder animação.
- Imagens acima de 12000 px por lado são recusadas.
- O limite bruto de upload continua em 10 MB.
- O lightbox público já usa `next/image` e a foto da criadora informa um `sizes` compatível com o tamanho real.

## Não alterado nesta ação

- conteúdo salvo/publicado;
- modelo de dados;
- permissões;
- APIs;
- fluxo de pedidos;
- editor/preview/publicação;
- identidade visual aprovada dos templates.

## Gate desta ação

Antes do merge:

1. `npm run typecheck`;
2. `npm test`;
3. `npm run build`;
4. preview desktop do Comércio completo;
5. preview mobile 390/430 px;
6. Venda rápida desktop/mobile;
7. upload de JPG/PNG/WebP e GIF;
8. catálogo, categorias, lightbox, carrinho e WhatsApp;
9. navegação com Reduce Motion ligado e desligado.


## Bloco 5 — Site público e disponibilidade

- Adicionado cliente Supabase público sem cookies para leituras cacheáveis.
- `readPublicSiteByHost` e `readPublicSiteBySlug` agora usam cache curto de 60 segundos.
- Publicação invalida imediatamente o cache do slug, subdomínio nativo e domínio customizado.
- Alterações/validação de domínio invalidam tanto o endereço novo quanto os endereços antigos.
- Erros reais do Supabase não são convertidos em 404 nem armazenados em cache; continuam chegando ao error boundary.
- A rota pública permanece dinâmica, mas deixa de consultar o Supabase repetidamente quando o snapshot já está quente.

### Objetivo do bloco 5

Reduzir TTFB e dependência direta do banco em cada abertura, sem introduzir atraso perceptível após publicar e sem alterar o fluxo atual de rascunho → preview → publicação.


## Bloco 6 — Erros e observabilidade

- Adicionado coletor leve de erros do navegador e `unhandledrejection`.
- Web Vitals com rating `poor` são enviados para o endpoint interno de telemetria.
- O endpoint registra eventos estruturados nos Runtime Logs da Vercel, sem adicionar SDK externo.
- Payloads são limitados, sanitizados e protegidos por rate limit básico.
- Criados error boundaries para aplicação, dashboard e falhas globais.
- O error boundary do site público agora também registra a ocorrência antes de oferecer recarga.
- Nenhum conteúdo de projeto, nome, telefone, e-mail ou dados de pedido é enviado na telemetria.

### Como usar os logs

Buscar nos Runtime Logs por:

`[webappcap.telemetry]`

Os eventos possuem `kind`, `name`, `path`, timestamp e, quando aplicável, mensagem/digest ou valor de Web Vital.

## Gate completo antes do merge da branch

### A. Site público Vet-se — iPhone
1. Abrir o site em nova aba.
2. Recarregar 5 vezes em sequência.
3. Rolar do hero até o rodapé e voltar ao topo.
4. Selecionar e desselecionar categorias.
5. Buscar produto.
6. Abrir e fechar imagens ampliadas.
7. Adicionar/remover itens do carrinho.
8. Preencher Nome e Telefone e confirmar que não há zoom involuntário.
9. Abrir o WhatsApp e voltar ao Safari.
10. Deixar a página aberta por 3–5 minutos e navegar novamente.

Esperado: sem crash do Safari, sem layout diferente do aprovado e sem destaque automático das categorias.

### B. Site público — desktop
1. Conferir hero, catálogo, carrinho, Instagram e Sobre.
2. Testar setas do catálogo.
3. Testar zoom de imagem.
4. Testar filtros de categoria e busca.
5. Confirmar animações/reveals.
6. Testar com Reduce Motion no sistema.

Esperado: nenhum efeito ou layout perdido após a refatoração.

### C. Editor Comércio completo
1. Alterar um texto simples e salvar.
2. Alterar posição/zoom do hero.
3. Trocar foto da criadora.
4. Adicionar/editar produto.
5. Criar categoria/promoção.
6. Abrir Preview.

Esperado: Preview mostra o rascunho imediatamente; site publicado ainda não muda.

### D. Upload de mídia
1. Enviar JPG normal.
2. Enviar PNG normal.
3. Enviar WebP.
4. Enviar uma foto grande, preferencialmente acima de 3 MB ou 2400 px.
5. Enviar GIF.

Esperado: arquivos estáticos grandes são otimizados; GIF preserva animação; nenhum upload válido quebra o editor.

### E. Publicação + cache
1. Fazer uma alteração identificável no editor.
2. Confirmar no Preview.
3. Publicar.
4. Abrir o site real imediatamente em aba privada.
5. Recarregar o site real.

Esperado: alteração publicada aparece imediatamente após a publicação; acessos seguintes permanecem rápidos.

### F. Venda rápida
1. Trocar para Venda rápida no editor.
2. Abrir Preview.
3. Testar categoria, busca, produto, carrinho e WhatsApp.
4. Conferir desktop e mobile.
5. Voltar ao modelo completo ao final se Vet-se deve permanecer nele.

### G. Recuperação de erro
Não é necessário provocar erro em produção. Confirmar apenas que:
- páginas normais carregam sem a tela de erro;
- `/api/telemetry` não interfere em navegação;
- Runtime Logs podem ser pesquisados por `[webappcap.telemetry]` após um evento real.

### H. Gate automático
A branch só deve ser mergeada com:
- `validate` = success;
- Vercel = success;
- preview funcional;
- testes manuais A–F aprovados.
