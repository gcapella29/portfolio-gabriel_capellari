import Link from 'next/link';
import { requireUser } from '@/core/session';
import { projectsForUser, projectForUser } from '@/core/projects';
import { destinationForUser } from '@/core/onboarding';

export default async function ProjectsPage(){const user=await requireUser();const projects=await projectsForUser(user.id);const rows=await Promise.all(projects.map(async p=>({p,access:await projectForUser(p.slug,user.id)})));return <main className="shell"><section className="hero-panel"><span className="eyebrow">MEUS SITES</span><h1>Escolha um projeto.</h1><p>Esta tela só aparece quando a conta realmente possui mais de um projeto.</p></section><section className="segment-grid">{rows.filter(r=>r.access).map(({p,access})=><Link key={p.id} className="segment-card" href={destinationForUser(access!.project,access!.role)}><span>{access!.role}</span><h2>{p.name}</h2><p>{access!.project.onboardingStep==='completed'?'Abrir dashboard':'Continuar configuração'}</p></Link>)}</section></main>}
