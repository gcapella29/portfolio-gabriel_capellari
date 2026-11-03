# Aprendendo Matemática — WebAppCap V0.1

Módulo educacional independente no repositório WebAppCap. A interface é servida pelo **Google Apps Script** e utiliza **Google Sheets** como fonte de verdade. **Não utiliza Supabase nem banco de dados externo.**

## Recursos da V0.1
- Perfil individual, sem formulário de cadastro.
- Dashboard e trilha de seis módulos.
- Diagnóstico demonstrativo de seis questões.
- Aulas introdutórias de operações e frações.
- Exercícios corrigidos no servidor com feedback.
- Registro no Sheets de respostas, aulas estudadas e eventos.

## Recursos vinculados
- **Planilha:** https://docs.google.com/spreadsheets/d/1c1t0jBt-Jh2-M8lNVSUwKPRP9ZtG6RjM3YDgMOUVeN8/edit
- **Pasta Drive:** https://drive.google.com/drive/folders/12uspx09ccEmLoVTGDWspGbh6SS55ZJVW

## Implantar

1. Acesse https://script.google.com/ com a conta que possui permissão para editar a planilha.
2. Crie um projeto chamado `Aprendendo Matemática — WebAppCap`.
3. No arquivo `Code.gs`, cole o conteúdo de [Code.gs](./Code.gs).
4. Em **+ > HTML**, crie um arquivo chamado `Index` e cole [Index.html](./Index.html).
5. Salve e execute **configurarProjeto** uma vez. Autorize o acesso à planilha.
6. Confira que o retorno apresenta `ok: true`, com contagem de aulas e questões. A função reutiliza a planilha existente e só insere aulas/questões quando as abas correspondentes estão vazias.
7. Em **Implantar > Nova implantação > Aplicativo da Web**, escolha **Executar como: eu** e **Quem tem acesso: somente eu**, caso a opção esteja disponível.
8. Abra a URL `/exec` e teste diagnóstico, atividades e progresso.
9. Depois da implantação, cadastre a URL do Apps Script como um link/atalho do projeto Aprendendo Matemática no WebAppCap.

> **Importante:** não publique essa implantação para "qualquer pessoa". O protótipo tem um único perfil e não contém autenticação/autorização multiusuário. Se "somente eu" não estiver disponível, não implante publicamente. Use um teste restrito à conta do proprietário ou aguarde a fase de autenticação.

## Estrutura da planilha

Abas: Config, Alunos, Modulos, Aulas, Questoes, Respostas, Diagnosticos, Progresso, Log.

- **Aulas / Questoes**: conteúdo e gabaritos mantidos exclusivamente no Sheets; gabaritos só são enviados após a resposta.
- **Respostas / Progresso / Log**: registro das operações com data/hora.
- **Diagnosticos**: reservada para evolução da avaliação adaptativa na V0.2; na V0.1, os resultados são calculados sobre Respostas.

## Observações
- Questões de demonstração são **autorais**, não de vestibular/concurso.
- O diagnóstico é inicial e **não adaptativo**; não serve como classificação educacional validada.
- A planilha é acessada no servidor, por ID fixo, sem expor seu conteúdo inteiro ao navegador.
- Mudanças no repositório GitHub **não são sincronizadas automaticamente** com o editor Apps Script: após cada alteração, atualize os arquivos do projeto Apps Script e crie uma nova versão de implantação. Podemos automatizar essa sincronização futuramente usando `clasp`.
- Para uso por terceiros, será necessário autenticação real, autorização no servidor e perfis isolados antes de abrir acesso.

## Roadmap
- V0.2: diagnóstico por competência e recomendações.
- V0.3: aulas mais completas, dicas e exercícios graduados.
- V0.4: banco curado de provas oficiais (origem, gabarito, licença).
- V1.0: consolidação do uso individual.
- V2.0: contas de usuários, autenticação e isolamento.
