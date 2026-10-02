export type StoredMediaFile={path:string;createdAt?:string|null;updatedAt?:string|null;size?:number};
const bucket='webappcap-v2-sites';
export function collectMediaReferences(value:unknown,projectId:string,storageOrigin:string):Set<string>{
 const references=new Set<string>(),seen=new WeakSet<object>();
 const safe=(path:string)=>path.startsWith(`${projectId}/`)&&!path.split('/').some(part=>!part||part==='.'||part==='..');
 const visit=(item:unknown)=>{
  if(typeof item==='string'){
   if(safe(item)){references.add(item);return}
   try{
    const url=new URL(item,storageOrigin);
    if(url.origin!==new URL(storageOrigin).origin)return;
    const match=url.pathname.match(new RegExp(`/storage/v1/(?:object|render/image)/(?:public|sign)/${bucket}/(.+)$`));
    if(match){const path=decodeURIComponent(match[1]);if(safe(path))references.add(path)}
   }catch{/* Invalid URLs cannot become references. */}
   if(/^[\[{]/.test(item))try{visit(JSON.parse(item))}catch{/* Regular text. */}
  }else if(item&&typeof item==='object'&&!seen.has(item)){
   seen.add(item);for(const child of Object.values(item))visit(child);
  }
 };
 visit(value);return references;
}
export function unreferencedMediaCandidates(files:StoredMediaFile[],references:Set<string>,now:number,minAgeMs=7*86_400_000){
 return files.filter(file=>{
  if(references.has(file.path))return false;
  const timestamps=[file.createdAt,file.updatedAt].filter(Boolean).map(value=>Date.parse(value!));
  if(!timestamps.length||timestamps.some(value=>!Number.isFinite(value)))return false;
  return Math.max(...timestamps)<=now-minAgeMs;
 });
}
