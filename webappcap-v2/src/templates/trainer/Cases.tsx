import { useState } from "react";
import {trainerImageStyle} from '@/core/trainer-content';
import {useTrainer,ph} from "./context";
import type {CSSProperties,KeyboardEvent} from "react";

export default function Cases() {
 const {copy,lists}=useTrainer();const CASES=lists.trainer_results;
  const [i, setI] = useState(0);
  const [p, setP] = useState(50);
  const active=Math.min(i,Math.max(0,CASES.length-1)),c = CASES[active];
  const pick = (n:number) => { setI(n); setP(50); };

  if(!c)return null;
  const tabKey=(event:KeyboardEvent<HTMLButtonElement>,n:number)=>{let next=n;if(event.key==="ArrowDown"||event.key==="ArrowRight")next=(n+1)%CASES.length;else if(event.key==="ArrowUp"||event.key==="ArrowLeft")next=(n+CASES.length-1)%CASES.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=CASES.length-1;else return;event.preventDefault();pick(next);(event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus()};
  return (
    <section id="resultados" style={{ background: "var(--card)" }}>
      <div className="wrap" data-reveal>
        <p className="kick">{copy.trainer_main_results_kicker}</p>
        <h2>{copy.trainer_main_results_title.split("\n").map((line,index)=><span key={index}>{index?<br/>:null}{line}</span>)}</h2>
        <div className="cases">
          <div className="tabs" role="tablist" aria-label="Escolher caso" aria-orientation="vertical">
            {CASES.map((x, n) => (
              <button key={n} className="tab" role="tab" id={`case-${n}`} aria-controls="case-panel" tabIndex={n===active?0:-1} onKeyDown={event=>tabKey(event,n)} aria-selected={n === active} onClick={() => pick(n)}>
                <strong>{x.name}</strong><span>{x.goal} · {x.result}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" id="case-panel" aria-labelledby={`case-${active}`}>
            <div className="ba" style={{ "--p": p + "%" } as CSSProperties}>
              <img style={trainerImageStyle({position:c.after_position,fit:c.after_fit,zoom:c.after_zoom})} src={c.after || ph("FOTO DEPOIS", "#ff5a1f")} alt={`Foto depois: ${c.name}`} />
              <div className="bef"><img style={trainerImageStyle({position:c.before_position,fit:c.before_fit,zoom:c.before_zoom})} src={c.before || ph("FOTO ANTES", "#6f6a62")} alt={`Foto antes: ${c.name}`} /></div>
              <span className="lbl l">Antes</span><span className="lbl r">Depois</span><div className="line"></div>
              <input type="range" min="0" max="100" value={p} onChange={(e) => setP(Number(e.target.value))} aria-label="Deslize para comparar antes e depois" />
            </div>
            <div className="result"><strong>{c.result}</strong><span>{c.name} · {c.goal} · {c.detail}</span></div>
          </div>
        </div>
        <p className="note">{copy.trainer_main_results_note}</p>
      </div>
    </section>
  );
}
