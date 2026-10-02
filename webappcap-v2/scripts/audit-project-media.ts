import {createClient} from '@supabase/supabase-js';
import {collectMediaReferences,unreferencedMediaCandidates,type StoredMediaFile} from '../src/core/media-audit.ts';

const args=process.argv.slice(2),value=(flag:string)=>args[args.indexOf(flag)+1];
const projectId=args.includes('--project')?value('--project'):'';
const days=args.includes('--min-age-days')?Number(value('--min-age-days')):7;
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)||!Number.isFinite(days)||days<7)throw new Error('Use --project UUID [--min-age-days 7]. Este comando apenas audita; não remove arquivos.');
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente local.');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}),storage=sb.storage.from('webappcap-v2-sites');
async function snapshotPages(table:'project_v2_content'|'project_v2_public_content'){
 const pages:unknown[]=[];
 for(let offset=0;;offset+=100){
  const result=await sb.from(table).select('identity,content,media,appearance,contact').order('project_id').range(offset,offset+99);
  if(result.error)throw new Error('Não foi possível conferir todas as referências. Auditoria interrompida.');
  pages.push(result.data);if(result.data.length<100)return pages;
 }
}
async function snapshots(){
 // An image can also be referenced by another project's catalog or the root CMS.
 const [draft,publicContent,root]=await Promise.all([
  snapshotPages('project_v2_content'),snapshotPages('project_v2_public_content'),
  sb.from('platform_root_content').select('draft,published')
 ]);
 if(root.error)throw new Error('Não foi possível conferir as referências da raiz. Auditoria interrompida.');
 return [draft,publicContent,root.data];
}
async function list(prefix:string):Promise<StoredMediaFile[]>{
 const files:StoredMediaFile[]=[];
 for(let offset=0;;offset+=100){
  const result=await storage.list(prefix,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
  if(result.error)throw new Error('Não foi possível listar o Storage. Auditoria interrompida.');
  for(const row of result.data){
   if(!row.name||row.name==='.'||row.name==='..'||row.name.includes('/'))throw new Error('Caminho inesperado no Storage.');
   const path=`${prefix}/${row.name}`;
   if(!row.id)files.push(...await list(path));
   else files.push({path,createdAt:row.created_at,updatedAt:row.updated_at,size:Number(row.metadata?.size)||0});
  }
  if(result.data.length<100)return files;
 }
}
const before=await snapshots(),files=await list(projectId),after=await snapshots();
const references=collectMediaReferences([before,after],projectId,url);
console.log(JSON.stringify({projectId,mode:'audit-only',minAgeDays:days,totalFiles:files.length,referencedFiles:references.size,candidates:unreferencedMediaCandidates(files,references,Date.now(),days*86_400_000)},null,2));
