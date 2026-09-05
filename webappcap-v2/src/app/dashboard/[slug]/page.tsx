import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { publicationStatus, readProjectState } from '@/core/publishing';
import { segments } from '@/core/segments';
import styles from './dashboard.module.css';

export default async function DashboardPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{published?:string}>}){
  const {slug}=await params;
  const {published}=await searchParams;
  const {project,role}=await resolveProjectAccess(slug);
  if(project.onboardingStep!=='completed'&&role!=='owner')redirect(`/setup/${encodeURIComponent(project.slug)}/${project.onboardingStep}`);
  const [state,pub]=await Promise.all([readProjectState(project.id),publicationStatus(project.id)]);
  const segment=segments[project.segment];
  const base=`/dashboard/${encodeURIComponent(project.slug)}`;
  const tools=[['Conteúdo','Atualize textos, informações e contatos.',`${base}/content`,'editContent'],['Fotos','Troque logo, hero e galeria.',`${base}/media`,'manageMedia'],['Aparência','Ajuste cor, tipografia, escala e espaçamento.',`${base}/appearance`,'editAppearance'],['Leads','Acompanhe interessados recebidos pelo site.',`${base}/leads`,'viewLeads'],['Configurações','Domínio e informações técnicas essenciais.',`${base}/settings`,'manageDomain']] as const;
  const pending=pub.hasPendingChanges;
  const live=project.isPublished&&!pending;
  const status=pending?'Alterações aguardando publicação':project.isPublished?'Site sincronizado':'Rascunho ainda não publicado';
  const statusLabel=pending?'Alterações pendentes':project.isPublished?'Publicado':'Rascunho';
  const dotClass=pending?styles.statusDotPending:live?styles.statusDotLive:styles.statusDotDraft;

  return <>
    <section className={styles.hero}>
      <div>
        <span className={styles.eyebrow}>{segment.name}</span>
        <h1>{project.name}</h1>
        <p>{status}. Salvar nunca altera o site público; o botão Publicar promove o rascunho atual.</p>
      </div>
      <div className={styles.status}><i className={dotClass}/>{statusLabel}</div>
    </section>

    {published&&<div className={styles.notice}>Site publicado com sucesso. Produção e rascunho estão sincronizados.</div>}

    <section className={styles.summary} aria-label="Resumo do projeto">
      <article><span>Modelo</span><strong>{segment.templates.find(t=>t.key===project.templateKey)?.name||'Não definido'}</strong></article>
      <article><span>Endereço</span><strong>{state?.native_subdomain?`${state.native_subdomain}.webappcap.com.br`:'Não configurado'}</strong></article>
      <article><span>Última publicação</span><strong>{pub.publishedAt?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(pub.publishedAt)):'Ainda não publicado'}</strong></article>
    </section>

    <section>
      <div className={styles.sectionHead}>
        <div><h2>Gerencie seu site</h2><p>Conteúdo, mídia, aparência e operação reunidos em um só lugar.</p></div>
      </div>
      <div className={styles.tools}>{tools.filter(([, , ,cap])=>can(role,cap)).map(([name,desc,href])=><Link className={styles.tool} href={href} key={name}><span>Gerenciar</span><h3>{name}</h3><p>{desc}</p><b>→</b></Link>)}</div>
    </section>
  </>;
}
