# WebAppCap — árvore definitiva após a migração

Data do fechamento técnico: 13/09/2026.

## Endereços oficiais

| Finalidade | Endereço |
| --- | --- |
| Raiz comercial | `https://www.webappcap.com.br` |
| Portfólio | `https://capellari.webappcap.com.br` |
| Alias histórico | `https://gabriel-capellari.webappcap.com.br` → redirecionamento permanente para o canônico |
| Owner | `https://www.webappcap.com.br/owner/projects` |
| Entrada de clientes | `https://www.webappcap.com.br/entry` |

## Árvore ativa do repositório

```text
portfolio-gabriel_capellari/
├── .github/workflows/webappcap-v2-ci.yml
├── webappcap-v2/                         # aplicação oficial; Root Directory na Vercel
│   ├── public/
│   │   ├── assets/media/                 # imagens usadas pela raiz e pelo portfólio
│   │   └── legacy-portfolio/
│   │       └── CV-Gabriel-Capellari.pdf # arquivo ainda usado pelo portfólio nativo
│   ├── src/
│   │   ├── app/                          # rotas App Router
│   │   ├── core/                         # domínio, sessão, permissão, publicação e hosts
│   │   ├── lib/supabase/                 # clientes Supabase SSR/browser
│   │   ├── templates/
│   │   │   ├── portfolio/                # único renderer ativo
│   │   │   ├── contracts.ts
│   │   │   ├── registry.tsx
│   │   │   └── types.ts
│   │   └── middleware.ts                 # separação plataforma/tenant e proteção de sessão
│   ├── supabase/migrations/              # 001–014, cumulativas
│   └── docs/
└── arquivos legados na raiz              # preservados para rollback do projeto Vercel antigo
```

Os arquivos legados da raiz não participam do build oficial, porque a Vercel executa `webappcap-v2` como diretório raiz. Eles foram mantidos porque o projeto Vercel antigo ainda representa uma camada de rollback; portanto, não há evidência suficiente para apagá-los com segurança.

## Rotas definitivas

| Rota | Acesso | Função |
| --- | --- | --- |
| `/` | público | página comercial do WebAppCap |
| `/login`, `/auth/callback`, `/entry` | público/autenticado | autenticação e escolha segura do destino |
| `/owner/projects` | owner | central dos projetos pertencentes ao owner |
| `/owner/projects/[slug]` | owner | compatibilidade; redireciona para edição de conteúdo |
| `/owner/projects/new` | owner | criação; inativa enquanto não houver novo template pronto |
| `/projects` | autenticado | seletor quando o usuário participa de mais de um projeto |
| `/dashboard/[slug]/*` | membro autorizado | conteúdo, fotos, aparência, domínio, leads e analytics |
| `/setup/[slug]/[step]` | membro autorizado | onboarding de projetos futuros |
| `/invite/[slug]` | convidado autenticado | aceite e definição inicial de senha |
| `/preview/[slug]` | membro autorizado | rascunho privado |
| `/site/[slug]` | público | fallback por slug; redireciona ao domínio canônico |
| `/tenant` | público via rewrite | resolve um único projeto publicado pelo hostname |
| `/native-preview/portfolio` | público | compatibilidade; redireciona ao portfólio canônico |
| `/template-lab/[segment]/[slug]` | membro autorizado | comparação dos modelos ativos do projeto |
| `/api/leads` | público | valida e envia leads ao RPC protegido |
| `/empty`, `/unauthorized` | estado | páginas explícitas sem projeto ou sem acesso |

`/_tenant` foi removida: era uma duplicata histórica. O middleware usa exclusivamente `/tenant` desde o conserto que tornou a rota pública endereçável.

## Permissões e isolamento

| Papel | Capacidades efetivas |
| --- | --- |
| `owner` | projeto, membros, modelo, conteúdo, aparência, mídia, domínio, leads, publicação e leitura |
| `admin` | modelo, conteúdo, aparência, mídia, domínio, leads, publicação e leitura |
| `editor` | conteúdo, mídia e leitura |
| `viewer` | somente leitura |

Controles revisados:

1. Rotas privadas exigem sessão no middleware e resolvem novamente `usuário + slug + project_id` no servidor.
2. Toda mutação relevante verifica uma capability antes de acessar o Supabase.
3. Consultas e mutações de leads incluem `project_id`; conteúdo, estado e mídia usam RLS por owner/membership.
4. Objetos de mídia ficam em pastas iniciadas pelo UUID do projeto; a policy valida formato, associação e papel.
5. Rascunho e conteúdo público permanecem em tabelas separadas.
6. O resolver público retorna somente projeto não arquivado, publicado, com lifecycle publicado e template definido.
7. O retorno de login/callback aceita somente caminhos internos; URLs absolutas, protocol-relative e barras invertidas caem em `/entry`.
8. A migration 014 aplica ao RPC de leads o mesmo conjunto de condições do resolver público.

## Código removido com evidência de desuso

- Rota duplicada `src/app/_tenant` — nenhuma rewrite ou navegação apontava para ela.
- Renderers e estilos `src/templates/personal-trainer` — ausentes do registry ativo e de todos os segmentos selecionáveis.
- Contratos `trainer-*` — não correspondiam a templates disponíveis.
- Shell HTML e scripts CMS copiados para `webappcap-v2/public` — formavam uma ilha legada referenciada apenas pelo próprio HTML removido; o renderer React não os carregava.

Foram preservados:

- alias `portfolio-legacy-1`, pois normaliza registros históricos para o renderer canônico;
- rota `/native-preview/portfolio`, pois links antigos podem chegar nela;
- tipos de segmentos futuros, onboarding e criação, pois fazem parte do modelo de dados e da próxima expansão;
- mídia e PDF usados pelo portfólio;
- código legado da raiz, até uma decisão separada de desativar o rollback antigo.

## Restauração

Pontos de restauração:

- `backup/main-before-webappcap-v2-2026-09-11`: produção anterior à migração.
- `backup/migration-complete-2026-09-13`: estado final após este fechamento técnico.

Para restaurar, crie uma branch nova a partir do ponto desejado, valide o deployment de Preview e só então abra PR para `main`. Não mova domínios nem reverta dados do Supabase antes de confirmar se a falha é de código, configuração ou conteúdo publicado.

## Gate final

- TypeScript sem erros.
- Build de produção sem erros.
- CI e deployment de Preview verdes antes do merge.
- Migration 014 aplicada no Supabase de produção.
- Raiz, owner, login, preview e portfólio canônico verificados após o deployment.
