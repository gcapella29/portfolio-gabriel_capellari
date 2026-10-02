# Validação do bloco de entrega — 02/10/2026

## Concluído

- PR #108 integrado: migração 025 corrige autorização de remoção de imagens de arquivados; limpeza interrompe operações sem progresso. Aplicação da migração e exclusão do antigo Fabio confirmadas pelo usuário.
- Revisados leitores de preview/público, ação de aplicar modelo, publicação, validações de agenda/WhatsApp e permissões de owner/admin/editor/viewer.
- Corrigido o selo PUBLICADO na biblioteca: exige `isPublished` e lifecycle publicado, além do modelo correspondente. Seleção inicial de um projeto novo não indica publicação.
- Guia de edição e contrato de integração documentados. Acrescentada cobertura negativa de permissões de editor/viewer e limites de admin.

## O que verificar por fora

Use um projeto de teste ou alterações reais que queira publicar. Não é necessário excluir/criar cliente para repetir todos os cenários. Registre aprovado/erro e o endereço usado.

| Etapa | Teste | Resultado esperado |
|---|---|---|
| Criação | Novo Personal Trainer | Editor próprio; sem selo PUBLICADO antes da primeira publicação; exemplos revisáveis, WhatsApp a preencher |
| Modelo | Visualizar e fechar alternativa | Modelo aplicado anteriormente permanece no rascunho |
| Aplicação | Aplicar modelo e recarregar | Rascunho selecionado persistiu; público anterior preservado |
| Salvamento | Alterar texto/foto, salvar e recarregar | Mesmos valores e enquadramento; upload termina antes de salvar |
| Preview | Conferir desktop/mobile | Último rascunho salvo; nenhuma mudança pública implícita |
| Publicação | Publicar e abrir URL pública sem login | Dados e modelo correspondem ao rascunho publicado |
| Edição posterior | Salvar outro texto sem publicar | Preview muda; público mantém o texto anterior |
| Republicação | Publicar novamente | Público passa a mostrar a nova versão |
| Agenda | Aberta/fechada, salvar e testar CTAs | Selo, formulário e dock seguem o estado; mensagem correta no WhatsApp |
| Resultados | Zero, um e vários casos | Seção ausente, identificação estática ou tabs; range e teclado funcionam |
| Mobile | 320/390/700px, teclado aberto | Sem cortes; dock não encobre rodapé; formulário utilizável |
| Permissões | Contas existentes de editor/viewer | Editor salva conteúdo, não publica/troca modelo; viewer não altera |
| Regressão | Clássico/Modern/Padaria/Portfólio | Foto do editor coerente com campo; hero e blocos aprovados preservados |
| Comércio | Carrinho, promoção e pedido de teste | Quantidades/preços corretos; WhatsApp e histórico correspondem ao pedido |

## Limites desta verificação

Revisão estática e testes locais não comprovam RLS real, upload, sessão de outra pessoa, publicação em Supabase, cache/domínio ativo ou geometria em navegador. Não foram criados projetos, enviados convites, publicados sites ou alterados dados de clientes para esta revisão. O único merge operacional foi o #108 autorizado neste bloco.

Pontos para blocos futuros: concorrência entre abas/editores e atomicidade do salvamento do rascunho, dimensões de capas fluidas por viewport e retirada genérica de regras antigas por slug. Não há justificativa nesta revisão para modificar a publicação atômica existente.
