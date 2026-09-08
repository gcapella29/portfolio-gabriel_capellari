import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { templatesForSegment } from '@/core/segments';
import type { SegmentKey } from '@/core/domain';
import { renderTemplate } from '@/templates/registry';

const segments:SegmentKey[]=['portfolio','personal-trainer','food-business','school'];
export default async function TemplateLabPage({params,searchParams}:{params:Promise<{segment:string;slug:string}>;searchParams:Promise<{template?:string}>}){
 const {segment,slug}=await params,{template}=await searchParams;
 if(!segments.includes(segment as SegmentKey))notFound();
 const {project}=await resolveProjectAccess(slug);if(project.segment!==segment)notFound();
 const data=await readV2Content(project.id);const templates=templatesForSegment(project.segment).filter(t=>t.status==='ready');
 const selected=templates.find(t=>t.key===template)??templates.find(t=>t.key===project.templateKey)??templates[0];if(!selected)notFound();
 return <div style={{minHeight:'100vh',background:'#111'}}>
  <div style={{position:'sticky',top:0,zIndex:1000,display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'rgba(12,12,12,.96)',color:'#fff',fontFamily:'Arial,sans-serif',overflowX:'auto',borderBottom:'1px solid #333'}}>
   <strong style={{marginRight:8,whiteSpace:'nowrap'}}>Template Lab</strong>
   {templates.map(item=><Link key={item.key} href={`/template-lab/${segment}/${slug}?template=${encodeURIComponent(item.key)}`} style={{whiteSpace:'nowrap',padding:'8px 11px',borderRadius:999,background:item.key===selected.key?'#fff':'#262626',color:item.key===selected.key?'#111':'#ddd',textDecoration:'none',fontSize:12,fontWeight:700}}>{item.name}</Link>)}
   <span style={{flex:1}}/><Link href={`/dashboard/${slug}/appearance`} style={{whiteSpace:'nowrap',color:'#fff',fontSize:12}}>← Aparência</Link>
  </div>
  {renderTemplate({project:{id:project.id,slug:project.slug,name:project.name,segment:project.segment,templateKey:selected.key},data,preview:true})}
 </div>;
}
