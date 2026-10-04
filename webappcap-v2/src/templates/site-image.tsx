import {getImageProps} from 'next/image';
import type {ImgHTMLAttributes} from 'react';
import {optimizableProjectImage} from '@/core/image-delivery';

type Props=ImgHTMLAttributes<HTMLImageElement>&{src?:string;imageWidth?:number};
// Keep the source template's native img geometry, CSS, events and crop controls.
export function SiteImage({src,imageWidth=640,sizes='(max-width: 700px) 100vw, 640px',loading='lazy',...props}:Props){
 const optimized=src&&optimizableProjectImage(src,process.env.NEXT_PUBLIC_SUPABASE_URL)
  ?getImageProps({src,alt:props.alt||'',width:imageWidth,height:imageWidth,sizes,quality:85}).props
  :undefined;
 // eslint-disable-next-line @next/next/no-img-element -- Preserve native template geometry.
 return <img {...props} alt={props.alt||''} src={optimized?.src||src} srcSet={props.srcSet||optimized?.srcSet} sizes={optimized?sizes:undefined} loading={loading} decoding={props.decoding||'async'}/>;
}
