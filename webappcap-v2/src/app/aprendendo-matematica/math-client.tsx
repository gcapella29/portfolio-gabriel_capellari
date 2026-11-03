'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';
import styles from './math.module.css';

type Module={modulo_id:string;ordem:number|string;titulo:string;descricao:string;status:string};
type Lesson={aula_id:string;modulo_id:string;ordem:number|string;titulo:string;objetivo:string;teoria:string;status:string};
type Progress={aluno_id:string;aula_id:string;status:string};
type Initial={modules:Module[];lessons:Lesson[];progress:Progress[];answeredCount:number;diagnostic:{completed:boolean;correct:number;total:number}};
type Question={id:string;skill:string;level:string;title:string;options:string[]};
type Verdict={correct:boolean;correctIndex:number;explanation:string};
type SkillResult={achieved:number;attempted:number;label:string};
type DiagnosticResult={correct:number;total:number;skills:Record<string,SkillResult>;priorities:string[]};
type History={id:string;at:string;result:DiagnosticResult};
type Page='home'|'trilha'|'diagnostico'|'aulas'|'progresso';
type Answer={id:string;index:number};
const skills=[['operacoes','Números e operações'],['fracoes','Frações e decimais'],['proporcoes','Porcentagem e proporções'],['algebra','Álgebra e equações'],['geometria','Geometria e medidas'],['dados','Estatística e probabilidade']] as const;
const levels=['facil','medio','dificil'];
const skillName=(value:string)=>skills.find(s=>s[0]===value)?.[1]||value;

async function call<T>(action:string,payload:Record<string,unknown>={}):Promise<T>{
 const response=await fetch('/api/math',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload}),cache:'no-store'});
 const body=await response.json().catch(()=>({ok:false,error:'Resposta inválida do servidor.'}));
 if(!response.ok||!body.ok)throw new Error(String(body.error||'Falha na comunicação com o servidor.'));
 return body.data as T;
}

