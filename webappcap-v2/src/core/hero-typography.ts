import type {CSSProperties} from 'react';

export const heroTypographyKeys=['hero_copy_x','hero_copy_y','hero_eyebrow_size','hero_title_size','hero_subtitle_size','hero_eyebrow_bold','hero_eyebrow_italic','hero_title_bold','hero_title_italic','hero_subtitle_bold','hero_subtitle_italic'] as const;
const numeric:Record<string,[number,number]>={hero_copy_x:[-240,240],hero_copy_y:[-240,240],hero_eyebrow_size:[0,40],hero_title_size:[0,140],hero_subtitle_size:[0,40]};
export function heroTypographyPatch(form:FormData){
 return Object.fromEntries(heroTypographyKeys.map(key=>{
  if(key in numeric){const [min,max]=numeric[key],raw=Number(form.get(key));return [key,String(Math.max(min,Math.min(max,Number.isFinite(raw)?raw:0)))];}
  const choice=String(form.get(key)??'default');
  return [key,['true','false'].includes(choice)?choice:'default'];
 }));
}
const value=(appearance:Record<string,unknown>,key:string)=>String(appearance[key]??'');
export function heroCopyStyle(appearance:Record<string,unknown>):CSSProperties{
 const x=Number(value(appearance,'hero_copy_x'))||0,y=Number(value(appearance,'hero_copy_y'))||0;
 return x||y?{translate:`${Math.max(-240,Math.min(240,x))}px ${Math.max(-240,Math.min(240,y))}px`}:{};
}
export function heroTextStyle(appearance:Record<string,unknown>,part:'eyebrow'|'title'|'subtitle'):CSSProperties{
 const size=Number(value(appearance,`hero_${part}_size`))||0;
 return {
  ...(size?{fontSize:`${Math.max(10,Math.min(part==='title'?140:40,size))}px`}:{}),
  ...(['true','false'].includes(value(appearance,`hero_${part}_bold`))?{fontWeight:value(appearance,`hero_${part}_bold`)==='true'?800:400}:{}),
  ...(['true','false'].includes(value(appearance,`hero_${part}_italic`))?{fontStyle:value(appearance,`hero_${part}_italic`)==='true'?'italic':'normal'}:{})
 };
}
