import Link from 'next/link';
import {redirect} from 'next/navigation';
import {requireUser} from '@/core/session';
import {projectsForUser,projectForUser} from '@/core/projects';
import {destinationForUser} from '@/core/onboarding';

export default async function ProjectsPage({searchParams}:{searchParams:Promise<{owned?:string;from?:string}>}){
 const query=await searchParams,user=await requireUser(),all=await projectsForUser(user.id),ownedOnly=query.owned==='1',from=String(query.from||'');
 const projects=all.filter(project=>(!ownedOnly||project.owner_id===user.id)&&(!from||project.slug!==from));
 if(ownedOnly&&!projects.length){if(from)redirect(`/dashboard/${encodeURIComponent(from)}`);redirect('/unauthorized')}
 const rows=await Promise.all(projects.map(async p=>({p,access:await projectForUser(p.slug,user.id)})));
 return <main className="shell"><section className="hero-panel"><span className="eyebrow">{ownedOnly?'PROJETOS QUE VOCÊ POSSUI':'MEUS SITES'}</span><h1>Escolha um projeto.</h1><p>{ownedOnly?'A troca de projeto mostra somente sites em que sua conta é a proprietária.':'Escolha um dos projetos disponíveis para sua conta.'}</p></section><section className="segment-grid">{rows.filter(r=>r.access&&(!ownedOnly||r.access.role==='owner')).map(({p,access})=><Link key={p.id} className="segment-card" href={destinationForUser(access!.project,access!.role)}><span>{access!.role}</span><h2>{p.name}</h2><p>{access!.project.onboardingStep==='completed'?'Abrir dashboard':'Continuar configuração'}</p></Link>)}</section></main>;
}
