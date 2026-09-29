'use client';

import {useState} from 'react';

type Part='eyebrow'|'title'|'subtitle';
const parts:[Part,string][]=[['eyebrow','Frase acima do título'],['title','Título'],['subtitle','Descrição']];
const string=(value:unknown)=>String(value??'');
const fieldStyle={display:'grid',gap:5,minWidth:0} as const;
const gridStyle={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10} as const;
const inputStyle={width:'100%',minHeight:38,padding:'7px 10px',border:'1px solid #dfe3ea',borderRadius:9,background:'#fff',color:'#202939'} as const;

function ColorField({name,initial}:{name:string;initial:string}){
 const [color,setColor]=useState(/^#[\da-f]{6}$/i.test(initial)?initial:'#ffffff');
 const [mode,setMode]=useState(/^#[\da-f]{6}$/i.test(initial)?'custom':'default');
 return <label style={fieldStyle}><span>Cor</span><select name={name} style={inputStyle} value={mode==='default'?'default':color} onChange={event=>{if(event.target.value==='default')setMode('default');else setMode('custom')}}><option value="default">Padrão do modelo</option><option value={color}>Cor escolhida</option></select><input type="color" aria-label="Escolher cor" value={color} onChange={event=>{setColor(event.target.value);setMode('custom')}} style={{width:'100%',height:34}}/></label>;
}

export default function HeroTypographyFields({initial}:{initial:Record<string,unknown>}){
 const number=(key:string,label:string,min:number,max:number)=> <label style={fieldStyle} key={key}><span>{label}</span><input name={key} type="number" min={min} max={max} defaultValue={string(initial[key]??0)} style={inputStyle}/></label>;
 const select=(key:string,label:string,options:[string,string][])=> <label style={fieldStyle} key={key}><span>{label}</span><select name={key} defaultValue={string(initial[key]??'default')} style={inputStyle}>{options.map(([value,text])=><option value={value} key={value}>{text}</option>)}</select></label>;
 return <div style={{display:'grid',gap:18}}>
  <div><strong>Posição do conjunto</strong><div style={gridStyle}>{number('hero_copy_x','Horizontal (px)',-240,240)}{number('hero_copy_y','Vertical (px)',-240,240)}</div></div>
  {parts.map(([part,label])=><fieldset key={part} style={{minWidth:0,border:'1px solid #e3e6ea',borderRadius:12,padding:12}}><legend style={{padding:'0 5px',fontWeight:800}}>{label}</legend><div style={gridStyle}>
   {number(`hero_${part}_size`,'Tamanho (0 = original)',0,part==='title'?140:40)}
   {number(`hero_${part}_x`,'Mover na horizontal (px)',-240,240)}
   {number(`hero_${part}_y`,'Mover na vertical (px)',-240,240)}
   <ColorField name={`hero_${part}_color`} initial={string(initial[`hero_${part}_color`])}/>
   {select(`hero_${part}_font`,'Fonte',[['default','Padrão do modelo'],['serif','Clássica'],['sans','Sem serifa'],['display','Fraunces']])}
   {select(`hero_${part}_bold`,'Peso',[['default','Padrão do modelo'],['true','Negrito'],['false','Normal']])}
   {select(`hero_${part}_italic`,'Estilo',[['default','Padrão do modelo'],['true','Itálico'],['false','Sem itálico']])}
   {select(`hero_${part}_motion`,'Entrada',[['default','Padrão do modelo'],['rise','Subir'],['slide-left','Vir da esquerda'],['slide-right','Vir da direita'],['soft-zoom','Aproximar'],['none','Sem efeito']])}
  </div></fieldset>)}
 </div>;
}
