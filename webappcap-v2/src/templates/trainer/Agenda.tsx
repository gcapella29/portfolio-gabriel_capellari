import { useRef, useState } from "react";
import {useTrainer,type StateCopy} from "./context";
import type {ChangeEvent,FormEvent} from "react";

export default function Agenda({ t }:{t:StateCopy;agenda:"aberta"|"fechada"}) {
 const {copy,lists,goals,wa}=useTrainer();
 const modes=lists.trainer_modes.map(row=>row.title).filter(Boolean);
  const [f, setF] = useState({ name: "", phone: "", goal: goals[0]||"Outro", mode: modes[0]||"Outro", msg: "" });
  const nameRef = useRef<HTMLInputElement>(null), phoneRef = useRef<HTMLInputElement>(null);
  const set = (k:keyof typeof f) => (e:ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = f.name.trim(), phone = f.phone.trim();
    if (!name || phone.replace(/\D/g, "").length < 10) {
      const bad = !name ? nameRef.current : phoneRef.current;
      if(!bad)return;bad.focus(); bad.setCustomValidity("Preencha este campo"); bad.reportValidity(); bad.setCustomValidity(""); return;
    }
    const msg = f.msg.trim();
    const text = [
      `Olá! Aqui é ${name}.`,
      t.msg,
      "", `Objetivo: ${f.goal}`, `Modalidade: ${f.mode}`, `Meu WhatsApp: ${phone}`,
      msg ? `\nMensagem: ${msg}` : "",
    ].join("\n");
    const url=wa(text);if(!url){phoneRef.current?.setCustomValidity("O WhatsApp do profissional ainda não foi configurado.");phoneRef.current?.reportValidity();phoneRef.current?.setCustomValidity("");return}
    window.open(url, "_blank", "noopener");
  }

  return (
    <section className="agenda" id="agenda">
      <div className="wrap status">
        <div data-reveal>
          <p className="kick">{copy.trainer_main_agenda_kicker}</p>
          <div className="status-big"><span className="dot"></span><span>{t.title}</span></div>
          <p className="lead">{t.sub}</p>
          <div className="hero-cta">
            <a className="btn btn-acc" href={wa(t.msg)} target="_blank" rel="noopener noreferrer"><span>{t.btn}</span></a>
          </div>

        </div>
        <div data-reveal>
          <form className="form" onSubmit={submit} noValidate>
            <h3>{t.formTitle}</h3>
            <label>{copy.trainer_main_form_name} <input ref={nameRef} value={f.name} onChange={set("name")} autoComplete="name" maxLength={120} required placeholder={copy.trainer_main_form_name_placeholder} /></label>
            <label>{copy.trainer_main_form_phone} <input ref={phoneRef} value={f.phone} onChange={set("phone")} type="tel" autoComplete="tel" inputMode="tel" maxLength={30} required placeholder={copy.trainer_main_form_phone_placeholder} /></label>
            <label>{copy.trainer_main_form_goal}
              <select value={f.goal} onChange={set("goal")}>
                {goals.map((o) => <option key={o}>{o}</option>)}
              </select></label>
            <label>{copy.trainer_main_form_mode}
              <select value={f.mode} onChange={set("mode")}>
                {(modes.length?modes:["Outro"]).map((o) => <option key={o}>{o}</option>)}
              </select></label>
            <label className="full">{copy.trainer_main_form_message} <textarea maxLength={2000} value={f.msg} onChange={set("msg")} placeholder={copy.trainer_main_form_message_placeholder} /></label>
            <button className="btn" type="submit">{t.formBtn}</button>
            <p className="hint">{copy.trainer_main_form_hint}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