export default function MathClient(){
 const [page,setPage]=useState<Page>('home');
 const [data,setData]=useState<Initial|null>(null);
 const [history,setHistory]=useState<History[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [lesson,setLesson]=useState<Lesson|null>(null);
 const [mode,setMode]=useState<'diagnostico'|'pratica'|null>(null);
 const [queue,setQueue]=useState<Question[]>([]);
 const [allQuestions,setAllQuestions]=useState<Question[]>([]);
 const [index,setIndex]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [verdict,setVerdict]=useState<Verdict|null>(null);
 const [answers,setAnswers]=useState<Answer[]>([]);
 const [correctCount,setCorrectCount]=useState(0);
 const [summary,setSummary]=useState<DiagnosticResult|null>(null);

 const refresh=useCallback(async()=>{
  const [initial,prev]=await Promise.all([
   call<Initial>('initial'),call<History[]>('diagnostics')
  ]);
  setData(initial);setHistory(prev);
 },[]);
 useEffect(()=>{refresh().catch(e=>setError(e instanceof Error?e.message:'Erro ao carregar.')).finally(()=>setLoading(false))},[refresh]);

 function navigate(next:Page){
  setError('');setPage(next);setMode(null);setLesson(null);setSummary(null);
 }
 async function openQuiz(type:'diagnostico'|'pratica',lessonId?:string){
  setBusy(true);setError('');
  try{
   const questions=await call<Question[]>('questions',{tipo:type==='diagnostico'?'diagnostico_v2':'pratica',aulaId:lessonId||''});
   if(!questions.length)throw new Error('Não há exercícios disponíveis nesta atividade.');
   setAllQuestions(questions);
   setQueue(type==='diagnostico'?skills.map(([skill])=>questions.find(q=>q.skill===skill&&q.level==='facil')).filter((q):q is Question=>Boolean(q)):questions);
   setIndex(0);setSelected(null);setVerdict(null);setAnswers([]);setCorrectCount(0);setMode(type);setSummary(null);
   setPage(type==='diagnostico'?'diagnostico':'aulas');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível abrir a atividade.')}
  finally{setBusy(false)}
 }
 const current=queue[index];
 const points=data?.progress.filter(p=>p.status==='concluida').length||0;
 const last=history[0]?.result;
 const progressLabel=last?`${last.correct}/${last.total}`:'Ainda não realizado';

 async function answer(){
  if(!current||selected===null||verdict||busy)return;
  setBusy(true);setError('');
  try{
   const result=await call<Verdict>('answer',{id:current.id,index:selected});
   setVerdict(result);
   if(result.correct)setCorrectCount(v=>v+1);
   setAnswers(a=>[...a,{id:current.id,index:selected}]);
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível registrar a resposta.')}
  finally{setBusy(false)}
 }
 async function nextQuestion(){
  if(!current||!verdict||busy)return;
  let updated=queue;
  if(mode==='diagnostico'&&verdict.correct&&current.level!=='dificil'){
   const nextLevel=levels[levels.indexOf(current.level)+1];
   const harder=allQuestions.find(q=>q.skill===current.skill&&q.level===nextLevel);
   if(harder){updated=[...queue.slice(0,index+1),harder,...queue.slice(index+1)];setQueue(updated)}
  }
  const nextIndex=index+1;
  if(nextIndex>=updated.length){
   if(mode==='diagnostico'){
    setBusy(true);setError('');
    try{
     const result=await call<DiagnosticResult>('finish-diagnostic',{answers});
     setSummary(result);setMode(null);await refresh();
    }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar diagnóstico.');}
    finally{setBusy(false)}
   }else{
    setSummary({correct:correctCount,total:answers.length,skills:{},priorities:[]});
    setMode(null);await refresh().catch(()=>{});
   }
   return;
  }
  setIndex(nextIndex);setSelected(null);setVerdict(null);
 }
 async function completeLesson(){
  if(!lesson||busy)return;
  setBusy(true);setError('');
  try{await call('lesson',{id:lesson.aula_id});await refresh();setLesson(null);setPage('aulas')}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar.')}
  finally{setBusy(false)}
 }
 const pages=[['home','Início','⌂'],['trilha','Minha trilha','▦'],['diagnostico','Diagnóstico','✎'],['aulas','Aulas','◫'],['progresso','Progresso','◷']] as const;
 const orderedLessons=useMemo(()=>[...(data?.lessons||[])].sort((a,b)=>Number(a.ordem)-Number(b.ordem)),[data?.lessons]);

 const header=(eyebrow:string,title:string,description:string)=><><p className={styles.eyebrow}>{eyebrow}</p><h1 className={styles.title}>{title}</h1><p className={styles.lead}>{description}</p></>;

 const modulesView=()=><div className={styles.grid3}>{data?.modules.map(m=>{
  const available=orderedLessons.filter(l=>l.modulo_id===m.modulo_id&&l.status==='disponivel').length;
  return <article className={styles.module} key={m.modulo_id}><span className={styles.tag}>MÓDULO {m.ordem}</span><h3>{m.titulo}</h3><p>{m.descricao}</p><p>{available} aula(s) disponível(is)</p><button className={`${styles.button} ${styles.buttonSoft}`} onClick={()=>navigate('aulas')}>Explorar aulas →</button></article>;
 })}</div>;

 const skillCards=(result:DiagnosticResult)=><div className={styles.skills}>{skills.map(([key,label])=>{
  const item=result.skills?.[key];
  const achieved=item?.achieved||0;
  return <article className={styles.skill} key={key}><div className={styles.skillTop}><strong>{label}</strong><span>{achieved}/3</span></div><div className={styles.skillBar}><span style={{width:`${achieved/3*100}%`}}/></div><small>{item?.label||'Não avaliado'}</small></article>;
 })}</div>;

 function renderQuiz(){
  if(!current||!mode)return null;
  return <>{header(mode==='diagnostico'?'DIAGNÓSTICO ADAPTATIVO':'PRÁTICA GUIADA',mode==='diagnostico'?skillName(current.skill):'Vamos praticar',`Questão ${index+1} de pelo menos 6 · Nível ${current.level}`)}
   <div className={styles.progress}><div style={{width:`${Math.min(100,(index+1)/(mode==='diagnostico'?18:queue.length)*100)}%`}}/></div>
   <section className={styles.panel}><p className={styles.questionNum}>QUESTÃO {index+1} · {current.level.toUpperCase()}</p><h2 className={styles.sectionTitle}>{current.title}</h2>
   <div className={styles.options}>{current.options.map((option,i)=><button key={i} disabled={verdict!==null||busy} onClick={()=>setSelected(i)} className={[` ${styles.option}`,selected===i?styles.optionSelected:'',verdict&&(i===verdict.correctIndex)?styles.optionRight:'',verdict&&selected===i&&!verdict.correct?styles.optionWrong:''].join(' ')}><b>{String.fromCharCode(65+i)}</b>{option}</button>)}</div>
   {verdict?<><div className={`${styles.feedback} ${!verdict.correct?styles.feedbackBad:''}`}><strong>{verdict.correct?'Boa! Resposta correta.':'Vamos entender esse resultado.'}</strong><p>{verdict.explanation}</p></div><button className={styles.button} disabled={busy} onClick={nextQuestion}>{busy?'Registrando…':'Continuar →'}</button></>:<button className={styles.button} disabled={selected===null||busy} onClick={answer}>{busy?'Salvando…':'Verificar resposta'}</button>}
   </section><p className={styles.footerNote}>Cada resposta é verificada e registrada no Google Sheets. As dificuldades seguintes dependem dos seus acertos.</p></>;
 }

 const summaryView=()=>summary?<>{header('DIAGNÓSTICO CONCLUÍDO','Seu mapa de conhecimentos','Uma fotografia inicial das competências avaliadas — não é uma certificação de domínio.')}<div className={styles.grid3}><div className={styles.stat}><small>Acertos</small><strong>{summary.correct}/{summary.total}</strong></div><div className={styles.stat}><small>Competências</small><strong>6</strong></div><div className={styles.stat}><small>Prioridades</small><strong>{summary.priorities.length}</strong></div></div><h2 className={styles.sectionTitle}>Desempenho por competência</h2>{skillCards(summary)}<section className={styles.panel}><h2>Por onde começar</h2>{summary.priorities.length?<p>Recomendamos revisar: {summary.priorities.map(skillName).join(', ')}.</p>:<p>Você acertou as questões fundamentais e intermediárias nas seis competências. Continue praticando.</p>}<div className={styles.actions}><button className={styles.button} onClick={()=>navigate('trilha')}>Ver minha trilha →</button><button className={`${styles.button} ${styles.buttonSoft}`} onClick={()=>navigate('progresso')}>Histórico</button></div></section></>:null;

 return <div className={styles.shell}><aside className={styles.sidebar}>
  <div className={styles.brand}><div className={styles.logo}>∑</div><div><strong>aprendendo<br/>matemática</strong><br/><small>POR WEBAPPCAP</small></div></div>
  <nav className={styles.nav} aria-label="Navegação do projeto">{pages.map(([key,label,icon])=><button key={key} type="button" aria-current={page===key?'page':undefined} onClick={()=>navigate(key)}><span className={styles.navIcon}>{icon}</span><span className={styles.navLabel}>{label}</span></button>)}</nav>
  <div className={styles.sideNote}><strong>Um passo de cada vez.</strong>Aprender matemática é construir confiança, exercício por exercício.</div>
 </aside><main className={styles.main}>
  <div className={styles.topline}><span>PLATAFORMA DE APRENDIZAGEM · WEBAPPCAP</span><span className={styles.pill}>★ Meu perfil</span></div>
  {loading?<div className={styles.loading}>Carregando sua jornada…</div>:error&&!data?<div className={styles.error}><strong>A conexão ainda precisa ser ativada.</strong><p>{error}</p><p>Seu aplicativo anterior e os dados no Google Sheets continuam preservados.</p><button className={styles.button} onClick={()=>{setLoading(true);setError('');refresh().catch(e=>setError(e instanceof Error?e.message:'Erro ao carregar.')).finally(()=>setLoading(false))}}>Tentar novamente</button></div>:<>
   {error?<div role="alert" className={styles.error}>{error}</div>:null}
   {page==='home'?<>{header('BEM-VINDO','A matemática começa aqui','Um caminho de aprendizagem que respeita seu ritmo, do básico ao avançado.')}
    <section className={styles.hero}><small>SEU PRÓXIMO PASSO</small><h2>{last?'Continue evoluindo':'Descubra seu ponto de partida'}</h2><p>Faça um diagnóstico progressivo para encontrar seus pontos fortes e o que merece atenção.</p><button className={`${styles.button} ${styles.buttonWhite}`} disabled={busy} onClick={()=>openQuiz('diagnostico')}>{last?'Refazer diagnóstico':'Iniciar diagnóstico'} →</button></section>
    <div className={styles.grid3}><div className={styles.stat}><small>Questões respondidas</small><strong>{data?.answeredCount||0}</strong></div><div className={styles.stat}><small>Aulas estudadas</small><strong>{points}</strong></div><div className={styles.stat}><small>Último diagnóstico</small><strong>{progressLabel}</strong></div></div>
    <h2 className={styles.sectionTitle}>Seu percurso</h2>{modulesView()}</>:
   page==='trilha'?<>{header('CURRÍCULO','Minha trilha','Seis áreas principais; as aulas serão ampliadas progressivamente.')}{last?<><h2 className={styles.sectionTitle}>Seu mapa atual</h2>{skillCards(last)}</>:<div className={styles.notice}>Faça o diagnóstico para receber prioridades de estudo.</div>}<h2 className={styles.sectionTitle}>Módulos</h2>{modulesView()}</>:
   page==='diagnostico'?mode==='diagnostico'?renderQuiz():summary?summaryView():<>{header('AVALIAÇÃO FORMATIVA','Diagnóstico inteligente','Questões progressivas em seis competências: pare em cada área quando encontrar uma dificuldade.')}<section className={styles.panel}><span className={styles.tag}>6 A 18 QUESTÕES · SEM CRONÔMETRO</span><h2 className={styles.sectionTitle}>Descubra o que já sabe</h2><p className={styles.lead}>Começamos pelo básico em cada tema. Um acerto abre a próxima dificuldade, e um erro indica uma oportunidade de reforço. O resultado é uma recomendação inicial, não uma nota definitiva.</p><button className={styles.button} disabled={busy} onClick={()=>openQuiz('diagnostico')}>{busy?'Carregando…':'Iniciar diagnóstico →'}</button></section>{last?<><h2 className={styles.sectionTitle}>Última avaliação</h2>{skillCards(last)}</>:null}</>:
   page==='aulas'?mode==='pratica'?renderQuiz():lesson?<>{header('AULA INTERATIVA',lesson.titulo,lesson.objetivo)}<section className={styles.panel}><h2 className={styles.sectionTitle}>Vamos entender</h2><div className={styles.theory}>{lesson.teoria}</div><p className={styles.lead}>Leia a explicação e pratique com correção comentada.</p><div className={styles.actions}><button disabled={busy} className={styles.button} onClick={()=>openQuiz('pratica',lesson.aula_id)}>Praticar →</button><button disabled={busy} className={`${styles.button} ${styles.buttonSoft}`} onClick={completeLesson}>Marcar como estudada</button><button className={`${styles.button} ${styles.buttonSecondary}`} onClick={()=>setLesson(null)}>Voltar</button></div></section></>:summary?<><section className={styles.panel}><h2>Prática concluída</h2><p>Você acertou {summary.correct} de {summary.total} questões. Suas respostas foram registradas no Google Sheets.</p><button className={styles.button} onClick={()=>{setSummary(null);setLesson(null)}}>Voltar às aulas</button></section></>:<>{header('BIBLIOTECA','Aulas','Teoria e exercícios comentados, preservados na sua planilha.') }<section className={styles.panel}>{orderedLessons.map(a=><div className={styles.row} key={a.aula_id}><div><h3>{a.titulo}</h3><p>{a.objetivo}</p><span className={styles.tag}>{a.status==='disponivel'?'Disponível':'Em breve'}</span></div><button className={styles.button} disabled={a.status!=='disponivel'} onClick={()=>setLesson(a)}>Estudar →</button></div>)}</section></>:
   <>{header('ACOMPANHAMENTO','Meu progresso','Histórico de estudos e avaliações armazenado no Google Sheets.')}<div className={styles.grid3}><div className={styles.stat}><small>Respostas</small><strong>{data?.answeredCount||0}</strong></div><div className={styles.stat}><small>Aulas estudadas</small><strong>{points}</strong></div><div className={styles.stat}><small>Diagnósticos V0.2</small><strong>{history.length}</strong></div></div>
    <h2 className={styles.sectionTitle}>Histórico de diagnósticos</h2>{history.length?<div className={styles.history}>{history.map(item=><div className={styles.historyItem} key={item.id}><div><strong>{item.result.correct} acertos em {item.result.total} questões</strong><br/><small>{new Date(item.at).toLocaleString('pt-BR')}</small></div><span className={styles.tag}>Concluído</span></div>)}</div>:<div className={styles.notice}>Seu primeiro diagnóstico V0.2 aparecerá aqui.</div>}
    <h2 className={styles.sectionTitle}>Aulas concluídas</h2><section className={styles.panel}>{(data?.progress||[]).filter(p=>p.status==='concluida').length?data?.progress.filter(p=>p.status==='concluida').map(p=><p key={p.aula_id}>✓ {orderedLessons.find(l=>l.aula_id===p.aula_id)?.titulo||p.aula_id}</p>):<p className={styles.lead}>Nenhuma aula marcada como concluída.</p>}</section></>}
  </>}
 </main></div>;
}
