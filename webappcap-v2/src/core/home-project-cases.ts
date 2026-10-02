export type HomeProjectCase={name:string;url:string;category:string;description:string;facts:{label:string;text:string}[];tags:string[];image?:string;slug?:string};
export function safeProjectUrl(value:unknown){
  try{const raw=String(value||'').trim();if(/[\\\s]/.test(raw))return '';const url=new URL(raw);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:'';}catch{return '';}
}
export function parseHomeProjectCases(raw:string):HomeProjectCase[]{
  return raw.split(/\r?\n/).map(line=>{
    const [name='',link='',category='',description='',factsRaw='',tagsRaw='']=line.split('|').map(part=>part.trim());
    const facts=factsRaw.split(';').map(item=>{const [label,...rest]=item.split(':');return{label:label.trim(),text:rest.join(':').trim()}}).filter(item=>item.label&&item.text).slice(0,3);
    return {name,url:safeProjectUrl(link),category,description,facts,tags:tagsRaw.split(';').map(tag=>tag.trim()).filter(Boolean).slice(0,4)};
  }).filter(project=>project.name&&project.url);
}
export function mergeHomeProjectCases(manual:HomeProjectCase[],published:HomeProjectCase[]){
  const result=[...manual];
  for(const project of published){
    const index=result.findIndex(item=>item.url.replace(/\/$/,'')===project.url.replace(/\/$/,'')||item.name.trim().toLocaleLowerCase('pt-BR')===project.name.trim().toLocaleLowerCase('pt-BR'));
    if(index<0)result.push(project);else result[index]={...project,...result[index],image:project.image,slug:project.slug};
  }
  return result;
}
