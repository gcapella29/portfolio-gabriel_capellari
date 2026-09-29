import type {CSSProperties} from 'react';

const parts=['eyebrow','title','subtitle'] as const;
export const heroTypographyKeys=['hero_copy_x','hero_copy_y',...parts.flatMap(part=>[`hero_${part}_size`,`hero_${part}_x`,`hero_${part}_y`,`hero_${part}_bold`,`hero_${part}_italic`,`hero_${part}_color`,`hero_${part}_font`,`hero_${part}_motion`])] as const;
const numeric:Record<string,[number,number]>={hero_copy_x:[-240,240],hero_copy_y:[-240,240],...Object.fromEntries(parts.flatMap(part=>[[`hero_${part}_size`,[0,part==='title'?140:40]],[`hero_${part}_x`,[-240,240]],[`hero_${part}_y`,[-240,240]]]))};
export function heroTypographyPatch(form:FormData){
 return Object.fromEntries(heroTypographyKeys.map(key=>{
  if(key in numeric){const [min,max]=numeric[key],raw=Number(form.get(key));return [key,String(Math.max(min,Math.min(max,Number.isFinite(raw)?raw:0)))];}
  const choice=String(form.get(key)??'default');
  if(key.endsWith('_color'))return[key,/^#[\da-f]{6}$/i.test(choice)?choice:'default'];
  if(key.endsWith('_font'))return[key,['serif','sans','display','default'].includes(choice)?choice:'default'];
  if(key.endsWith('_motion'))return[key,['rise','slide-left','slide-right','soft-zoom','none','default'].includes(choice)?choice:'default'];
  return [key,['true','false'].includes(choice)?choice:'default'];
 }));
}
const value=(appearance:Record<string,unknown>,key:string)=>String(appearance[key]??'');
export function heroTextMotion(appearance:Record<string,unknown>,part:'eyebrow'|'title'|'subtitle'){
 const motion=value(appearance,`hero_${part}_motion`);
 return ['rise','slide-left','slide-right','soft-zoom','none'].includes(motion)?motion:undefined;
}
export function heroCopyStyle(appearance:Record<string,unknown>):CSSProperties{
 const x=Number(value(appearance,'hero_copy_x'))||0,y=Number(value(appearance,'hero_copy_y'))||0;
 return x||y?{translate:`${Math.max(-240,Math.min(240,x))}px ${Math.max(-240,Math.min(240,y))}px`}:{};
}
export function heroTextStyle(appearance:Record<string,unknown>,part:'eyebrow'|'title'|'subtitle'):CSSProperties{
 const size=Number(value(appearance,`hero_${part}_size`))||0;
 const x=Number(value(appearance,`hero_${part}_x`))||0,y=Number(value(appearance,`hero_${part}_y`))||0;
 const color=value(appearance,`hero_${part}_color`),font=value(appearance,`hero_${part}_font`);
 const fonts:Record<string,string>={serif:'Georgia, Times New Roman, serif',sans:'Arial, Helvetica, sans-serif',display:'Fraunces, Georgia, serif'};
 return {
  ...(size?{fontSize:`${Math.max(10,Math.min(part==='title'?140:40,size))}px`}:{}),
  ...(x||y?{translate:`${Math.max(-240,Math.min(240,x))}px ${Math.max(-240,Math.min(240,y))}px`}:{}),
  ...(/^#[\da-f]{6}$/i.test(color)?{color}:{}),
  ...(fonts[font]?{fontFamily:fonts[font]}:{}),
  ...(['true','false'].includes(value(appearance,`hero_${part}_bold`))?{fontWeight:value(appearance,`hero_${part}_bold`)==='true'?800:400}:{}),
  ...(['true','false'].includes(value(appearance,`hero_${part}_italic`))?{fontStyle:value(appearance,`hero_${part}_italic`)==='true'?'italic':'normal'}:{})
 };
}
