import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import styles from '../dashboard.module.css';

type EventRow={event_type:string;event_label:string|null;path:string|null;referrer_host:string|null;session_id:string|null;occurred_at:string};
type LeadRow={id:number;status:string;source:string|null;created_at:string};
const dateParts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'});
const dayLabel=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'short',day:'2-digit',month:'short'});
const dayKey=(value:Date|string)=>{const parts=dateParts.formatToParts(new Date(value)),part=(type:string)=>parts.find(item=>item.type===type)?.value||'';return `${part('year')}-${part('month')}-${part('day')}`};
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
 const events=(eventResult.error?[]:eventResult.data||[]) as EventRow[],leads=(leadResult.data||[]) as LeadRow[],views=events.filter(row=>row.event_type==='page_view'),clicks=events.filter(row=>row.event_type!=='page_view');
 const unique=new Set(views.map(row=>row.session_id).filter(Boolean)).size,conversion=unique?Math.round(leads.length/unique*1000)/10:0;
 const now=new Date(),days=Array.from({length:7},(_,index)=>{const date=new Date(now);date.setDate(date.getDate()-(6-index));return{label:new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'short'}).format(date).replace('.',''),count:views.filter(row=>dayKey(row.occurred_at)===dayKey(date)).length}}),max=Math.max(1,...days.map(day=>day.count));
 const referrers=ranking(views,row=>label(row.referrer_host,'Direto'));
 const pages=ranking(views,row=>label(row.path,'/'));
 const actions=ranking(clicks,row=>eventNames[row.event_type]||row.event_type);
 const daily=Array.from({length:30},(_,index)=>{const date=new Date(now);date.setDate(date.getDate()-index);const key=dayKey(date),dayViews=views.filter(row=>dayKey(row.occurred_at)===key),dayClicks=clicks.filter(row=>dayKey(row.occurred_at)===key),dayLeads=leads.filter(row=>dayKey(row.created_at)===key);return{key,date,views:dayViews.length,visitors:new Set(dayViews.map(row=>row.session_id).filter(Boolean)).size,clicks:dayClicks.length,leads:dayLeads.length,sources:ranking(dayClicks,row=>label(row.referrer_host,'Direto'),20),actions:ranking(dayClicks,row=>eventNames[row.event_type]||row.event_type,20)}}).filter(day=>day.views||day.clicks||day.leads);
 return <div className={styles.analyticsPage}>
  <header className={styles.editorHeader}><span className={styles.eyebrowDark}>ANALYTICS</span><h1>Visitas e resultados</h1><p>Últimos 30 dias · dados anônimos por sessão</p></header>
  {eventResult.error?<div className={styles.notice}>O rastreamento de visitas será ativado depois da migration 015. Os leads continuam disponíveis.</div>:null}
  <section className={styles.analyticsStats}><article><span>Visualizações</span><strong>{views.length}</strong></article><article><span>Visitantes</span><strong>{unique}</strong></article><article><span>Leads</span><strong>{leads.length}</strong></article><article><span>Conversão em lead</span><strong>{conversion}%</strong></article></section>
  <div className={styles.analyticsGrid}><section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>ÚLTIMOS 7 DIAS</span><strong>Visitas ao site</strong></div><div className={styles.barChart}>{days.map(day=><div className={styles.barItem} key={day.label}><span>{day.count}</span><i style={{height:`${Math.max(6,day.count/max*100)}%`}}/><small>{day.label}</small></div>)}</div></section>
  <section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>AQUISIÇÃO</span><strong>De onde vieram</strong></div><div className={styles.sourceList}>{referrers.length?referrers.map(([source,count])=><div key={source}><span>{source}</span><strong>{count}</strong></div>):<p>As primeiras origens aparecerão aqui.</p>}</div></section></div>
  <div className={styles.analyticsGrid} style={{marginTop:12}}><section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>CONTEÚDO</span><strong>Páginas acessadas</strong></div><div className={styles.sourceList}>{pages.length?pages.map(([page,count])=><div key={page}><span>{page}</span><strong>{count}</strong></div>):<p>Nenhuma visita registrada.</p>}</div></section>
  <section className={styles.analyticsPanel}><div className={styles.panelTitle}><span>INTERAÇÕES</span><strong>O que os visitantes fizeram</strong></div><div className={styles.sourceList}>{actions.length?actions.map(([action,count])=><div key={action}><span>{action}</span><strong>{count}</strong></div>):<p>Nenhum clique registrado.</p>}</div></section></div>
  <section className={`${styles.analyticsPanel} ${styles.dailyPanel}`}><div className={styles.panelTitle}><span>HISTÓRICO DIÁRIO</span><strong>Visitas, cliques e origens por dia</strong></div><div className={styles.dailyList}>{daily.length?daily.map(day=><details key={day.key}><summary><time dateTime={day.key}>{dayLabel.format(day.date).replaceAll('.','')}</time><span><b>{day.visitors}</b> visitantes</span><span><b>{day.views}</b> visualizações</span><span><b>{day.clicks}</b> cliques</span><span><b>{day.leads}</b> leads</span><i aria-hidden="true">+</i></summary><div className={styles.dailyDetail}><div><small>ORIGEM DOS CLIQUES</small>{day.sources.length?day.sources.map(([source,count])=><p key={source}><span>{source}</span><strong>{count}</strong></p>):<p><span>Nenhum clique neste dia</span><strong>0</strong></p>}</div><div><small>AÇÕES REALIZADAS</small>{day.actions.length?day.actions.map(([action,count])=><p key={action}><span>{action}</span><strong>{count}</strong></p>):<p><span>Nenhuma interação</span><strong>0</strong></p>}</div></div></details>):<p className={styles.dailyEmpty}>Os detalhes aparecerão assim que o site receber visitas.</p>}</div></section>
  <p className={styles.analyticsFootnote}>Visitantes são estimados por uma identificação temporária da sessão. Nenhum dado pessoal é usado para essa contagem.</p>
 </div>;
}
