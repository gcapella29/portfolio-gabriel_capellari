/**
 * Aprendendo Matemática · WebAppCap · V0.1
 * Backend exclusivo Google Sheets + Apps Script.
 * Implante SOMENTE para sua própria conta.
 */
const DB_ID = '1c1t0jBt-Jh2-M8lNVSUwKPRP9ZtG6RjM3YDgMOUVeN8';
const ALUNO_ID = 'aluno_principal';
const ESTRUTURA = {
  Aulas: ['aula_id','modulo_id','ordem','titulo','objetivo','teoria','status'],
  Questoes: ['questao_id','aula_id','habilidade','nivel','enunciado','tipo','alternativas_json','resposta','explicacao','fonte','ano','prova','numero_questao','url_original','licenca_status','revisado'],
  Respostas: ['registro_id','aluno_id','questao_id','resposta','correta','data_hora','tentativa','tempo_segundos'],
  Progresso: ['aluno_id','aula_id','status','dominio_percentual','ultima_atividade','revisao_em'],
  Diagnosticos: ['diagnostico_id','aluno_id','iniciado_em','concluido_em','resultado_json','versao'],
  Log: ['evento_id','data_hora','tipo','entidade','entidade_id','detalhes_json']
};
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aprendendo Matemática | WebAppCap')
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    // Necessário apenas para exibir dentro do subdomínio WebAppCap.
    // ATENÇÃO: ALLOWALL permite incorporar o app em qualquer site.
    // Mantenha a implantação restrita à conta proprietária.
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function db_(){return SpreadsheetApp.openById(DB_ID);}
function sheet_(ss,name){const s=ss.getSheetByName(name);if(!s)throw Error('Aba ausente: '+name);return s;}
function objects_(ss,name){
  const v=sheet_(ss,name).getDataRange().getValues();if(v.length<2)return [];
  const h=v[0].map(String);return v.slice(1).filter(r=>String(r[0]).trim()).map(row=>Object.fromEntries(h.map((k,i)=>[k,row[i]])));
}
function appendObject_(ss,name,item){
  const s=sheet_(ss,name),h=s.getRange(1,1,1,s.getLastColumn()).getValues()[0];
  s.appendRow(h.map(k=>item[k]===undefined?'':item[k]));
}
function registrar_(ss,tipo,entidade,id,detalhes){
  appendObject_(ss,'Log',{evento_id:Utilities.getUuid(),data_hora:new Date(),tipo,entidade,entidade_id:id,detalhes_json:JSON.stringify(detalhes||{})});
}
function configurarProjeto(){
  const ss=db_();
  for(const [name,headers] of Object.entries(ESTRUTURA)){
    const s=sheet_(ss,name);
    const h=s.getRange(1,1,1,headers.length).getValues()[0];
    if(h.join('|')!==headers.join('|')) throw Error('Cabeçalho inesperado em '+name+'. Não será alterado automaticamente.');
  }
  const aulas=[
    ['A01','M01',1,'As quatro operações','Dominar adição, subtração, multiplicação e divisão','Somar é juntar quantidades. Subtrair é encontrar a diferença. Multiplicar é somar parcelas iguais. Dividir é repartir em grupos iguais. Nas expressões, primeiro resolvemos multiplicações e divisões, depois adições e subtrações.','disponivel'],
    ['A02','M02',1,'Entendendo frações','Representar partes de um todo e comparar frações','Uma fração mostra partes iguais de um todo. O denominador indica em quantas partes iguais o todo foi dividido; o numerador informa quantas partes foram consideradas. Para simplificar, dividimos numerador e denominador pelo mesmo número diferente de zero.','disponivel'],
    ['A03','M02',2,'Porcentagem no cotidiano','Compreender percentuais','Porcentagem é uma razão por cem. 25% corresponde a 25/100, que simplifica para 1/4.','em_breve']
  ];
  if(objects_(ss,'Aulas').length===0){
    aulas.forEach(a=>appendObject_(ss,'Aulas',Object.fromEntries(ESTRUTURA.Aulas.map((h,i)=>[h,a[i]]))));
  }
  const Q=[
    ['D01','diagnostico','operacoes','facil','Quanto é 7 + 5?',['10','11','12','13'],2,'7 + 5 = 12.'],
    ['D02','diagnostico','operacoes','facil','Quanto é 6 × 4?',['20','22','24','28'],2,'6 grupos de 4 totalizam 24.'],
    ['D03','diagnostico','operacoes','medio','Quanto é 36 ÷ 6?',['5','6','7','8'],1,'36 dividido por 6 resulta em 6.'],
    ['D04','diagnostico','fracoes','medio','Qual fração é equivalente a 1/2?',['1/3','2/4','3/5','2/3'],1,'1/2 = 2/4, multiplicando ambos os termos por 2.'],
    ['D05','diagnostico','porcentagem','medio','Quanto é 25% de 80?',['10','15','20','25'],2,'25% = 1/4; 80/4 = 20.'],
    ['D06','diagnostico','algebra','dificil','Se x + 9 = 21, quanto vale x?',['10','11','12','13'],2,'x = 21 - 9 = 12.'],
    ['O01','A01','operacoes','facil','Quanto é 18 + 27?',['35','45','44','46'],1,'18 + 27 = 45.'],
    ['O02','A01','operacoes','medio','Quanto é 72 ÷ 8 + 3 × 2?',['15','24','18','12'],0,'Primeiro 72/8=9 e 3×2=6. Depois 9+6=15.'],
    ['F01','A02','fracoes','facil','Uma pizza foi dividida em 8 partes iguais. Você comeu 2. Qual fração representa a parte comida?',['1/8','2/8','4/8','8/2'],1,'Foram consumidas 2 de 8 partes: 2/8 = 1/4.'],
    ['F02','A02','fracoes','facil','Qual fração representa 3 partes de um total de 5?',['3/5','5/3','2/5','3/8'],0,'A parte escolhida fica no numerador: 3/5.'],
    ['F03','A02','fracoes','medio','Qual é a forma simplificada de 6/12?',['2/3','1/2','3/4','1/3'],1,'Dividindo 6 e 12 por 6, obtemos 1/2.'],
    ['F04','A02','fracoes','medio','Quanto é 1/4 + 2/4?',['1/2','2/8','3/4','3/8'],2,'Com denominadores iguais, somamos os numeradores: 3/4.'],
    ['F05','A02','fracoes','dificil','Uma receita usa 3/4 de xícara de leite. Quanto seria necessário para meia receita?',['3/8','1/2','3/2','1/4'],0,'A metade de 3/4 é 3/4 × 1/2 = 3/8.']
  ];
  if(objects_(ss,'Questoes').length===0)Q.forEach(q=>appendObject_(ss,'Questoes',{
    questao_id:q[0],aula_id:q[1],habilidade:q[2],nivel:q[3],enunciado:q[4],tipo:q[1]==='diagnostico'?'diagnostico':'pratica',
    alternativas_json:JSON.stringify(q[5]),resposta:String(q[6]),explicacao:q[7],fonte:'Questão autoral — WebAppCap',
    licenca_status:'original',revisado:'sim'
  }));
  registrar_(ss,'CONFIGURACAO','sistema','V0.1',{planilha:DB_ID});
  return {ok:true,url:ss.getUrl(),aulas:objects_(ss,'Aulas').length,questoes:objects_(ss,'Questoes').length};
}
function getInitialData(){
  const ss=db_();
  const respostas=objects_(ss,'Respostas').filter(x=>x.aluno_id===ALUNO_ID);
  const diagnostico=respostas.filter(x=>/^D0[1-6]$/.test(String(x.questao_id))).slice(-6);
  return {
    modules:objects_(ss,'Modulos').sort((a,b)=>Number(a.ordem)-Number(b.ordem)),
    lessons:objects_(ss,'Aulas').sort((a,b)=>Number(a.ordem)-Number(b.ordem)),
    progress:objects_(ss,'Progresso').filter(x=>x.aluno_id===ALUNO_ID),
    answeredCount:respostas.length,
    diagnostic:{completed:new Set(diagnostico.map(x=>x.questao_id)).size===6,
      correct:diagnostico.filter(x=>x.correta===true||String(x.correta).toLowerCase()==='true').length,total:6}
  };
}
function getQuestions(tipo,aulaId){
  if(!['diagnostico','pratica'].includes(tipo))throw Error('Atividade inválida.');
  return objects_(db_(),'Questoes').filter(q=>q.tipo===tipo&&(tipo==='diagnostico'||q.aula_id===aulaId)).map(q=>({
    id:String(q.questao_id),nivel:String(q.nivel),enunciado:String(q.enunciado),alternativas:JSON.parse(q.alternativas_json)
  }));
}
function submitAnswer(id,answerIndex){
  if(!/^[A-Z][0-9]{2}$/.test(String(id)))throw Error('Identificador inválido.');
  const idx=Number(answerIndex);if(!Number.isInteger(idx)||idx<0||idx>10)throw Error('Alternativa inválida.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const ss=db_(),q=objects_(ss,'Questoes').find(x=>x.questao_id===id);if(!q)throw Error('Questão não encontrada.');
    const op=JSON.parse(q.alternativas_json);if(idx>=op.length)throw Error('Alternativa inválida.');
    const correta=idx===Number(q.resposta);
    const tentativas=objects_(ss,'Respostas').filter(x=>x.aluno_id===ALUNO_ID&&x.questao_id===id).length+1;
    appendObject_(ss,'Respostas',{registro_id:Utilities.getUuid(),aluno_id:ALUNO_ID,questao_id:id,resposta:String(idx),correta,data_hora:new Date(),tentativa:tentativas});
    registrar_(ss,'RESPOSTA','questao',id,{correta,tentativa:tentativas});
    return {correct:correta,correctIndex:Number(q.resposta),explanation:String(q.explicacao)};
  }finally{lock.releaseLock();}
}
function completeLesson(id){
  if(!/^[A-Z][0-9]{2}$/.test(String(id)))throw Error('Aula inválida.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const ss=db_(),a=objects_(ss,'Aulas').find(x=>x.aula_id===id&&x.status==='disponivel');if(!a)throw Error('Aula indisponível.');
    const has=objects_(ss,'Progresso').some(x=>x.aluno_id===ALUNO_ID&&x.aula_id===id&&x.status==='concluida');
    if(!has){appendObject_(ss,'Progresso',{aluno_id:ALUNO_ID,aula_id:id,status:'concluida',ultima_atividade:new Date()});registrar_(ss,'AULA_CONCLUIDA','aula',id,{});}
    return {ok:true};
  }finally{lock.releaseLock();}
}