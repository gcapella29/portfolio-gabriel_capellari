# WebAppCap v2

Nova base da plataforma, isolada do renderer legado do portfólio.

## Princípios

1. O Portfólio legado permanece intacto até a migração ser explicitamente aprovada.
2. Segmento e template são entidades diferentes: um segmento pode oferecer vários templates.
3. O projeto define o segmento; o cliente escolhe um template compatível no onboarding.
4. Conteúdo é estruturado por segmento, nunca por nomes herdados de outro projeto.
5. Preview e Publicar são ações globais, não áreas concorrentes.
6. Projeto, usuário e destino são resolvidos antes de renderizar a tela, evitando flashes e rotas ambíguas.
7. Subdomínios WebAppCap são infraestrutura nativa; domínio próprio passa por validação separada.

## Stack

- Next.js
- TypeScript
- React
- Supabase
- Tailwind CSS
- Vercel

## Fluxos obrigatórios antes do merge

Owner cria projeto → convite → criação de senha → onboarding → escolha de template → preenchimento → preview → domínio → publicação → dashboard → edição → republicação.

A v2 nasce em `webappcap-v2/` para que a produção atual continue funcionando durante a reconstrução.
