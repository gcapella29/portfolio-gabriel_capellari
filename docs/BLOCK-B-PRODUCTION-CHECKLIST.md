# Bloco B — Checklist de homologação para produção

Objetivo: validar somente os pontos que bloqueiam a entrega do primeiro cliente.

## 1. Recuperação de acesso
- Abrir a tela de login e usar **Esqueci minha senha**.
- Confirmar recebimento do e-mail.
- Abrir o link, definir nova senha e entrar novamente no painel.

## 2. Plano e limites
Usar um projeto de teste.

### Essencial
- `client_users`: 1
- `custom_domain`: não
- `templates`: não
- `advanced_theme`: não
- `media_gallery`: 8

Validar que domínio próprio, troca de template e personalização avançada são bloqueados e que a galeria não aceita a 9ª foto.

### Pro
- `client_users`: 1
- `custom_domain`: sim
- `templates`: sim
- `advanced_theme`: sim
- `media_gallery`: 20

### Business
- `client_users`: 5
- `custom_domain`: sim
- `templates`: sim
- `advanced_theme`: sim
- `media_gallery`: 60

Ao fazer downgrade, conteúdo acima do limite não deve ser apagado; somente novas ações incompatíveis devem ser bloqueadas.

## 3. Backup
- Dashboard → Backup.
- Gerar e baixar o JSON.
- Confirmar que contém projeto, rascunho, conteúdo publicado, versões, membros, plano e template.
- Confirmar que não contém senha, token ou chave privada.

## 4. Publicação
- Alterar um conteúdo de teste.
- Confirmar **Alterações pendentes**.
- Publicar.
- Recarregar a tela.
- Confirmar que o aviso de alterações pendentes desaparece e que a versão publicada aparece no Histórico.

## 5. Equipe
- Convidar Cliente e Visualizador diretamente com a função correta.
- Confirmar limites de usuários do plano.
- Em uma troca de função que falhar no backend, confirmar que o seletor volta à função anterior e mostra o erro, sem aparentar uma alteração que não ocorreu.

## 6. Entrega do primeiro site
- Preview aprovado.
- Publicação concluída.
- Subdomínio ou domínio configurado e ativo.
- Site público abre o projeto correto sem sessão autenticada.
- Teste rápido em desktop e celular.
- Backup JSON baixado antes da entrega.

## Pendências que não bloqueiam o primeiro piloto
- Verificação automática de DNS para domínio próprio.
- Billing/cobrança automática.
- Polimento completo de e-mails transacionais.
- Auditoria/versionamento definitivo do código das Edge Functions.
- Correção definitiva do `update_role` HTTP 400 da Edge Function; convites diretos com a função correta continuam sendo o fluxo recomendado até a auditoria do backend.
