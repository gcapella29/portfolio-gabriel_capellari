'use client';

import {useRef} from 'react';
import styles from './draggable-image-preview.module.css';

const namedPositions:Record<string,[number,number]>={top:[50,0],center:[50,50],bottom:[50,100],left:[0,50],right:[100,50]};

export function parseImagePosition(value:string):[number,number]{
 if(namedPositions[value])return namedPositions[value];
 const match=value.match(/^\s*(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/);
 return match?[Math.min(100,Number(match[1])),Math.min(100,Number(match[2]))]:[50,50];
}

export default function DraggableImagePreview({src,alt,position,fit='cover',zoom=100,onPositionChange,onZoomChange}:{src:string;alt:string;position:string;fit?:string;zoom?:number;onPositionChange:(position:string)=>void;onZoomChange?:(zoom:number)=>void}){
 const frame=useRef<HTMLDivElement>(null),dragging=useRef(false),[x,y]=parseImagePosition(position);
 const update=(clientX:number,clientY:number)=>{const rect=frame.current?.getBoundingClientRect();if(!rect)return;const nextX=Math.max(0,Math.min(100,(clientX-rect.left)/rect.width*100)),nextY=Math.max(0,Math.min(100,(clientY-rect.top)/rect.height*100));onPositionChange(`${nextX.toFixed(1)}% ${nextY.toFixed(1)}%`)};
 return <div ref={frame} className={styles.frame} role="slider" tabIndex={0} aria-label={`Posição da imagem: ${alt}`} aria-valuetext={`${Math.round(x)}% horizontal, ${Math.round(y)}% vertical`} onPointerDown={event=>{dragging.current=true;event.currentTarget.setPointerCapture(event.pointerId);update(event.clientX,event.clientY)}} onPointerMove={event=>{if(dragging.current)update(event.clientX,event.clientY)}} onPointerUp={event=>{dragging.current=false;event.currentTarget.releasePointerCapture(event.pointerId)}} onPointerCancel={()=>{dragging.current=false}} onKeyDown={event=>{const step=event.shiftKey?10:2;let nextX=x,nextY=y;if(event.key==='ArrowLeft')nextX-=step;else if(event.key==='ArrowRight')nextX+=step;else if(event.key==='ArrowUp')nextY-=step;else if(event.key==='ArrowDown')nextY+=step;else return;event.preventDefault();onPositionChange(`${Math.max(0,Math.min(100,nextX)).toFixed(1)}% ${Math.max(0,Math.min(100,nextY)).toFixed(1)}%`)}}>
  <img src={src} alt={alt} draggable={false} style={{objectPosition:`${x}% ${y}%`,objectFit:fit as React.CSSProperties['objectFit'],transform:`scale(${Math.max(50,Math.min(200,zoom))/100})`}}/>
  <span className={styles.focus} style={{left:`${x}%`,top:`${y}%`}} aria-hidden="true"/>
  <small>Arraste a imagem para ajustar o enquadramento</small>
  {onZoomChange?<div className={styles.zoomControls} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}><button type="button" onClick={()=>onZoomChange(Math.max(50,zoom-5))} aria-label="Diminuir zoom">−</button><label>Zoom <input type="range" min="50" max="200" step="5" value={zoom} onChange={event=>onZoomChange(Number(event.target.value))}/><b>{zoom}%</b></label><button type="button" onClick={()=>onZoomChange(Math.min(200,zoom+5))} aria-label="Aumentar zoom">+</button></div>:null}
 </div>;
}
