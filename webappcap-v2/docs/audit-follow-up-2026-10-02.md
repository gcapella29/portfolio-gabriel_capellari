# Fechamento das pendências da revisão geral

O PR #116 foi mergeado após CI e preview Vercel aprovados. Este bloco completa a manutenção na branch `chore/audit-follow-up`.

## Concluído em código

- **Fontes locais:** mesmos arquivos de fonte e declarações do build aprovado para raiz, portfólio e comércio; mesmas famílias/pesos dos modelos Moderno, Personal Trainer, Institucional e Padaria. Os templates deixam de consultar Google Fonts. Fontes binárias e CSS públicos têm nomes versionados, preload dos dois arquivos principais por modelo e cache longo. Manifesto SHA-256 e licenças OFL incluídos. Estrutura, dimensões e estilos dos templates preservados.
- **Lint funcional:** ESLint compatível com Next 15, TypeScript e hooks; `npm run lint` sem avisos, integrado ao `npm run check` e ao CI. Helpers/imports/argumentos mortos removidos, expressão de seleção simplificada e coleção do catálogo estabilizada para as dependências de memoização. Arquivos gerados ignorados. Exceções de imagem nativa limitadas aos templates e previews cujo CSS/geometria devem ser preservados.
- **Cotas compartilhadas:** migração 027 e integração opcional nas APIs de leads, analytics, telemetria e pedidos. UPSERT atômico no Supabase limita acessos entre instâncias. Chaves são HMACs; IPs não são gravados na tabela. Apenas service_role executa a função; dados inacessíveis a anon/authenticated. Limpeza de registros expirados limitada por chamada. Não precisa de serviço pago adicional. Quando habilitado, falha de banco/configuração retorna 503, sem contornar a cota.
- **Auditoria de mídia:** `npm run media:audit -- --project UUID` lista candidatos com pelo menos 7 dias sem referência nos rascunhos/publicados de qualquer projeto ou no CMS da raiz. Lê os snapshots antes e depois da listagem; arquivos novos/editados ou sem datas confiáveis são protegidos. Falha em qualquer consulta interrompe a auditoria. O comando não apaga arquivos.

## Validação

- Lint, typecheck, testes e build locais aprovados.
- 73 testes Node aprovados, incluindo binários/URLs locais de fontes, decisões de cota compartilhada e proteção de referências da mídia.
- Migração 027 executada duas vezes em PostgreSQL local (PGlite): idempotência, cotas, chaves independentes, expiração, contadores limitados, parâmetros inválidos e permissões aprovados.
- `npm audit`: zero vulnerabilidades conhecidas nesta execução.
- HTTP em produção local: fontes WOFF2/preload/cache aprovados; APIs retornaram 503 quando a proteção compartilhada foi habilitada sem credencial, antes de consultar/gravar os dados.
- Sem pedidos, leads, publicação ou exclusões no Supabase real.

## Ativação do limite global em produção

1. Aplicar `supabase/migrations/027_shared_public_rate_limits.sql` no projeto Supabase.
2. Confirmar `SUPABASE_SERVICE_ROLE_KEY` no servidor. Nunca usar prefixo NEXT_PUBLIC para esta chave.
3. Definir `WEBAPPCAP_SHARED_RATE_LIMIT=true` na Vercel, nos ambientes onde a migração foi aplicada, e redeployar.
4. Homologar em projeto de teste. Para desativar a camada global, remover a variável ou definir false; as cotas locais existentes continuam ativas.

A camada global vem desativada para que a atualização não interrompa APIs em um banco ainda sem a migração. Ela acrescenta uma chamada RPC por envio válido. Não foi ativada remotamente nesta revisão: não há acesso SQL autenticado ao Supabase neste ambiente.

## Auditoria de arquivos

Com Node 22 atualizado e `.env.local` configurado:

```powershell
npm.cmd run media:audit -- --project ID-UUID-DO-PROJETO
```

A saída JSON contém caminhos candidatos e datas, sem imprimir conteúdo dos snapshots nem credenciais. Conferir o relatório antes de qualquer limpeza. Exclusão automática fica fora deste bloco: Storage e snapshots não participam da mesma transação, e apagar uma referência adquirida enquanto outra pessoa edita causaria perda de imagem. Nenhum arquivo existente foi removido.

## Homologação que depende do ambiente

Conferir fontes, hero e enquadramentos em desktop/iPhone/Android, salvar/recarregar editores, alternar preview/modelo, publicar em projeto de teste e validar chegada de pedidos/contatos. RLS aplicada, domínios personalizados e conteúdo real precisam do ambiente configurado.

A renderização inicial dos modelos em Shadow DOM continua no cliente. Uma mudança para renderização declarativa no servidor exige adaptar hidratação e componentes; não foi introduzida dentro desta manutenção para preservar estrutura, isolamento e comportamento aprovados.
