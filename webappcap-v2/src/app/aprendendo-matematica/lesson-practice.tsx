'use client';
import {useState} from 'react';
import MathExplanation from './math-explanation';
import styles from './math.module.css';

type Task={id:string;question:string;options:string[];explanation:string};
type Result={correct:boolean;correctIndex:number;explanation:string};
type Trial={selected:number;verdict:Result};
export default function LessonPractice({items,topic}:{items:Task[];topic:string}){
 const [answers,setAnswers]=useState<Record<string,Trial>>({});
 const [choices,setChoices]=useState<Record<string,number>>({});
 const [pending,setPending]=useState<string|null>(null);
 const [error,setError]=useState('');
 const attempted=items.filter(t=>answers[t.id]);
 const correct=attempted.filter(t=>answers[t.id].verdict.correct).length;
 async function verify(item:Task){
  if(choices[item.id]===undefined||pending||answers[item.id])return;
  setPending(item.id);setError('');
  try{
   const r=await fetch('/api/math',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'answer',id:item.id,index:choices[item.id]})});
   const body=await r.json().catch(()=>({ok:false,error:'Resposta inesperada do servidor.'}));
   if(!r.ok||!body.ok)throw new Error(String(body.error||'Não foi possível registrar sua resposta.'));
   setAnswers(v=>({...v,[item.id]:{selected:choices[item.id],verdict:body.data as Result}}));
  }catch(e){setError(e instanceof Error?e.message:'Falha ao corrigir.');}
  finally{setPending(null)}
 }
 return <section className={styles.inLessonPractice} aria-label="Exercícios de fixação da aula">
  <div className={styles.inLessonHeading}><div><span className={styles.chapterMarker}>FIXAÇÃO · PRATIQUE AGORA</span><h2>Você consegue resolver?</h2><p>Três exercícios graduais sobre este assunto. Responda aqui, receba a explicação e registre sua tentativa no progresso.</p></div><span className={styles.inLessonCounter}>{attempted.length}/{items.length} feitos</span></div>
  <div className={styles.inLessonTrack}><span style={{width:(100*attempted.length/items.length)+'%'}}/></div>
  {items.map((item,i)=>{
   const answered=answers[item.id];const choice=choices[item.id];
   return <section className={styles.inLessonQuestion} key={item.id}>
    <div className={styles.inLessonQuestionMeta}><span>QUESTÃO {i+1} DE {items.length}</span><span>{i===0?'Compreensão':i===1?'Aplicação':'Desafio'}</span></div>
    <h3>{item.question}</h3>
    <div className={styles.inLessonOptions}>{item.options.map((option,k)=><button key={k} type="button" disabled={Boolean(answered)||Boolean(pending)} onClick={()=>setChoices(v=>({...v,[item.id]:k}))} className={[(choice===k?styles.inLessonSelected:''),answered&&k===answered.verdict.correctIndex?styles.inLessonRight:'',answered&&choice===k&&!answered.verdict.correct?styles.inLessonWrong:''].join(' ')}><span>{String.fromCharCode(65+k)}</span>{option}</button>)}</div>
    {answered?<MathExplanation explanation={answered.verdict.explanation} correct={answered.verdict.correct} chosen={item.options[answered.selected]} correctOption={item.options[answered.verdict.correctIndex]} topic={topic}/>:<button className={styles.inLessonVerify} disabled={choice===undefined||Boolean(pending)} onClick={()=>void verify(item)}>{pending===item.id?'Registrando…':'Conferir resposta →'}</button>}
   </section>
  })}
  {error?<div className={styles.error} role="alert">{error}</div>:null}
  {attempted.length===items.length?<div className={styles.inLessonResult}><strong>Prática concluída: {correct} de {items.length} acertos.</strong><p>Suas tentativas foram registradas no Google Sheets. Se não acertou todas, volte aos exemplos desta aula e tente novas questões na seção Praticar.</p></div>:null}
 </section>;
}