'use client';

import {useState} from 'react';
import {commerceHeroDefaults,type CommerceHeroControls} from '@/core/commerce-hero-controls';
import styles from './appearance.module.css';

type AppearanceValues={accent:string;scale:string;alignment:string;density:string;supportSize?:string;supportBold?:boolean;supportItalic?:boolean;buttonSize?:string;buttonBold?:boolean;buttonItalic?:boolean;hero?:CommerceHeroControls};
type Choice={value:string;label:string;sample:string};

function ChoiceGroup({name,label,value,choices,onChange}:{name:string;label:string;value:string;choices:Choice[];onChange:(value:string)=>void}){
 return <fieldset className={styles.choiceGroup}><legend>{label}</legend><div className={styles.choiceGrid}>{choices.map(choice=><label className={styles.choice} key={choice.value}><input type="radio" name={name} value={choice.value} checked={value===choice.value} onChange={()=>onChange(choice.value)}/><span aria-hidden="true">{choice.sample}</span><strong>{choice.label}</strong></label>)}</div></fieldset>;
}

type Device='desktop'|'mobile';
const field=(base:string,device:Device)=>`${base}_${device}`;

function HeroControls({initial}:{initial:CommerceHeroControls}){
 const [device,setDevice]=useState<Device>('desktop'),[values,setValues]=useState(initial);
 const update=(key:string,value:string)=>setValues(current=>({...current,[key]:value}));
 const reset=()=>{const base=commerceHeroDefaults();setValues(current=>({...current,...Object.fromEntries(Object.entries(base).filter(([key])=>key.endsWith(`_${device}`)))}))};
 const number=(base:string,label:string,min:number,max:number,suffix:string)=>{const key=field(base,device);return <label><span>{label}</span><div className={styles.numberField}><input name={key} type="number" min={min} max={max} value={values[key]} onChange={event=>update(key,event.target.value)}/><i>{suffix}</i></div></label>};
 const toggle=(base:string,label:string)=>{const key=field(base,device);return <label className={styles.toggle}><input name={key} type="checkbox" value="true" checked={values[key]==='true'} onChange={event=>update(key,event.target.checked?'true':'false')}/><span>{label}</span></label>};
 const hiddenDevice:Device=device==='desktop'?'mobile':'desktop';
 return <section className={styles.controlBlock}>{Object.entries(values).filter(([key,value])=>key.endsWith(`_${hiddenDevice}`)&&(!key.includes('_bold_')&&!key.includes('_italic_')||value==='true')).map(([key,value])=><input key={key} type="hidden" name={key} value={value}/>)}<div className={styles.responsiveHead}><div><span className={styles.label}>Primeiro bloco — posição e tipografia</span><p>Os valores abaixo são independentes. X parte da esquerda; Y parte do topo.</p></div><div className={styles.deviceTabs} aria-label="Tela configurada"><button type="button" aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}>Computador</button><button type="button" aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}>Celular</button></div></div>
  <div className={styles.heroControlGroup}><strong>Bloco de textos</strong><div className={styles.selectGrid}>{number('hero_text_x','Posição X',0,75,'%')}{number('hero_text_y','Posição Y',20,90,'%')}{number('hero_text_width','Largura máxima',20,96,'%')}<label><span>Alinhamento</span><select name={field('hero_text_align',device)} value={values[field('hero_text_align',device)]} onChange={event=>update(field('hero_text_align',device),event.target.value)}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label></div></div>
  <div className={styles.heroControlGroup}><strong>Nome do comércio</strong><div className={styles.selectGrid}>{number('hero_title_size','Tamanho',24,120,'px')}{toggle('hero_title_bold','Negrito')}{toggle('hero_title_italic','Itálico')}</div></div>
  <div className={styles.heroControlGroup}><strong>Descrição intermediária</strong><div className={styles.selectGrid}>{number('hero_descriptor_size','Tamanho',10,36,'px')}{toggle('hero_descriptor_bold','Negrito')}{toggle('hero_descriptor_italic','Itálico')}</div></div>
  <div className={styles.heroControlGroup}><strong>Frase manuscrita</strong><div className={styles.selectGrid}>{number('hero_slogan_size','Tamanho',14,54,'px')}{toggle('hero_slogan_bold','Negrito')}{toggle('hero_slogan_italic','Itálico')}</div></div>
  <div className={styles.heroControlGroup}><strong>Imagem de capa</strong><div className={styles.selectGrid}>{number('hero_image_x','Ponto focal X',0,100,'%')}{number('hero_image_y','Ponto focal Y',0,100,'%')}{number('hero_image_zoom','Zoom',100,180,'%')}</div></div>
  <button className={styles.resetButton} type="button" onClick={reset}>Restaurar padrão de {device==='desktop'?'computador':'celular'}</button>
 </section>;
}

