import {SiteImage} from '../site-image';
import {useTrainer,ph,type StateCopy} from "./context";
import type {MouseEvent} from "react";
const navigate=(event:MouseEvent<HTMLAnchorElement>)=>{const root=event.currentTarget.getRootNode() as ShadowRoot;const target=root.getElementById(event.currentTarget.hash.slice(1));if(target){event.preventDefault();target.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}};

export function Nav({ t }:{t:StateCopy}) {
  const {name,copy,lists}=useTrainer();
  return (
    <nav className="nav" aria-label="Principal">
      <div className="wrap nav-in">
        <a className="brand" onClick={navigate} href="#topo">{name.split(" ").slice(0,-1).join(" ")} <b>{name.split(" ").at(-1)}</b></a>
        <div className="links">
          <a onClick={navigate} href="#metodo">{copy.trainer_main_nav_method}</a>{lists.trainer_results.length?<a onClick={navigate} href="#resultados">{copy.trainer_main_nav_results}</a>:null}<a onClick={navigate} href="#modalidades">{copy.trainer_main_nav_modes}</a>
          <a className="pill" onClick={navigate} href="#agenda"><span className="dot"></span><span>{t.pill}</span></a>
        </div>
      </div>
    </nav>
  );
}

export function Hero({ t }:{t:StateCopy}) {
  const {name,cref,portrait,portraitStyle,copy,lists,wa}=useTrainer();
  return (
    <header className="hero" id="topo">
      <div className="wrap hero-grid">
        <div>
          <p className="kick">{copy.hero_kicker}</p>
          <h1>{copy.hero_title} <em>{copy.trainer_main_hero_emphasis}</em> {copy.trainer_main_hero_end}</h1>
          <p className="lead">{copy.hero_text}</p>
          <div className="hero-cta">
            <a className="btn btn-acc" href={wa(t.msg)} target="_blank" rel="noopener noreferrer"><span>{t.btn}</span></a>
            {lists.trainer_results.length?<a className="btn btn-out" onClick={navigate} href="#resultados">{copy.trainer_main_results_cta}</a>:null}
          </div>
          <div className="stats">
            {lists.trainer_stats.map((row,index)=><div key={index}><strong>{row.value}</strong><span>{row.label}</span></div>)}
          </div>
        </div>
        <div className="portrait">
          <SiteImage loading="eager" imageWidth={1920} sizes="(max-width:960px) 100vw, 50vw" style={portraitStyle} src={portrait || ph("FOTO DO PERSONAL", "#3a3a3a")} alt={`Foto do personal trainer ${name}`} />
          {cref?<span className="cref">{cref}</span>:null}
        </div>
      </div>
    </header>
  );
}
