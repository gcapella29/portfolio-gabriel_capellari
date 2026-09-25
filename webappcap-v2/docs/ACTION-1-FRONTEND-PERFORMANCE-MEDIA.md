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