export default function AppearanceControls({initial}:{initial:AppearanceValues}){
 const [accent,setAccent]=useState(initial.accent),[scale,setScale]=useState(initial.scale),[alignment,setAlignment]=useState(initial.alignment),[density,setDensity]=useState(initial.density);
 const previewStyle={
  '--sample-accent':accent,
  '--sample-heading':'"Archivo Black", "Arial Black", sans-serif',
  '--sample-body':'Inter, Arial, sans-serif',
  '--sample-scale':scale==='compact'?'.88':scale==='large'?'1.12':'1',
  '--sample-gap':density==='compact'?'12px':density==='airy'?'30px':'20px',
  alignItems:alignment==='left'?'flex-start':alignment==='right'?'flex-end':'center',
  textAlign:alignment
 } as React.CSSProperties;
 const swatches=['#eabf2f','#d9ff43','#315ee7','#e85d3f','#c04fd8','#18a77b'];
 return <div className={styles.customizer}>
  <div className={styles.controls}>
   <section className={styles.controlBlock}><div><span className={styles.label}>Cor principal</span><p>Esta cor orienta os fundos, áreas de destaque e elementos estruturais do site.</p></div><div className={styles.colorRow}>{swatches.map(color=><button key={color} type="button" className={styles.swatch} aria-label={`Usar cor ${color}`} aria-pressed={accent===color} style={{backgroundColor:color}} onClick={()=>setAccent(color)}/>)}<label className={styles.colorPicker}><input name="accent" type="color" value={accent} onChange={event=>setAccent(event.target.value)}/><span>{accent.toUpperCase()}</span></label></div></section>
   <section className={styles.controlBlock}><span className={styles.label}>Textos de apoio e botões</span><p>A família tipográfica segue o design do modelo. Ajuste somente tamanho e ênfase.</p><div className={styles.selectGrid}><label><span>Tamanho do texto de apoio</span><input name="support_size" type="number" min="10" max="28" defaultValue={initial.supportSize||'14'}/></label><label><span><input name="support_bold" type="checkbox" value="true" defaultChecked={initial.supportBold}/> Negrito</span></label><label><span><input name="support_italic" type="checkbox" value="true" defaultChecked={initial.supportItalic}/> Itálico</span></label><label><span>Tamanho dos botões</span><input name="button_size" type="number" min="9" max="22" defaultValue={initial.buttonSize||'12'}/></label><label><span><input name="button_bold" type="checkbox" value="true" defaultChecked={initial.buttonBold!==false}/> Negrito</span></label><label><span><input name="button_italic" type="checkbox" value="true" defaultChecked={initial.buttonItalic}/> Itálico</span></label></div></section>
   {initial.hero?<HeroControls initial={initial.hero}/>:null}
   <ChoiceGroup name="scale" label="Tamanho geral" value={scale} onChange={setScale} choices={[{value:'compact',label:'Compacto',sample:'Aa'},{value:'normal',label:'Padrão',sample:'Aa'},{value:'large',label:'Grande',sample:'Aa'}]}/>
   <ChoiceGroup name="alignment" label="Alinhamento" value={alignment} onChange={setAlignment} choices={[{value:'left',label:'Esquerda',sample:'☰'},{value:'center',label:'Centro',sample:'☷'},{value:'right',label:'Direita',sample:'☰'}]}/>
   <ChoiceGroup name="density" label="Espaçamento das seções" value={density} onChange={setDensity} choices={[{value:'compact',label:'Compacto',sample:'≡'},{value:'normal',label:'Padrão',sample:'☷'},{value:'airy',label:'Espaçoso',sample:'☰'}]}/>
  </div>
  <aside className={styles.previewColumn}><span className={styles.previewLabel}>PRÉVIA DAS ESCOLHAS</span><div className={styles.preview} style={previewStyle}><div className={styles.previewNav}><i/><span>Seu nome</span></div><div className={styles.previewBody}><small>SEU TRABALHO</small><h2>Uma presença digital com identidade.</h2><p>Veja como títulos, textos, cor, alinhamento e proporções funcionam juntos.</p><button type="button">Conheça meu trabalho →</button></div><div className={styles.previewCards}><i/><i/><i/></div></div><p className={styles.previewHint}>Esta amostra facilita a comparação. O resultado completo aparece no Preview do site.</p></aside>
 </div>;
}
