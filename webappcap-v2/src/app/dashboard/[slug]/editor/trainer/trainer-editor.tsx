'use client';
import {useState} from 'react';
import {trainerCopy,trainerData,trainerLists,trainerStates,type TrainerListKey,type TrainerRow,trainerImage} from '@/core/trainer-content';
import type {V2Content} from '@/core/onboarding-data';
import DirectImageField from '../../content/direct-image-field';
import EditorPageControls from '../../editor-page-controls';
import {saveTrainerAction} from './actions';
import styles from './trainer-editor.module.css';

const labels:Record<string,string>={hero_kicker:'Frase de abertura',hero_title:'Título — primeira parte',trainer_main_hero_emphasis:'Palavra em destaque',trainer_main_hero_end:'Título — parte final',hero_text:'Apresentação',trainer_main_results_cta:'Botão de resultados',trainer_main_method_kicker:'Método — rótulo',trainer_main_method_title:'Método — título',trainer_main_results_kicker:'Resultados — rótulo',trainer_main_results_title:'Resultados — título',trainer_main_results_note:'Resultados — observação',trainer_main_modes_kicker:'Modalidades — rótulo',trainer_main_modes_title:'Modalidades — título',trainer_main_modes_cta:'Modalidades — botão',trainer_main_faq_kicker:'FAQ — rótulo',trainer_main_final_title:'Chamada final — título',trainer_main_nav_method:'Menu — Método',trainer_main_nav_results:'Menu — Resultados',trainer_main_nav_modes:'Menu — Modalidades',trainer_main_form_name:'Formulário — nome',trainer_main_form_phone:'Formulário — WhatsApp',trainer_main_form_goal:'Formulário — objetivo',trainer_main_form_mode:'Formulário — modalidade',trainer_main_form_message:'Formulário — mensagem',trainer_main_form_name_placeholder:'Dica do campo nome',trainer_main_form_phone_placeholder:'Dica do campo WhatsApp',trainer_main_form_message_placeholder:'Dica do campo mensagem',trainer_main_form_hint:'Orientação abaixo do formulário',trainer_main_agenda_kicker:'Agenda — rótulo'};
const stateLabels:Record<string,string>={pill:'Selo',title:'Título',short:'Botão da barra mobile',btn:'Botão principal',sub:'Descrição',formTitle:'Título do formulário',formBtn:'Botão do formulário',msg:'Mensagem inicial do WhatsApp'};
const text=(value:unknown)=>String(value??'');
export default function TrainerEditor({projectId,slug,data,canManageMedia,saved}:{projectId:string;slug:string;data:V2Content;canManageMedia:boolean;saved:boolean}){
 const initial=trainerData(data.content);
 const [lists,setLists]=useState(()=>Object.fromEntries(Object.entries(initial.lists).map(([key,rows])=>[key,rows.map((row,index)=>({...row,_editorId:`${key}-${index}`}))])) as unknown as typeof initial.lists);
 const update=(key:TrainerListKey,index:number,field:string,value:string)=>setLists(current=>({...current,[key]:current[key].map((row,i)=>i===index?{...row,[field]:value}:row)}));
 const field=(key:string,value:string,label=labels[key]||key)=><label className="field" key={key}><span>{label}</span><textarea name={key} rows={value.includes('\n')?3:2} defaultValue={value} maxLength={10000}/></label>;
 return <><form id="trainer-editor-form" action={saveTrainerAction} className={styles.form}>
  <input type="hidden" name="slug" value={slug}/>
  <details className={styles.panel}><summary>01 · Identidade e início</summary><div className={styles.fields}>
   <label className="field"><span>Nome profissional</span><input name="name" defaultValue={text(data.identity.name)} required maxLength={120}/></label>
   <label className="field"><span>CREF</span><input name="trainer_cref" defaultValue={text(data.content.trainer_cref)} maxLength={120}/></label>
   <label className="field"><span>Título da aba do navegador</span><input name="browser_title" defaultValue={text(data.identity.browser_title)} maxLength={80}/></label>
   {['hero_kicker','hero_title','trainer_main_hero_emphasis','trainer_main_hero_end','hero_text'].map(key=>field(key,initial.copy[key as keyof typeof trainerCopy]))}
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:hero" slot="hero" previewAspectRatio="4 / 5" previewMaxWidth={420} label="Foto do personal" current={trainerImage(data.media.hero)} currentPosition={text((data.media.hero as Record<string,unknown>)?.position)||"center"} currentFit={text((data.media.hero as Record<string,unknown>)?.fit)||"cover"} currentZoom={text((data.media.hero as Record<string,unknown>)?.zoom)||100} help="Quadro 4:5, igual ao site. Arraste e ajuste o zoom; depois salve o rascunho."/>:null}
  </div></details>
  <details className={styles.panel}><summary>02 · Agenda e contato</summary><div className={styles.fields}>
   <label className="field"><span>Agenda</span><select name="trainer_agenda" defaultValue={initial.agenda}><option value="aberta">Aberta</option><option value="fechada">Fechada / lista de espera</option></select></label>
   <label className="field"><span>WhatsApp com DDI</span><input name="whatsapp" defaultValue={text(data.contact.whatsapp)} inputMode="tel" placeholder="5516999999999" maxLength={30}/></label>
   {field('trainer_goals',text(data.content.trainer_goals)||initial.goals.join('\n'),'Objetivos do formulário (um por linha)')}
   {Object.keys(trainerStates).map(state=><fieldset className={styles.state} key={state}><legend>Agenda {state}</legend>{Object.entries(initial.states[state as keyof typeof trainerStates]).map(([key,value])=>field(`trainer_main_${state}_${key}`,value,stateLabels[key]))}</fieldset>)}
  </div></details>
  {(Object.keys(trainerLists) as TrainerListKey[]).map((key,listIndex)=><details className={styles.panel} key={key}><summary>{String(listIndex+3).padStart(2,'0')} · {trainerLists[key].label}</summary><div className={styles.rows}>
   <input type="hidden" name={`section:${key}`} value={JSON.stringify(lists[key])}/>
   {!lists[key].length?<p>Nenhum item cadastrado.</p>:null}
   {lists[key].map((row,index)=><fieldset className={styles.row} key={row._editorId||`${key}-${index}`}><legend>Item {index+1}</legend>
    {Object.entries(trainerLists[key].fields).map(([fieldKey,label])=>fieldKey==='before'||fieldKey==='after'?canManageMedia?<DirectImageField key={fieldKey} projectId={projectId} name={`uploadedMedia:${key}:${index}:${fieldKey}`} slot={`${key}-${index}-${fieldKey}`} label={label} current={row[fieldKey]} currentPosition={row[`${fieldKey}_position`]} currentFit={row[`${fieldKey}_fit`]} currentZoom={row[`${fieldKey}_zoom`]} help="Use fotos autorizadas do mesmo aluno e com enquadramento comparável."/>:<p key={fieldKey}>{label}: edição de mídia indisponível</p>:<label className="field" key={fieldKey}><span>{label}</span><textarea value={row[fieldKey]||''} onChange={event=>update(key,index,fieldKey,event.target.value)} maxLength={10000} rows={fieldKey==='features'||fieldKey==='description'||fieldKey==='text'||fieldKey==='answer'?3:2}/></label>)}
    <button className="action secondary" type="button" onClick={()=>setLists(current=>({...current,[key]:current[key].filter((_,i)=>i!==index)}))}>Remover item</button>
   </fieldset>)}
   <button className="action secondary" type="button" disabled={lists[key].length>=30} onClick={()=>setLists(current=>({...current,[key]:[...current[key],{...Object.fromEntries(Object.keys(trainerLists[key].fields).map(field=>[field,''])),_editorId:crypto.randomUUID()} as TrainerRow]}))}>Adicionar item</button>
  </div></details>)}
  <details className={styles.panel}><summary>09 · Textos e chamadas do modelo</summary><div className={styles.fields}>{Object.keys(trainerCopy).filter(key=>!['hero_kicker','hero_title','trainer_main_hero_emphasis','trainer_main_hero_end','hero_text'].includes(key)).map(key=>field(key,initial.copy[key as keyof typeof trainerCopy]))}</div></details>
 </form><EditorPageControls formId="trainer-editor-form" previewUrl={`/preview/${encodeURIComponent(slug)}?template=personal-trainer-main-1`} saved={saved}/></>;
}
