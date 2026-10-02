import type {CSSProperties} from 'react';

const names:Record<string,[number,number]>={top:[50,0],center:[50,50],bottom:[50,100],left:[0,50],right:[100,50]};
const legacy=/^(?:100|\d{1,2})(?:\.\d+)?%\s+(?:100|\d{1,2})(?:\.\d+)?%$/;
const pan=/^pan\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)\|(.+)$/;
export function imagePlacement(value:unknown){
 const raw=String(value||'center'),match=raw.match(pan);
 const base=match?match[3]:raw;
 const validPercent=legacy.test(base)&&base.split(/\s+/).every(part=>Number(part.slice(0,-1))<=100);
 const position=Object.hasOwn(names,base)||validPercent?base:'center';
 const x=match?Math.max(-100,Math.min(100,Number(match[1]))):0;
 const y=match?Math.max(-100,Math.min(100,Number(match[2]))):0;
 return {position,x,y};
}
export function normalizeImagePosition(value:unknown){
 const {position,x,y}=imagePlacement(value);
 return x||y?`pan(${x},${y})|${position}`:position;
}
export function movedImagePosition(base:unknown,x:number,y:number){
 return normalizeImagePosition(`pan(${Math.max(-100,Math.min(100,x)).toFixed(2)},${Math.max(-100,Math.min(100,y)).toFixed(2)})|${imagePlacement(base).position}`);
}
/** Translate is independent of scale, so dragging behaves identically at every zoom. */
export function imagePositionStyle(position:unknown):CSSProperties{
 const p=imagePlacement(position);
 return {objectPosition:p.position,translate:`${p.x}% ${p.y}%`};
}
export function imageMediaStyle(value:unknown,prefix=''):CSSProperties{
 const row=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const fit=String(row[`${prefix}fit`]||'cover');
 return {...imagePositionStyle(row[`${prefix}position`]),objectFit:(['cover','contain','fill'].includes(fit)?fit:'cover') as CSSProperties['objectFit'],transform:`scale(${Math.max(50,Math.min(200,Number(row[`${prefix}zoom`])||100))/100})`};
}
