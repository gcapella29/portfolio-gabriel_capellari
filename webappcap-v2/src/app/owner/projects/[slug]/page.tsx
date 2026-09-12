import Link from 'next/link';
import {redirect} from 'next/navigation';
import {onboardingPath} from '@/core/onboarding';
import {segments} from '@/core/segments';
import {resolveProjectAccess} from '@/core/session';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import DeleteProjectDialog from '../delete-project-dialog';
import styles from '../../owner.module.css';

export default async function OwnerProjectPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{project,role}=await resolveProjectAccess(slug);if(role!=='owner')redirect('/unauthorized');
 const sb=await createSupabaseServerClient();
 const [stateResult,leadsResult,newLeadsResult]=await Promise.all([sb.from('project_v2_state').select('native_subdomain,custom_domain,domain_status,updated_at').eq('project_id',project.id).maybeSingle(),sb.from('site_leads').select('id',{count:'exact',head:true}).eq('project_id',project.id),sb.from('site_leads').select('id',{count:'exact',head:true}).eq('project_id',project.id).eq('status','new')]);
 if(stateResult.error)throw stateResult.error;if(leadsResult.error)throw leadsResult.error;if(newLeadsResult.error)throw newLeadsResult.error;
 const segment=segments[project.segment],state=stateResult.data,completed=project.onboardingStep==='completed';
 const host=state?.custom_domain&&state.domain_status==='active'?state.custom_domain:(state?.native_subdomain?`${state.native_subdomain}.webappcap.com.br`:`${project.slug}.webappcap.com.br`),publicUrl=`https://${host}`,dashboard=`/dashboard/${encodeURIComponent(project.slug)}`;
 const management=[{icon:'◫',title:'Conteúdo',meta:'Textos e informações',href:`${dashboard}/content`},{icon:'▧',title:'Fotos',meta:'Imagens e galeria',href:`${dashboard}/media`},{icon:'◐',title:'Aparência',meta:'Cores e composição',href:`${dashboard}/appearance`},{icon:'◎',title:'Leads',meta:`${newLeadsResult.count||0} novos · ${leadsResult.count||0} total`,href:`${dashboard}/leads`},{icon:'⌁',title:'Domínio',meta:state?.domain_status==='active'?'Conectado':'Configurar',href:`${dashboard}/settings`},{icon:'↑',title:'Publicação',meta:project.isPublished?'Site online':'Rascunho',href:dashboard}];
 return <main className={styles.page}><div className={styles.workspace}>
  <header className={styles.detailTopbar}><Link className={styles.back} href="/owner/projects">← Todos os projetos</Link><Link className={styles.buttonGhost} href="/entry">Área do cliente</Link></header>
  <section className={styles.detailHeader}><div className={styles.detailTitle}><span className={styles.eyebrow}>{segment.name}</span><h1>{project.name}</h1><div className={styles.detailDomain}><i className={project.isPublished?styles.dot:styles.dotDraft}/><span>{host}</span></div></div><div className={styles.detailActions}><Link className={styles.buttonGhost} href={`/preview/${encodeURIComponent(project.slug)}`}>Preview</Link>{project.isPublished?<a className={styles.button} href={publicUrl} target="_blank" rel="noopener noreferrer">Abrir site ↗</a>:null}</div></section>
  {!completed?<Link className={styles.setupBanner} href={onboardingPath(project.onboardingStep,project.slug)}><span><strong>Configuração incompleta</strong><small>Continuar onboarding</small></span><b>→</b></Link>:null}
  <div className={styles.detailGrid}><section className={styles.panel}><div className={styles.panelHead}><div><span className={styles.miniEyebrow}>GERENCIAMENTO</span><h2>Editar projeto</h2></div></div><div className={styles.managementGrid}>{management.map(item=><Link className={styles.manageCard} href={item.href} key={item.title}><span className={styles.manageIcon}>{item.icon}</span><span><strong>{item.title}</strong><small>{item.meta}</small></span><b>→</b></Link>)}</div></section>
  <aside className={styles.panel}><div className={styles.panelHead}><div><span className={styles.miniEyebrow}>PROJETO</span><h2>Detalhes</h2></div></div><div className={styles.infoList}><div className={styles.infoRow}><span>Status</span><strong>{project.isPublished?'Publicado':'Rascunho'}</strong></div><div className={styles.infoRow}><span>Template</span><strong>{project.templateKey||'Pendente'}</strong></div><div className={styles.infoRow}><span>Onboarding</span><strong>{completed?'Concluído':'Em curso'}</strong></div><div className={styles.infoRow}><span>Domínio</span><strong>{state?.domain_status==='active'?'Ativo':'Nativo'}</strong></div></div>{project.segment!=='portfolio'?<div className={styles.dangerPanel}><span>Zona de perigo</span><DeleteProjectDialog target={{slug:project.slug,name:project.name}}/></div>:null}</aside></div>
 </div></main>;
}
