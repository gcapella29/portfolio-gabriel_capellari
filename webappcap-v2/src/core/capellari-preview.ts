import type {V2Content} from './onboarding-data';

export const CLASSIC_PORTFOLIO='portfolio-legacy-1';
export const MULTIDISCIPLINARY_PORTFOLIO='portfolio-multidisciplinary-1';

export function useDefaultCapellariCases(content:Record<string,unknown>){
  return content.portfolio_concept_cases_configured!==true &&
    (!Array.isArray(content.portfolio_concept_cases)||content.portfolio_concept_cases.length===0);
}

export function capellariPreviewLayout(project:{id:string;slug:string},data:V2Content,layout?:string){
  if(project.id!=='PRJ-0002'||project.slug!=='capellari')return null;
  const selected=String(data.appearance.preview_template_key||'');
  if(![CLASSIC_PORTFOLIO,'portfolio-native-1',MULTIDISCIPLINARY_PORTFOLIO].includes(selected))return null;
  const templateKey=layout==='classic'?CLASSIC_PORTFOLIO:layout==='multidisciplinary'?MULTIDISCIPLINARY_PORTFOLIO:selected;
  // A preview override never mutates the Owner draft or its published snapshot.
  return {templateKey,data:{...data,appearance:{...data.appearance,preview_template_key:templateKey}}};
}

export function capellariMedia(data:V2Content){
  const overrides=data.media.portfolio_concept;
  return {...data.media,...(overrides&&typeof overrides==='object'&&!Array.isArray(overrides)?overrides:{})} as Record<string,unknown>;
}

export function portfolioUrl(value:unknown){
  if(typeof value!=='string')return '';
  const url=value.trim();
  if(/^\/(?!\/)/.test(url)||/^#[\w-]+$/.test(url))return url;
  try{const parsed=new URL(url);return ['https:','http:'].includes(parsed.protocol)?url:''}catch{return ''}
}
