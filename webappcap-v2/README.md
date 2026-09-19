# WebAppCap

Aplicação oficial da plataforma e do primeiro projeto nativo, o portfólio de Gabriel Capellari.

## Produção

- Plataforma: `https://www.webappcap.com.br`
- Portfólio canônico: `https://capellari.webappcap.com.br`
- Branch de produção: `main`
- Root Directory na Vercel: `webappcap-v2`

## Arquitetura

- Next.js App Router, React e TypeScript.
- Supabase Auth, Postgres/RLS e Storage.
- `project_v2_content` guarda o rascunho.
- `project_v2_public_content` guarda o snapshot publicado.
- O middleware separa a plataforma dos hosts de projetos antes da renderização.
- Preview e site publicado usam o mesmo registry de templates.

O produto atual oferece somente o segmento Portfólio. As chaves dos demais segmentos continuam no domínio e no banco para compatibilidade, sem templates selecionáveis ou renderers ativos.

## Migrações

As migrações em `supabase/migrations` são ordenadas e cumulativas. A `014_harden_public_lead_project_state.sql` fecha a segurança dos leads; a `015_root_cms_and_project_analytics.sql` adiciona o CMS da raiz e métricas anônimas isoladas por projeto.

## Operação

- Owner: `/owner/projects`
- Editor da raiz: `/owner/root`
- Entrada autenticada: `/entry`
- Editor de projeto: `/dashboard/[slug]/content`
- Preview privado: `/preview/[slug]`
- Renderização pública por host: `/tenant`

Consulte `docs/ARVORE-DEFINITIVA.md` para rotas, permissões, itens preservados e restauração.


## Desenvolvimento local sem consumir deploys da Vercel

Use este fluxo para validar mudanças visualmente antes de enviar um novo deploy.

### 1. Preparação inicial

Na raiz do repositório:

```bash
git fetch origin
git switch refactor/commerce-cleanup
git pull
cd webappcap-v2
npm install
```

Crie `.env.local` dentro de `webappcap-v2` usando `.env.example` como base. Para o Preview carregar os mesmos dados do projeto, preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores usados no ambiente de Preview da Vercel. Não versione `.env.local` e não copie chaves secretas/service-role para o navegador.

### 2. Servidor de desenvolvimento

```bash
npm run dev
```

Abra:

- Plataforma local: `http://localhost:3000`
- Vet-se: `http://localhost:3000/preview/vet-se`
- Editor Vet-se: `http://localhost:3000/dashboard/vet-se/editor`

O terminal deve permanecer aberto enquanto o servidor estiver em uso. O Next.js aplica as alterações locais automaticamente; não é necessário criar um deployment para cada ajuste.

### 3. Validação antes do deploy

Quando um bloco estiver aprovado localmente:

```bash
npm run typecheck
npm test
npm run build
```

Depois disso, agrupe as alterações aprovadas em um único commit/push. Assim a Vercel fica reservada para a checagem final do conjunto, em vez de ser usada como ambiente de desenvolvimento.

### Observação sobre autenticação

O Preview e o editor continuam respeitando as regras de autenticação e acesso do projeto. Se `/preview/vet-se` redirecionar para login, entre normalmente no ambiente local; isso não significa que o servidor local falhou.
