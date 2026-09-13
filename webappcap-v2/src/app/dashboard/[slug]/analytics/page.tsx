import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import styles from '../dashboard.module.css';

type EventRow={event_type:string;event_label:string|null;path:string|null;referrer_host:string|null;session_id:string|null;occurred_at:string};
const dayKey=(date:Date)=>date.toISOString().slice(0,10);
const label=(value:string|null,fallback:string)=>value?.trim()||fallback;
const eventNames:Record<string,string>={contact_click:'Contato',whatsapp_click:'WhatsApp',instagram_click:'Instagram',linkedin_click:'LinkedIn',email_click:'E-mail',cv_click:'Download do CV',external_click:'Link externo'};
const ranking=(rows:EventRow[],pick:(row:EventRow)=>string,limit=6)=>[...rows.reduce((map,row)=>{const key=pick(row);map.set(key,(map.get(key)||0)+1);return map},new Map<string,number>())].sort((a,b)=>b[1]-a[1]).slice(0,limit);

export default async function AnalyticsPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,access=await resolveProjectAccess(slug);
 if(!can(access.role,'viewLeads'))redirect(`/dashboard/${encodeURIComponent(access.project.slug)}`);
 const sb=await createSupabaseServerClient(),since=new Date();since.setDate(since.getDate()-29);since.setHours(0,0,0,0);
 const [eventResult,leadResult]=await Promise.all([
  sb.from('site_analytics_events').select('event_type,event_label,path,referrer_host,session_id,occurred_at').eq('project_id',access.project.id).gte('occurred_at',since.toISOString()).order('occurred_at',{ascending:true}).limit(5000),
  sb.from('site_leads').select('id,status,source,created_at').eq('project_id',access.project.id).gte('created_at',since.toISOString()).limit(1000),
 ]);
 if(leadResult.error)throw leadResult.error;
 const events=(eventResult.error?[]:eventResult.data||[]) as EventRow[],leads=leadResult.data||[],views=events.filter(row=>row.event_type==='page_view'),clicks=events.filter(row=>row.event_type!=='page_view');
 const unique=new Set(views.map(row=>row.session_id).filter(Boolean)).size,conversion=unique?Math.round(leads.length/unique*1000)/10:0;
 const now=new Date(),days=Array.from({length:7},(_,index)=>{const date=new Date(now);date.setHours(0,0,0,0);date.setDate(date.getDate()-(6-index));return{label:new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(date).replace('.',''),count:views.filter(row=>dayKey(new Date(row.occurred_at))===dayKey(date)).length}}),max=Math.max(1,...days.map(day=>day.count));
 const referrers=ranking(views,row=>label(row.referrer_host,'Direto'));
 const pages=ranking(views,row=>label(row.path,'/'));
 const actions=ranking(clicks,row=>eventNames[row.event_type]||row.event_type);
 return <div className={styles.analyticsPage}>
  <header className={styles.editorHeader}><span className={styles.eyebrowDark}>ANALYTICS</span><h1>Visitas e resultados</h1><p>Últimos 30 dias · dados anônimos por sessão</p></header>
  {eventResult.error?<div className={styles.notice}>O rastreamento de visitas será ativado depois da migration 015. Os leads continuam disponíveis.</div>:null}
  <section className={styles.analyticsStats}><article><span>Visualizações</span><strong>{views.length}</strong></article><article><span>Visitantes</span><strong>{unique}</strong></article><article><span>Leads</span><strong>{leads.length}</strong></article><article><span>Conversão em lead</span><strong>{conversion}%</strong></article></section>
  <div className={styles.analyticsGrid}><section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>ÚLTIMOS 7 DIAS</span><strong>Visitas ao site</strong></div><div className={styles.barChart}>{days.map(day=><div className={styles.barItem} key={day.label}><span>{day.count}</span><i style={{height:`${Math.max(6,day.count/max*100)}%`}}/><small>{day.label}</small></div>)}</div></section>
  <section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>AQUISIÇÃO</span><strong>De onde vieram</strong></div><div className={styles.sourceList}>{referrers.length?referrers.map(([source,count])=><div key={source}><span>{source}</span><strong>{count}</strong></div>):<p>As primeiras origens aparecerão aqui.</p>}</div></section></div>
  <div className={styles.analyticsGrid} style={{marginTop:12}}><section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>CONTEÚDO</span><strong>Páginas acessadas</strong></div><div className={styles.sourceList}>{pages.length?pages.map(([page,count])=><div key={page}><span>{page}</span><strong>{count}</strong></div>):<p>Nenhuma visita registrada.</p>}</div></section>
  <section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>INTERAÇÕES</span><strong>O que os visitantes fizeram</strong></div><div className={styles.sourceList}>{actions.length?actions.map(([action,count])=><div key={action}><span>{action}</span><strong>{count}</strong></div>):<p>Nenhum clique registrado.</p>}</div></section></div>
  <p className={styles.analyticsFootnote}>Visitantes são estimados por uma identificação temporária da sessão. Nenhum dado pessoal é usado para essa contagem.</p>
 </div>;
}
