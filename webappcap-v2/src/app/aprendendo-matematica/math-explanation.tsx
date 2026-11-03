import styles from './math.module.css';

export default function MathExplanation({explanation,correct,chosen,correctOption,probability=false}:{explanation:string;correct:boolean;chosen?:string;correctOption?:string;probability?:boolean}){
 const sections=explanation.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 const structured=sections.length>1&&sections.some(s=>/^(?:\d+\.|Atenção)/i.test(s));
 return <div className={styles.explanationV5} aria-live="polite">
  <div className={correct?styles.explanationSuccess:styles.explanationIntro}>
   <strong>{correct?'Muito bem! Agora vamos entender por quê.':'O importante agora é entender como chegar à resposta.'}</strong>
   {!correct&&chosen&&correctOption?<p>Você marcou <b>{chosen}</b>. A alternativa correta é <b>{correctOption}</b>. Acompanhe os passos abaixo para descobrir o motivo.</p>:null}
  </div>
  {structured?<div className={styles.explanationSteps}>{sections.map((s,i)=>{
    const cut=s.indexOf('\n');
    const title=cut>=0?s.slice(0,cut).trim():'';
    const body=cut>=0?s.slice(cut+1).trim():s;
    const warning=/^Atenção/i.test(title);
    return <section key={i} className={warning?styles.explanationCaution:styles.explanationStep}>
      <div className={styles.explanationHeader}><span>{warning?'!':i+1}</span><h4>{title.replace(/^\d+\.\s*/,'')}</h4></div>
      <p>{body}</p>
    </section>;
   })}</div>:<div className={styles.explanationSimple}><h4>Resolução comentada</h4><p>{explanation}</p></div>}
  {probability?<p className={styles.explanationSources}>Referências conceituais: <a href="https://openstax.org/books/introductory-statistics/pages/3-1-terminology" target="_blank" rel="noopener noreferrer">OpenStax · Introdução à probabilidade</a> e <a href="https://basenacionalcomum.mec.gov.br/images/BNCC_20dez_site.pdf" target="_blank" rel="noopener noreferrer">BNCC · EF06MA30</a>. Explicações elaboradas para este aplicativo, não reproduzidas desses materiais.</p>:null}
 </div>;
}
