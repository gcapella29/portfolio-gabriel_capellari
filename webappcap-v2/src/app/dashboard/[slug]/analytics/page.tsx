import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import styles from '../dashboard.module.css';

const dayKey=(date:Date)=>date.toISOString().slice(0,10);
const sourceLabel=(value:string|null)=>value?.trim()||'Site';

export default async function AnalyticsPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,access=await resolveProjectAccess(slug);
 if(!can(access.role,'viewLeads'))redirect(`/dashboard/${encodeURIComponent(access.project.slug)}`);
 const sb=await createSupabaseServerClient(),since=new Date();since.setDate(since.getDate()-89);
 const result=await sb.from('site_leads').select('id,status,source,created_at').eq('project_id',access.project.id).gte('created_at',since.toISOString()).order('created_at',{ascending:true}).limit(1000);
 if(result.error)throw result.error;
 const rows=result.data||[],now=new Date(),monthStart=new Date(now);monthStart.setDate(now.getDate()-29);
 const month=rows.filter(row=>new Date(row.created_at)>=monthStart),won=month.filter(row=>row.status==='won').length,newCount=month.filter(row=>row.status==='new').length,conversion=month.length?Math.round(won/month.length*100):0;
 const days=Array.from({length:7},(_,index)=>{const date=new Date(now);date.setHours(0,0,0,0);date.setDate(date.getDate()-(6-index));const count=rows.filter(row=>dayKey(new Date(row.created_at))===dayKey(date)).length;return{label:new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(date).replace('.',''),count}});
 const max=Math.max(1,...days.map(day=>day.count)),sources=[...month.reduce((map,row)=>map.set(sourceLabel(row.source),(map.get(sourceLabel(row.source))||0)+1),new Map<string,number>())].sort((a,b)=>b[1]-a[1]).slice(0,5);
 return <div className={styles.analyticsPage}>
  <header className={styles.editorHeader}><span className={styles.eyebrowDark}>ANALYTICS</span><h1>Desempenho</h1><p>Últimos 30 dias</p></header>
  <section className={styles.analyticsStats}><article><span>Leads</span><strong>{month.length}</strong></article><article><span>Novos</span><strong>{newCount}</strong></article><article><span>Convertidos</span><strong>{won}</strong></article><article><span>Conversão</span><strong>{conversion}%</strong></article></section>
  <div className={styles.analyticsGrid}><section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>ÚLTIMOS 7 DIAS</span><strong>Novos contatos</strong></div><div className={styles.barChart}>{days.map(day=><div className={styles.barItem} key={day.label}><span>{day.count}</span><i style={{height:`${Math.max(6,day.count/max*100)}%`}}/><small>{day.label}</small></div>)}</div></section>
  <section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>ORIGEM</span><strong>Leads por canal</strong></div><div className={styles.sourceList}>{sources.length?sources.map(([source,count])=><div key={source}><span>{source}</span><strong>{count}</strong></div>):<p>Nenhum lead no período.</p>}</div></section></div>
  <p className={styles.analyticsFootnote}>As métricas representam contatos registrados pelo site.</p>
 </div>;
}
