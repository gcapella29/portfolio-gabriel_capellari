import Link from 'next/link';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';
import styles from '../owner.module.css';

export default async function OwnerProjectsPage(){
  const user=await requireUser();
  const projects=(await projectsForUser(user.id)).filter(project=>project.owner_id===user.id);
  const published=projects.filter(project=>project.is_published).length;
  const configuring=projects.length-published;

  return <main className={styles.page}>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>W</div>
          <div className={styles.brandText}><strong>WebAppCap</strong><span>Owner Workspace</span></div>
        </div>
        <div className={styles.topActions}>
          <Link className={styles.buttonGhost} href="/entry">Área do cliente</Link>
          <Link className={styles.button} href="/owner/projects/new">+ Novo cliente</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>CENTRAL OPERACIONAL</span>
          <h1>Controle seus clientes sem sair do WebAppCap.</h1>
          <p>Acompanhe publicação, configuração e acesso aos projetos em uma visão única preparada para a operação da plataforma.</p>
        </div>
        <div className={styles.heroMeta}>
          <div><strong>{projects.length}</strong><span>projetos ativos</span></div>
          <div><strong>{published}</strong><span>sites publicados</span></div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Resumo da operação">
        <article className={styles.stat}><span>Total de clientes</span><strong>{projects.length}</strong></article>
        <article className={styles.stat}><span>Publicados</span><strong>{published}</strong></article>
        <article className={styles.stat}><span>Em configuração</span><strong>{configuring}</strong></article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div><h2>Projetos</h2><p>Abra um cliente para acessar operação, dashboard e site publicado.</p></div>
          <Link className={styles.buttonGhost} href="/owner/projects/new">Adicionar cliente</Link>
        </div>
        {projects.length===0
          ? <div className={styles.empty}>Nenhum projeto criado ainda. Crie o primeiro cliente para iniciar a operação.</div>
          : <div className={styles.grid}>{projects.map(project=><Link className={styles.projectCard} key={project.id} href={`/owner/projects/${encodeURIComponent(project.slug)}`}>
              <div className={styles.cardTop}>
                <span className={styles.status}><i className={project.is_published?styles.dot:styles.dotDraft}/>{project.is_published?'Publicado':'Configuração'}</span>
                <span className={styles.arrow}>→</span>
              </div>
              <h3>{project.name}</h3>
              <div className={styles.slug}>{project.slug}.webappcap.com.br</div>
              <div className={styles.cardFooter}><span>{project.site_type||'Projeto WebAppCap'}</span><span>{project.is_published?'Online':'Preparando publicação'}</span></div>
            </Link>)}</div>}
      </section>
    </div>
  </main>;
}
