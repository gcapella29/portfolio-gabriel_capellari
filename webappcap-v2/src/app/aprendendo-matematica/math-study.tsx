
'use client';
import {useEffect,useMemo,useState} from 'react';
import styles from './math.module.css';
import MathExplanation from './math-explanation';
type Q={id:string;lessonId:string;skill:string;level:string;title:string;options:string[]};
type Mistake=Q&{wrongCount:number;resolved:boolean;lastAt:string};
type Day={date:string;total:number;correct:number};
type Bucket={total:number;correct:number};
type Study={bank:Q[];mistakes:Mistake[];stats:{total:number;correct:number;accuracy:number;questionCount:number;allQuestionCount:number;unresolved:number;skills:Record<string,Bucket>;modules:Record<string,Bucket>;days:Day[]}};
type Verdict={correct:boolean;correctIndex:number;explanation:string};
type Lesson={aula_id:string;titulo:string;modulo_id:string};
type History={id:string;at:string;result:{correct:number;total:number}};
type Variant='practice'|'simulado'|'mistakes'|'progress';
const names:Record<string,string>={operacoes:'Números e operações',fracoes:'Frações',proporcoes:'Porcentagem e proporções',algebra:'Álgebra',geometria:'Geometria',dados:'Estatística e probabilidade'};
const difficulties:Record<string,string>={facil:'Fundamentos',medio:'Intermediário',dificil:'Desafio'};
const hints:Record<string,string[]>={operacoes:['Veja se a pergunta pede juntar, retirar, agrupar ou repartir.','Resolva primeiro multiplicações e divisões.'],fracoes:['O denominador mostra em quantas partes iguais o todo foi dividido.','Antes de somar, confira se os denominadores são iguais.'],proporcoes:['Identifique qual é a base do percentual ou valor unitário.','Porcentagem: divida a taxa por 100 e multiplique pela base.'],algebra:['Pense na igualdade como uma balança.','Desfaça as operações nos dois lados da equação.'],geometria:['A questão pede contorno ou superfície?','Perímetro soma lados; área de retângulo multiplica base e altura.'],dados:['Ordene os valores e conte os resultados possíveis.','Média soma e divide; probabilidade é favoráveis dividido por possíveis.']};
async function request<T>(action:string,extras:Record<string,unknown>={}):Promise<T>{
 const res=await fetch('/api/math',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action,...extras})});
 const json=await res.json().catch(()=>({ok:false,error:'Resposta inválida do servidor.'}));
 if(!res.ok||!json.ok)throw new Error(String(json.error||'Não foi possível acessar os dados.'));
 return json.data as T;
}
function shuffle<T>(v:T[]){const a=[...v];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export default function MathStudy({variant,lessons=[],history=[]}:{variant:Variant;lessons?:Lesson[];history?:History[]}){
 const [study,setStudy]=useState<Study|null>(null);
 const [error,setError]=useState('');
 const [topic,setTopic]=useState('all');
 const [level,setLevel]=useState('progressivo');
 const [count,setCount]=useState(10);
 const [unresolved,setUnresolved]=useState(true);
 const [queue,setQueue]=useState<Q[]>([]);
 const [pos,setPos]=useState(0);
 const [selected,setSelected]=useState<number|null>(null);
 const [verdict,setVerdict]=useState<Verdict|null>(null);
 const [hint,setHint]=useState(0);
 const [score,setScore]=useState(0);
 const [active,setActive]=useState(false);
 const [finished,setFinished]=useState(false);
 const [busy,setBusy]=useState(false);
 async function reload(){try{const s=await request<Study>('study');setStudy(s);setError('');}catch(e){setError(e instanceof Error?e.message:'Erro ao buscar exercícios.');}}
 useEffect(()=>{void reload()},[]);
 const lessonName=(id:string)=>lessons.find(l=>l.aula_id===id)?.titulo||id;
 const base=variant==='mistakes'?(unresolved?study?.mistakes.filter(m=>!m.resolved):study?.mistakes):study?.bank;
 const filtered=useMemo(()=>(base||[]).filter(q=>(topic==='all'||q.lessonId===topic)&&(level==='progressivo'||q.level===level)),[base,topic,level]);
 const topics=useMemo(()=>[...new Set((study?.bank||[]).map(q=>q.lessonId))].sort(),[study]);
 const title=variant==='practice'?'Treino personalizado':variant==='simulado'?'Simulados':variant==='mistakes'?'Caderno de erros':'Meu desempenho';
 const subtitle=variant==='progress'?'Seu avanço medido a partir das respostas registradas no Google Sheets.':'Escolha os exercícios que fazem sentido para seu momento de aprendizagem.';
 const question=queue[pos];
 function begin(){
  if(!filtered.length){setError('Não há questões com esses filtros.');return;}
  let pool=shuffle(filtered);
  if(variant==='simulado'&&topic==='all'&&level==='progressivo'){
   const groups=new Map<string,Q[]>();pool.forEach(q=>groups.set(q.lessonId,[...(groups.get(q.lessonId)||[]),q]));
   const mix:Q[]=[];while(mix.length<count&&[...groups.values()].some(g=>g.length)){for(const g of groups.values())if(g.length&&mix.length<count)mix.push(g.shift()!);}
   pool=shuffle(mix);
  }else if(level==='progressivo'&&variant!=='mistakes'){
   const order:Record<string,number>={facil:0,medio:1,dificil:2};
   pool.sort((a,b)=>(order[a.level]||0)-(order[b.level]||0));
  }
  setQueue(pool.slice(0,count));setPos(0);setSelected(null);setVerdict(null);setHint(0);setScore(0);setFinished(false);setActive(true);setError('');
 }
 async function answer(){
  if(!question||selected===null||busy||verdict)return;
  setBusy(true);
  try{const answer=await request<Verdict>('answer',{id:question.id,index:selected});setVerdict(answer);if(answer.correct)setScore(n=>n+1);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Não foi possível registrar a resposta.');}
  finally{setBusy(false);}
 }
 function next(){
  if(pos+1>=queue.length){setActive(false);setFinished(true);void reload();}
  else{setPos(n=>n+1);setSelected(null);setVerdict(null);setHint(0);}
 }
 const s=study?.stats,days=s?.days||[],maxDay=Math.max(1,...days.map(d=>d.total));
 return <div className={styles.studyV4}>
  <header className={styles.studyBanner}><span>ESTUDE COM AUTONOMIA · V0.4</span><h1>{title}</h1><p>{subtitle}</p><b aria-hidden="true">∑</b></header>
  {error?<div className={styles.error} role="alert"><strong>Ocorreu um problema de conexão</strong><p>{error}</p><p>Se for a primeira vez que você vê esta tela, publique a nova versão do Code.gs no Apps Script.</p><button className={styles.button} onClick={()=>void reload()}>Verificar novamente</button></div>:null}
  {!study&&!error?<div className={styles.loading}>Carregando seu banco de estudos…</div>:null}
  {s&&variant==='progress'?<>
   <div className={styles.dashboardCards}><article><span>Respostas registradas</span><strong>{s.total}</strong></article><article><span>Precisão geral</span><strong>{s.accuracy}%</strong></article><article><span>Questões catalogadas</span><strong>{s.allQuestionCount}</strong></article><article><span>Questões para reforçar</span><strong>{s.unresolved}</strong></article></div>
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>ÚLTIMOS 14 DIAS</span><h2>O ritmo dos seus estudos</h2></div><div className={styles.dailyChart}>{days.map(d=><div key={d.date} className={styles.dayColumn} title={d.date+': '+d.correct+' acertos em '+d.total+' respostas'}><div className={styles.dayStack}><div className={styles.dayFill} style={{height:(d.total/maxDay*100)+'%'}}><span className={styles.dayMisses} style={{height:(d.total?100*(d.total-d.correct)/d.total:0)+'%'}}/></div></div><small>{d.date.slice(8)}</small></div>)}</div><p className={styles.chartFoot}>Azul: acertos · Laranja: erros · Números do dia do mês na horizontal</p></section>
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>COMPETÊNCIAS</span><h2>Seus pontos fortes e suas dificuldades</h2></div><div className={styles.skillReport}>{Object.entries(names).map(([id,label])=>{const v=s.skills[id]||{total:0,correct:0};const pct=v.total?Math.round(v.correct/v.total*100):0;return <div key={id}><div className={styles.skillHead}><strong>{label}</strong><span>{v.total?pct+'% · '+v.correct+'/'+v.total+' acertos':'Sem respostas'}</span></div><div className={styles.skillRail}><span style={{width:pct+'%'}}/></div></div>})}</div></section>
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>DESEMPENHO POR MÓDULO</span><h2>Sua trajetória</h2></div>{Object.entries(s.modules).length?Object.entries(s.modules).map(([id,v])=><div className={styles.moduleRow} key={id}><strong>{id}</strong><span>{v.correct} acertos em {v.total} respostas</span></div>):<p>Seus resultados por módulo aparecerão após os exercícios.</p>}</section>
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>DIAGNÓSTICOS ANTERIORES</span><h2>Histórico das avaliações</h2></div>{history.length?history.map(h=><div className={styles.moduleRow} key={h.id}><span>{new Date(h.at).toLocaleDateString('pt-BR')}</span><strong>{h.result.correct}/{h.result.total} acertos</strong></div>):<p>Faça um diagnóstico para iniciar seu histórico.</p>}</section>
  </>:s&&finished?<section className={styles.graphSurface}><span className={styles.finishIcon}>✓</span><h2>Treino concluído!</h2><p>Você acertou {score} de {queue.length} questões. As respostas foram armazenadas no Google Sheets.</p><div className={styles.bigScore}>{queue.length?Math.round(100*score/queue.length):0}%</div><button className={styles.v4Primary} onClick={()=>{setFinished(false);setActive(false);}}>Preparar outro treino</button></section>:s&&active&&question?<section className={styles.quizV4}>
   <div className={styles.quizHeader}><span>{variant==='simulado'?'SIMULADO':variant==='mistakes'?'RETOMADA DE ERROS':'TREINO GUIADO'}</span><strong>{pos+1} / {queue.length}</strong></div><div className={styles.quizTrack}><span style={{width:(100*(pos+1)/queue.length)+'%'}}/></div>
   <div className={styles.quizContext}>{lessonName(question.lessonId)} · {difficulties[question.level]}</div><h2>{question.title}</h2>
   <div className={styles.quizOptions}>{question.options.map((o,i)=><button key={i} type="button" disabled={Boolean(verdict)||busy} onClick={()=>setSelected(i)} className={(selected===i?styles.quizSelected+' ':'')+(verdict&&i===verdict.correctIndex?styles.quizRight+' ':'')+(verdict&&!verdict.correct&&selected===i?styles.quizWrong+' ':'')}><b>{String.fromCharCode(65+i)}</b>{o}</button>)}</div>
   {!verdict?<><div className={styles.hintPanel}><strong>Precisa de uma pista?</strong>{(hints[question.skill]||[]).slice(0,hint).map((h,i)=><p key={i}>{h}</p>)}<button type="button" disabled={hint>=2} onClick={()=>setHint(n=>n+1)}>{hint>=2?'Você já viu as duas pistas':'Revelar uma pista →'}</button></div><button className={styles.v4Primary} disabled={selected===null||busy} onClick={()=>void answer()}>{busy?'Salvando…':'Verificar resposta'}</button></>:<><div className={verdict.correct?styles.answerYes:styles.answerNo}><h3>{verdict.correct?'✓ Resposta correta':'Vamos entender o raciocínio'}</h3><MathExplanation explanation={verdict.explanation} correct={verdict.correct} chosen={selected===null?undefined:question.options[selected]} correctOption={question.options[verdict.correctIndex]} topic={question.lessonId}/></div><button className={styles.v4Primary} onClick={next}>{pos+1===queue.length?'Ver resultado final':'Próxima questão →'}</button></>}
   <p className={styles.microcopy}>Cada resposta é salva imediatamente no Google Sheets.</p>
  </section>:s&&variant!=='progress'?<>
   <div className={styles.dashboardCards}><article><span>Banco de prática</span><strong>{s.questionCount}</strong></article><article><span>Nesta seleção</span><strong>{filtered.length}</strong></article><article><span>Erros registrados</span><strong>{study?.mistakes.length||0}</strong></article><article><span>Precisão geral</span><strong>{s.accuracy}%</strong></article></div>
   {variant==='mistakes'?<div className={styles.mistakeToggle}><label><input type="checkbox" checked={unresolved} onChange={e=>setUnresolved(e.target.checked)}/> Mostrar apenas erros ainda não superados</label><p>O histórico de tentativas permanece salvo mesmo depois de um acerto.</p></div>:null}
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>ESCOLHA SEU TREINO</span><h2>{variant==='simulado'?'Monte seu simulado':variant==='mistakes'?'Refaça com compreensão':'Aprenda no seu ritmo'}</h2></div>
    <div className={styles.studyFilters}><label>Assunto<select value={topic} onChange={e=>setTopic(e.target.value)}><option value="all">Todos os assuntos</option>{topics.map(id=><option key={id} value={id}>{lessonName(id)}</option>)}</select></label><label>Grau de dificuldade<select value={level} onChange={e=>setLevel(e.target.value)}><option value="progressivo">Progressiva</option><option value="facil">Fundamentos</option><option value="medio">Intermediário</option><option value="dificil">Desafio</option></select></label><label>Quantidade<select value={count} onChange={e=>setCount(Number(e.target.value))}><option value="5">5 questões</option><option value="10">10 questões</option><option value="20">20 questões</option></select></label></div>
    <div className={styles.studyGo}><span>{filtered.length} questões encontradas</span><button className={styles.v4Primary} disabled={!filtered.length} onClick={begin}>{variant==='simulado'?'Começar simulado':variant==='mistakes'?'Refazer exercícios':'Começar treino'} →</button></div>
   </section>
   <section className={styles.graphSurface}><div className={styles.graphTitle}><span>{variant==='mistakes'?'SEU CADERNO':'PRÉVIA DO CONTEÚDO'}</span><h2>{variant==='mistakes'?'Aprender com os erros':'O que vem pela frente'}</h2></div><div className={styles.questionCards}>{filtered.slice(0,variant==='mistakes'?30:8).map(q=><div key={q.id}><span>{difficulties[q.level]} · {lessonName(q.lessonId)}</span><strong>{q.title}</strong>{variant==='mistakes'?<small>{(q as Mistake).resolved?'Já acertou posteriormente':'Ainda precisa reforçar'} · {(q as Mistake).wrongCount} erro(s)</small>:null}</div>)}</div>{!filtered.length?<p className={styles.lead}>Não há questões com esses filtros. Experimente mudar o assunto ou o nível.</p>:null}</section>
  </>:null}
 </div>;
}
