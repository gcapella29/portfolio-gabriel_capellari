'use client';

import {useState} from 'react';
import styles from './appearance.module.css';

type AppearanceValues={accent:string;scale:string;headingFont:string;bodyFont:string;alignment:string;density:string;supportFont?:string;supportSize?:string;supportBold?:boolean;supportItalic?:boolean;buttonFont?:string;buttonSize?:string;buttonBold?:boolean;buttonItalic?:boolean};
type Choice={value:string;label:string;sample:string};

const fontStack=(font:string)=>`"${font}", Arial, Helvetica, sans-serif`;

function ChoiceGroup({name,label,value,choices,onChange}:{name:string;label:string;value:string;choices:Choice[];onChange:(value:string)=>void}){
 return <fieldset className={styles.choiceGroup}><legend>{label}</legend><div className={styles.choiceGrid}>{choices.map(choice=><label className={styles.choice} key={choice.value}><input type="radio" name={name} value={choice.value} checked={value===choice.value} onChange={()=>onChange(choice.value)}/><span aria-hidden="true">{choice.sample}</span><strong>{choice.label}</strong></label>)}</div></fieldset>;
}

export default function AppearanceControls({initial}:{initial:AppearanceValues}){
 const [accent,setAccent]=useState(initial.accent),[scale,setScale]=useState(initial.scale),[headingFont,setHeadingFont]=useState(initial.headingFont),[bodyFont,setBodyFont]=useState(initial.bodyFont),[alignment,setAlignment]=useState(initial.alignment),[density,setDensity]=useState(initial.density);
 const previewStyle={
  '--sample-accent':accent,
  '--sample-heading':fontStack(headingFont),
  '--sample-body':fontStack(bodyFont),
  '--sample-scale':scale==='compact'?'.88':scale==='large'?'1.12':'1',
  '--sample-gap':density==='compact'?'12px':density==='airy'?'30px':'20px',
  alignItems:alignment==='left'?'flex-start':alignment==='right'?'flex-end':'center',
  textAlign:alignment
 } as React.CSSProperties;
 const swatches=['#eabf2f','#d9ff43','#315ee7','#e85d3f','#c04fd8','#18a77b'];
 return <div className={styles.customizer}>
  <div className={styles.controls}>
   <section className={styles.controlBlock}><div><span className={styles.label}>Cor principal</span><p>Esta cor orienta os fundos, áreas de destaque e elementos estruturais do site.</p></div><div className={styles.colorRow}>{swatches.map(color=><button key={color} type="button" className={styles.swatch} aria-label={`Usar cor ${color}`} aria-pressed={accent===color} style={{backgroundColor:color}} onClick={()=>setAccent(color)}/>)}<label className={styles.colorPicker}><input name="accent" type="color" value={accent} onChange={event=>setAccent(event.target.value)}/><span>{accent.toUpperCase()}</span></label></div></section>
   <section className={styles.controlBlock}><span className={styles.label}>Tipografia</span><div className={styles.selectGrid}><label><span>Títulos</span><select name="heading_font" value={headingFont} onChange={event=>setHeadingFont(event.target.value)}><option>Montserrat</option><option>Manrope</option><option>Fraunces</option><option>Playfair Display</option></select></label><label><span>Textos</span><select name="body_font" value={bodyFont} onChange={event=>setBodyFont(event.target.value)}><option>DM Sans</option><option>Inter</option><option>Manrope</option><option>Montserrat</option></select></label></div></section>
   <section className={styles.controlBlock}><span className={styles.label}>Textos de apoio e botões</span><p>Controle fino para frases curtas da abertura e textos dos botões.</p><div className={styles.selectGrid}><label><span>Fonte do texto de apoio</span><select name="support_font" defaultValue={initial.supportFont||bodyFont}><option>DM Sans</option><option>Inter</option><option>Manrope</option><option>Montserrat</option></select></label><label><span>Tamanho do texto de apoio</span><input name="support_size" type="number" min="10" max="28" defaultValue={initial.supportSize||'14'}/></label><label><span><input name="support_bold" type="checkbox" value="true" defaultChecked={initial.supportBold}/> Negrito</span></label><label><span><input name="support_italic" type="checkbox" value="true" defaultChecked={initial.supportItalic}/> Itálico</span></label><label><span>Fonte dos botões</span><select name="button_font" defaultValue={initial.buttonFont||bodyFont}><option>DM Sans</option><option>Inter</option><option>Manrope</option><option>Montserrat</option></select></label><label><span>Tamanho dos botões</span><input name="button_size" type="number" min="9" max="22" defaultValue={initial.buttonSize||'12'}/></label><label><span><input name="button_bold" type="checkbox" value="true" defaultChecked={initial.buttonBold!==false}/> Negrito</span></label><label><span><input name="button_italic" type="checkbox" value="true" defaultChecked={initial.buttonItalic}/> Itálico</span></label></div></section>
   <ChoiceGroup name="scale" label="Tamanho geral" value={scale} onChange={setScale} choices={[{value:'compact',label:'Compacto',sample:'Aa'},{value:'normal',label:'Padrão',sample:'Aa'},{value:'large',label:'Grande',sample:'Aa'}]}/>
   <ChoiceGroup name="alignment" label="Alinhamento" value={alignment} onChange={setAlignment} choices={[{value:'left',label:'Esquerda',sample:'☰'},{value:'center',label:'Centro',sample:'☷'},{value:'right',label:'Direita',sample:'☰'}]}/>
   <ChoiceGroup name="density" label="Espaçamento das seções" value={density} onChange={setDensity} choices={[{value:'compact',label:'Compacto',sample:'≡'},{value:'normal',label:'Padrão',sample:'☷'},{value:'airy',label:'Espaçoso',sample:'☰'}]}/>
  </div>
  <aside className={styles.previewColumn}><span className={styles.previewLabel}>PRÉVIA DAS ESCOLHAS</span><div className={styles.preview} style={previewStyle}><div className={styles.previewNav}><i/><span>Seu nome</span></div><div className={styles.previewBody}><small>SEU TRABALHO</small><h2>Uma presença digital com identidade.</h2><p>Veja como títulos, textos, cor, alinhamento e proporções funcionam juntos.</p><button type="button">Conheça meu trabalho →</button></div><div className={styles.previewCards}><i/><i/><i/></div></div><p className={styles.previewHint}>Esta amostra facilita a comparação. O resultado completo aparece no Preview do site.</p></aside>
 </div>;
}
