import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { segments } from '@/core/segments';
import { onboardingPath } from '@/core/onboarding';
import styles from '../../owner.module.css';

export default async function OwnerProjectPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const {project,role}=await resolveProjectAccess(slug);
  const segment=segments[project.segment];
  const completed=project.onboardingStep==='completed';
  const publicUrl=`https://${project.slug}.webappcap.com.br`;

  return <main className={styles.page}>
    <div className={styles.workspace}>
      <Link className={styles.back} href="/owner/projects">← Central operacional</Link>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>{segment.name} · {role}</span>
          <h1>{project.name}</h1>
          <p>{project.isPublished?'Site publicado e disponível para operação.':'Projeto em preparação. A publicação ainda não foi concluída.'}</p>
        </div>
        <div className={styles.heroMeta}>
          <div><strong>{project.isPublished?'Online':'Draft'}</strong><span>status atual</span></div>
          <div><strong>{completed?'100%':'Em curso'}</strong><span>onboarding</span></div>
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <h2>Visão operacional</h2>
          <div className={styles.infoList}>
            <div className={styles.infoRow}><span>Segmento</span><strong>{segment.name}</strong></div>
            <div className={styles.infoRow}><span>Modelo</span><strong>{project.templateKey||'Ainda não escolhido'}</strong></div>
            <div className={styles.infoRow}><span>Etapa de onboarding</span><strong>{project.onboardingStep}</strong></div>
            <div className={styles.infoRow}><span>Ciclo do projeto</span><strong>{project.lifecycle}</strong></div>
            <div className={styles.infoRow}><span>Endereço nativo</span><strong>{project.slug}.webappcap.com.br</strong></div>
          </div>
        </section>

        <aside className={styles.panel}>
          <h2>Ações rápidas</h2>
          <div className={styles.quickActions}>
            {!completed&&<Link className={styles.quickLink} href={onboardingPath(project.onboardingStep,project.slug)}><span>Continuar configuração</span><span>→</span></Link>}
            <Link className={styles.quickLink} href={`/dashboard/${encodeURIComponent(project.slug)}`}><span>Abrir dashboard</span><span>→</span></Link>
            <Link className={styles.quickLink} href={`/dashboard/${encodeURIComponent(project.slug)}/leads`}><span>Ver leads</span><span>→</span></Link>
            <Link className={styles.quickLink} href={`/dashboard/${encodeURIComponent(project.slug)}/settings`}><span>Configurações</span><span>→</span></Link>
            {project.isPublished&&<a className={styles.quickLink} href={publicUrl} target="_blank" rel="noopener noreferrer"><span>Abrir site publicado</span><span>↗</span></a>}
          </div>
        </aside>
      </div>
    </div>
  </main>;
}
