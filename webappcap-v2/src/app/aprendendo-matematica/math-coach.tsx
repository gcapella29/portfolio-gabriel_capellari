'use client';
import {useEffect,useMemo,useState} from 'react';
import styles from './math.module.css';

type Skill={total:number;correct:number};
type StudyData={stats:{total:number;accuracy:number;skills:Record<string,Skill>;days:{date:string;total:number}[];unresolved:number};mistakes:{id:string;skill:string;resolved:boolean}[]};
type Lesson={aula_id:string;modulo_id:string;titulo:string;status:string};
type Progress={aula_id:string;status:string};
type Module={modulo_id:string;titulo:string;ordem:string|number};
type Topic={name:string;skill:string;lessonId:string;intro:string;prerequisite:string};
const topics:Topic[]=[
 {name:'Valor posicional',skill:'operacoes',lessonId:'A19',intro:'Comece pelos números e seus valores',prerequisite:'Nenhum'},
 {name:'Adição',skill:'operacoes',lessonId:'A20',intro:'Aprenda a juntar quantidades',prerequisite:'A19'},
 {name:'Subtração',skill:'operacoes',lessonId:'A21',intro:'Diferenças e troco com compreensão',prerequisite:'A20'},
 {name:'Multiplicação',skill:'operacoes',lessonId:'A22',intro:'Visualize grupos iguais',prerequisite:'A20'},
 {name:'Divisão',skill:'operacoes',lessonId:'A23',intro:'Repartições iguais',prerequisite:'A22'},
 {name:'Frações — conceito',skill:'fracoes',lessonId:'A10',intro:'Entenda numerador e denominador',prerequisite:'A23'},
 {name:'Frações — equivalência',skill:'fracoes',lessonId:'A11',intro:'Partes equivalentes do mesmo todo',prerequisite:'A10'},
 {name:'Frações — adição',skill:'fracoes',lessonId:'A13',intro:'Junte partes com denominadores iguais',prerequisite:'A11'},
 {name:'Frações — subtração',skill:'fracoes',lessonId:'A15',intro:'Retire partes do mesmo tamanho',prerequisite:'A13'},
 {name:'Frações — multiplicação',skill:'fracoes',lessonId:'A17',intro:'Calcule frações de quantidades',prerequisite:'A15'},
 {name:'Frações — divisão',skill:'fracoes',lessonId:'A18',intro:'Conte quantas porções cabem',prerequisite:'A17'},
 {name:'Porcentagem',skill:'proporcoes',lessonId:'A27',intro:'O que significa por cento',prerequisite:'A10'},
 {name:'Razões e proporções',skill:'proporcoes',lessonId:'A29',intro:'Compare quantidades por unidade',prerequisite:'A23'},
 {name:'Equações',skill:'algebra',lessonId:'A30',intro:'Descubra o valor desconhecido',prerequisite:'A20'},
 {name:'Geometria — perímetro',skill:'geometria',lessonId:'A32',intro:'Meça o contorno',prerequisite:'A20'},
 {name:'Geometria — área',skill:'geometria',lessonId:'A33',intro:'Meça superfícies',prerequisite:'A22'},
 {name:'Estatística — média',skill:'dados',lessonId:'A35',intro:'Entenda os valores de um conjunto',prerequisite:'A23'},
 {name:'Probabilidade',skill:'dados',lessonId:'A37',intro:'Conte resultados possíveis e favoráveis',prerequisite:'A10'}
];
function dateBR(date:string){try{return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});}catch{return date;}}
async function loadStudy():Promise<StudyData>{
 const r=await fetch('/api/math',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'study'})});
 const data=await r.json().catch(()=>({ok:false,error:'Resposta inválida'}));
 if(!r.ok||!data.ok)throw Error(data.error||'Não foi possível consultar os resultados.');
 return data.data;
}
export default function MathCoach({lessons,progress,modules,reviewCount,onLesson,onPractice,onReview}:{lessons:Lesson[];progress:Progress[];modules:Module[];reviewCount:number;onLesson:(id:string)=>void;onPractice:()=>void;onReview:()=>void}){
 const [study,setStudy]=useState<StudyData|null>(null);
 const [error,setError]=useState('');
 const [minutes,setMinutes]=useState<15|25|35>(25);
 const [showAll,setShowAll]=useState(false);
 const [reload,setReload]=useState(0);
 useEffect(()=>{let active=true;loadStudy().then(s=>{if(active){setStudy(s);setError('');}}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Erro ao carregar plano.');});return()=>{active=false;};},[reload]);
 const completed=useMemo(()=>new Set(progress.filter(x=>x.status==='concluida').map(x=>x.aula_id)),[progress]);
 const guidance=useMemo(()=>{
  // Antes de existir histórico, use uma recomendação curricular inicial com a mesma estrutura dos itens avaliados.
  return topics.map((t,i)=>{
   const v=study?.stats.skills[t.skill]||{total:0,correct:0};
   const attempted=v.total;
   const accuracy=attempted?Math.round(v.correct/attempted*100):0;
   const unresolved=(study?.mistakes||[]).filter(m=>m.skill===t.skill&&!m.resolved).length;
   const mastery=attempted<5?'Ainda em observação':attempted>=20&&accuracy>=90?'Bom desempenho sustentado':attempted>=10&&accuracy>=80?'Avançando':accuracy<60?'Reforço necessário':'Em desenvolvimento';
   const prerequisite=t.prerequisite!=='Nenhum'&&!completed.has(t.prerequisite);
   const score=(attempted<5?110:100-accuracy)+(unresolved*8)+(prerequisite?-55:0)+(completed.has(t.lessonId)?-30:0)-i;
   return {...t,attempted,accuracy,score,level:mastery,unresolved,prerequisiteMissing:prerequisite};
  }).sort((a,b)=>b.score-a.score);
 },[study,completed]);
 const available=guidance.filter(x=>lessons.some(l=>l.aula_id===x.lessonId&&l.status==='disponivel'));
 const focus=available.find(x=>!x.prerequisiteMissing)||available[0];
 const tasks=[
  {id:1,time:Math.max(5,Math.round(minutes*.4)),name:'Compreender',description:focus?'Estude '+focus.name.toLowerCase()+' com exemplos guiados.':'Leia uma aula da biblioteca.',icon:'book',action:()=>focus&&onLesson(focus.lessonId)},
  {id:2,time:Math.max(5,Math.round(minutes*.4)),name:'Praticar',description:'Responda questões do assunto, começando pelos fundamentos.',icon:'practice',action:onPractice},
  {id:3,time:Math.max(3,minutes-Math.max(5,Math.round(minutes*.4))*2),name:'Consolidar',description:reviewCount?'Você tem '+reviewCount+' revisão(ões) vencida(s).':'Confira o que aprendeu e revise uma dúvida.',icon:'review',action:onReview}
 ];
 const display=showAll?guidance:guidance.slice(0,6);
 return <div className={styles.coachRoot}>
  <header className={styles.coachHero}><div><span className={styles.coachEyebrow}>V0.5 · ACOMPANHAMENTO ADAPTATIVO</span><h1>Sua próxima conquista começa aqui.</h1><p>Um roteiro de estudo construído com o histórico real das suas respostas. Aprenda no seu ritmo, sem pular os fundamentos.</p></div><div className={styles.coachHeroMark} aria-hidden="true">∑</div></header>
  {error?<div className={styles.notice}>O plano está exibindo a sequência curricular inicial. Não foi possível atualizar o diagnóstico automaticamente: {error}<button onClick={()=>setReload(n=>n+1)} className={styles.coachRetry}>Tentar novamente</button></div>:null}
  <div className={styles.coachSummary}>
   <article><small>Respostas registradas</small><strong>{study?.stats.total??'—'}</strong><span>em todos os exercícios</span></article>
   <article><small>Precisão observada</small><strong>{study?study.stats.accuracy+'%':'—'}</strong><span>não representa nota definitiva</span></article>
   <article><small>Revisões do dia</small><strong>{reviewCount}</strong><span>itens prontos para retornar</span></article>
   <article><small>Aulas concluídas</small><strong>{completed.size}/{lessons.length}</strong><span>trilha de conhecimentos</span></article>
  </div>
  <div className={styles.coachTwoCols}>
   <section className={styles.coachFeature}>
    <div className={styles.coachFeatureHead}><span className={styles.coachEyebrow}>RECOMENDAÇÃO PRINCIPAL</span><span className={styles.coachOutlineTag}>Baseada no seu desempenho</span></div>
    <h2>{focus?.name||'Comece pelos fundamentos'}</h2><p>{focus?.intro}. {focus?.attempted?'Você registrou '+focus.attempted+' resposta(s) nesta competência, com '+focus.accuracy+'% de acertos.':'Ainda não há respostas suficientes para estimar seu desempenho.'}</p>
    {focus?.prerequisiteMissing?<div className={styles.coachWarning}>Antes deste assunto, vale revisar: {topics.find(t=>t.lessonId===focus.prerequisite)?.name||'a aula anterior'}.</div>:null}
    <div className={styles.coachActions}><button onClick={()=>focus&&onLesson(focus.lessonId)} className={styles.coachPrimary}>Continuar esta aula →</button><button className={styles.coachSecondary} onClick={onPractice}>Praticar exercícios</button></div>
    <div className={styles.coachNote}>A recomendação considera precisão, quantidade de tentativas, erros recorrentes e pré-requisitos. Não é um diagnóstico psicométrico.</div>
   </section>
   <section className={styles.coachSchedule}><div className={styles.coachScheduleHead}><div><span className={styles.coachEyebrow}>ROTINA RECOMENDADA</span><h2>Seu plano para hoje</h2></div><div className={styles.coachDuration} role="group" aria-label="Duração do estudo">{([15,25,35] as const).map(v=><button key={v} type="button" onClick={()=>setMinutes(v)} aria-pressed={minutes===v}>{v}min</button>)}</div></div>
    <div className={styles.coachTaskList}>{tasks.map(t=><div key={t.id} className={styles.coachTask}><span className={styles.coachTaskNum}>{t.id}</span><div><strong>{t.name}<small> · {t.time} min</small></strong><p>{t.description}</p></div><button onClick={t.action} aria-label={'Abrir '+t.name}>→</button></div>)}</div>
    <small className={styles.coachDisclaimer}>Os tempos são sugestões flexíveis, não cronômetro nem obrigação de conclusão.</small>
   </section>
  </div>
  <section className={styles.coachSkillPanel}><div className={styles.coachHeading}><div><span className={styles.coachEyebrow}>MAPA DE APRENDIZAGEM</span><h2>Domínio estimado por tema</h2><p>A classificação só ganha confiança à medida que você pratica. Um resultado isolado não significa domínio.</p></div><button onClick={()=>setShowAll(v=>!v)}>{showAll?'Mostrar menos':'Ver todos os temas'}</button></div>
   <div className={styles.coachSkillGrid}>{display.map(item=><article key={item.lessonId} className={styles.coachSkill}><div className={styles.coachSkillHead}><strong>{item.name}</strong><span>{item.level}</span></div><div className={styles.coachSkillBar}><span style={{width:(item.attempted?item.accuracy:0)+'%'}}/></div><div className={styles.coachSkillMeta}><small>{item.attempted?item.accuracy+'% de acertos':'Ainda sem respostas'}</small><button onClick={()=>onLesson(item.lessonId)}>Estudar →</button></div></article>)}</div>
  </section>
  <section className={styles.coachRoadmap}><div className={styles.coachHeading}><div><span className={styles.coachEyebrow}>EVOLUÇÃO</span><h2>Trilha de fundamentos</h2></div></div><div className={styles.coachRoadmapItems}>{[...modules].sort((a,b)=>Number(a.ordem)-Number(b.ordem)).map(m=>{const ls=lessons.filter(l=>l.modulo_id===m.modulo_id);return <article key={m.modulo_id}><strong>{m.titulo}</strong><small>{ls.filter(x=>completed.has(x.aula_id)).length} de {ls.length} aulas estudadas</small><div className={styles.coachSkillBar}><span style={{width:(ls.length?100*ls.filter(x=>completed.has(x.aula_id)).length/ls.length:0)+'%'}}/></div></article>})}</div></section>
 </div>;
}
