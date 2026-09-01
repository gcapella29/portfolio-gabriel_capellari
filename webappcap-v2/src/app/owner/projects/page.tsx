import Link from 'next/link';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';

export default async function OwnerProjectsPage() {
  const user = await requireUser();
  const projects = (await projectsForUser(user.id)).filter(p => p.owner_id === user.id);
  return <main className="shell"><section className="hero-panel"><span className="eyebrow">OWNER</span><h1>Projetos</h1><p>Crie clientes, acompanhe configuração e entre em qualquer projeto sem rotas ambíguas.</p></section><section className="segment-grid">{projects.map(project => <Link className="segment-card" key={project.id} href={`/owner/projects/${encodeURIComponent(project.slug)}`}><span>{project.is_published?'Publicado':'Configuração'}</span><h2>{project.name}</h2><p>{project.slug}</p></Link>)}</section></main>;
}
