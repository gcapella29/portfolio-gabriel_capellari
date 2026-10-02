import {useTrainer,type StateCopy} from "./context";
const Lines=({text}:{text:string})=><>{text.split("\n").map((line,index)=><span key={index}>{index?<br/>:null}{line}</span>)}</>;

const link = { target: "_blank", rel: "noopener noreferrer" };

export function Method() {
  const {copy,lists}=useTrainer();
  return (
    <section id="metodo">
      <div className="wrap" data-reveal>
        <p className="kick">{copy.trainer_main_method_kicker}</p>
        <h2><Lines text={copy.trainer_main_method_title}/></h2>
        <div className="steps">
          {lists.trainer_method.map((row,index)=><div className="step" key={index}><i>{String(index+1).padStart(2,"0")}</i><h3>{row.title}</h3><p>{row.description}</p></div>)}
        </div>
      </div>
    </section>
  );
}

export function Plans({ t }:{t:StateCopy}) {
  const {copy,lists,wa}=useTrainer();
  return (
    <section id="modalidades">
      <div className="wrap" data-reveal>
        <p className="kick">{copy.trainer_main_modes_kicker}</p>
        <h2><Lines text={copy.trainer_main_modes_title}/></h2>
        <div className="plans">
          {lists.trainer_modes.map((x,index) => (
            <div className="plan" key={index} style={{animationDelay:`${Math.min(index,4)*60}ms`}}>
              <h3>{x.title}</h3>
              {x.audience?<p className="plan-audience"><strong>Ideal para</strong> {x.audience}</p>:null}
              <p>{x.description}</p>
              <ul>{x.features.split("\n").map(l=>l.trim()).filter(Boolean).map((l,index) => <li key={index}>{l}</li>)}</ul>
              <a href={wa(t.msg)} {...link}>{copy.trainer_main_modes_cta}</a>
            </div>
          ))}
        </div>
        <div className="quotes">
          {lists.testimonials.map((row,index)=><blockquote key={index}>“{row.text}”<cite>{[row.name,row.role].filter(Boolean).join(", ")}</cite></blockquote>)}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const {copy,lists}=useTrainer();
  return (
    <section style={{ paddingTop: 0 }}>
      <div className="wrap" data-reveal>
        <p className="kick">{copy.trainer_main_faq_kicker}</p>
        {lists.faq.map((row,index)=><details key={index}><summary>{row.question}</summary><p>{row.answer}</p></details>)}
      </div>
    </section>
  );
}

export function Final({ t }:{t:StateCopy}) {
  const {copy,wa}=useTrainer();
  return (
    <section className="final">
      <div className="wrap">
        <h2><Lines text={copy.trainer_main_final_title}/></h2>
        <p className="lead">{t.sub}</p>
        <a className="btn" href={wa(t.msg)} {...link}><span>{t.btn}</span></a>
      </div>
    </section>
  );
}

export function Footer() {
  const {name,cref}=useTrainer();
  return (
    <footer>
      <div className="wrap foot">
        <div>© {new Date().getFullYear()} {name} · Personal Trainer{cref?` · ${cref}`:""}</div>
        <div>Site por <a href="https://webappcap.com.br" target="_blank" rel="noopener">WebAppCap</a></div>
      </div>
    </footer>
  );
}

export function Dock({ t }:{t:StateCopy}) {
  const {copy,wa}=useTrainer();
  return (
    <div className="dock">
      <div><span className="dot"></span><strong>{t.pill}</strong><small>{t.title}</small></div>
      <a className="btn" href={wa(t.msg)} {...link}><span>{t.short}</span></a>
    </div>
  );
}
