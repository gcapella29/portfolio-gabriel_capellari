import {preload} from 'react-dom';
const body='/fonts/e4af272ccee01ff0-s.p.woff2';
const headings={editorial:'/fonts/6e8c7cb283336a9d-s.p.woff2',commerce:'/fonts/982ceffe7b733b3b-s.p.woff2'};
export function preloadSiteFonts(kind:keyof typeof headings){
 for(const href of [body,headings[kind]])preload(href,{as:'font',type:'font/woff2',crossOrigin:'anonymous'});
}
