'use client';

import {useRef,useState,type PointerEvent} from 'react';

type Part='eyebrow'|'title'|'subtitle'|'phone';
const baseParts:[Part,string][]=[['eyebrow','Frase acima do título'],['title','Título'],['subtitle','Descrição']];
const string=(value:unknown)=>String(value??'');
const fieldStyle={display:'grid',gap:5,minWidth:0} as const;
const gridStyle={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10} as const;
const inputStyle={width:'100%',minHeight:38,padding:'7px 10px',border:'1px solid #dfe3ea',borderRadius:9,background:'#fff',color:'#202939'} as const;

function ColorField({name,initial}:{name:string;initial:string}){
 const [color,setColor]=useState(/^#[\da-f]{6}$/i.test(initial)?initial:'#ffffff');
 const [mode,setMode]=useState(/^#[\da-f]{6}$/i.test(initial)?'custom':'default');
 return <label style={fieldStyle}><span>Cor</span><select name={name} style={inputStyle} value={mode==='default'?'default':color} onChange={event=>{if(event.target.value==='default')setMode('default');else setMode('custom')}}><option value="default">Padrão do modelo</option><option value={color}>Cor escolhida</option></select><input type="color" aria-label="Escolher cor" value={color} onChange={event=>{setColor(event.target.value);setMode('custom')}} style={{width:'100%',height:34}}/></label>;
}

export default function HeroTypographyFields({initial,sample,includePhone=false}:{initial:Record<string,unknown>;sample?:Partial<Record<Part,string>>;includePhone?:boolean}){
 const parts:[Part,string][]=includePhone?[...baseParts,['phone','Telefone']]:baseParts;
 const [positions,setPositions]=useState<Record<string,number>>(()=>Object.fromEntries(['copy',...parts.map(([part])=>part)].flatMap(part=>['x','y'].map(axis=>{const key=`hero_${part}_${axis}`;return[key,Number(initial[key])||0]}))));
 const [sizes,setSizes]=useState<Record<string,number>>(()=>Object.fromEntries(parts.map(([part])=>[`hero_${part}_size`,Number(initial[`hero_${part}_size`])||0])));
 const drag=useRef<{part:Part|'copy';x:number;y:number;startX:number;startY:number}|null>(null);
 const position=(part:Part|'copy',axis:'x'|'y')=>positions[`hero_${part}_${axis}`]||0;
 const begin=(event:PointerEvent<HTMLDivElement>)=>{const part=((event.target as HTMLElement).closest<HTMLElement>('[data-text-part]')?.dataset.textPart||'copy') as Part|'copy';drag.current={part,x:event.clientX,y:event.clientY,startX:position(part,'x'),startY:position(part,'y')};event.currentTarget.setPointerCapture(event.pointerId)};
 const move=(event:PointerEvent<HTMLDivElement>)=>{if(!drag.current)return;const {part,x,y,startX,startY}=drag.current;setPositions(previous=>({...previous,[`hero_${part}_x`]:Math.max(-240,Math.min(240,Math.round(startX+(event.clientX-x)*2))),[`hero_${part}_y`]:Math.max(-240,Math.min(240,Math.round(startY+(event.clientY-y)*2)))}))};
 const number=(key:string,label:string,min:number,max:number)=>{const size=key.endsWith('_size'),value=size?sizes[key]||0:positions[key]||0,change=(next:number)=>size?setSizes(previous=>({...previous,[key]:next})):setPositions(previous=>({...previous,[key]:next}));return <label style={fieldStyle} key={key}><span>{label}: <strong>{value}px</strong></span><input type="hidden" name={key} value={value}/><input type="range" min={min} max={max} value={value} onChange={event=>change(Number(event.target.value))} style={{width:'100%',accentColor:'#9c4f2f'}}/></label>};
 const select=(key:string,label:string,options:[string,string][])=> <label style={fieldStyle} key={key}><span>{label}</span><select name={key} defaultValue={string(initial[key]??'default')} style={inputStyle}>{options.map(([value,text])=><option value={value} key={value}>{text}</option>)}</select></label>;
 return <div style={{display:'grid',gap:18}}>
  <div><strong>Arraste os textos na prévia</strong><p style={{margin:'5px 0 10px',fontSize:12,color:'#667085'}}>Arraste um texto para movê-lo. Arraste o fundo para mover o conjunto.</p><div onPointerDown={begin} onPointerMove={move} onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} style={{position:'relative',height:260,overflow:'hidden',touchAction:'none',cursor:'grab',borderRadius:16,background:'linear-gradient(130deg,#58422f,#9c6542 55%,#2e241d)',color:'#fff'}} aria-label="Prévia interativa dos textos da capa"><div style={{position:'absolute',left:35,top:65,width:'calc(100% - 70px)',transform:`translate(${position('copy','x')/2}px,${position('copy','y')/2}px)`,display:'grid',gap:8,pointerEvents:'none'}}>{parts.map(([part])=><div data-text-part={part} key={part} style={{width:'fit-content',maxWidth:'100%',cursor:'move',pointerEvents:'auto',transform:`translate(${position(part,'x')/2}px,${position(part,'y')/2}px)`,fontSize:part==='title'?Math.max(20,Math.min(46,(sizes.hero_title_size||55)*.65)):Math.max(11,(sizes[`hero_${part}_size`]||18)*.8),fontWeight:part==='title'?700:part==='eyebrow'?800:400,lineHeight:1.05,textShadow:'0 2px 12px #24150c'}}>{sample?.[part]||({eyebrow:'Sua frase de abertura',title:'Título do seu projeto',subtitle:'Sua apresentação aparece aqui.',phone:'Telefone: (00) 0000-0000'}[part])}</div>)}</div></div></div>
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
