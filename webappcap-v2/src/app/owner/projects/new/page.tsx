import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';
import { segments } from '@/core/segments';
import { createClientProject } from './actions';
import styles from '../../owner.module.css';

const suggestions=[
 {name:'Professor',description:'Aulas particulares, materiais, agenda e contato.'},
 {name:'Salão & Beleza',description:'Serviços, profissionais, horários e agendamento.'},
 {name:'Clínica & Consultório',description:'Especialidades, equipe, localização e contato.'},
 {name:'Serviços Profissionais',description:'Advocacia, contabilidade, consultoria e empresas.'},
 {name:'Eventos',description:'Apresentação, programação, ingressos e patrocinadores.'}
];

export default async function NewProjectPage({searchParams}:{searchParams:Promise<{error?:string;status?:string;detail?:string;slug?:string}>}){
 const user=await requireUser();const isOwner=(await projectsForUser(user.id)).some(project=>project.owner_id===user.id);if(!isOwner)redirect('/unauthorized');
 const query=await searchParams;
 const categories=Object.values(segments).filter(segment=>segment.key!=='portfolio');
 return <main className={styles.page}><div className={styles.workspace}><Link href="/owner/projects" className={styles.back}>← Central operacional</Link><section className={styles.formCard}>
  <span className={styles.eyebrow}>NOVO PROJETO</span><h1>Escolha o tipo de site.</h1><p>Escolha Loja Digital para catálogo e venda rápida, ou Comércio para um site de negócio local.</p>
  {query.error?<div role="alert" style={{padding:'1rem',borderRadius:12,background:'#fff1ed',color:'#872d1b'}}><strong>Não foi possível concluir a criação (etapa: {query.error}{query.status?`, código ${query.status}`:''}).</strong><p>{query.detail||'Confira a configuração do Supabase.'}</p>{query.slug&&['state','content','invite','duplicate'].includes(query.error)?<p>Confira <Link href="/owner/projects">a lista de projetos</Link> antes de tentar novamente com esse identificador.</p>:null}</div>:null}
  <form action={createClientProject} className={styles.form}>
   <label className={styles.field}><span>Nome do projeto / cliente</span><input name="name" placeholder="Casa Aurora" required/></label>
   <label className={styles.field}><span>Identificador</span><input name="slug" placeholder="casa-aurora (opcional)"/><small>Usado no endereço nativo do projeto.</small></label>
   <fieldset style={{border:0,padding:0,margin:0}}><legend className={styles.legend}>Categoria</legend><div className={styles.choices}>
    {categories.map(segment=>{const ready=segment.templates.some(template=>template.status==='ready');return <label className={styles.choice} key={segment.key} style={!ready?{opacity:.55}:undefined}><input type="radio" name="segment" value={segment.key} defaultChecked={segment.key==='food-business'} disabled={!ready}/><strong>{segment.name}{!ready?' · Em breve':''}</strong><span>{segment.description}</span></label>})}
    {suggestions.map(item=><div className={styles.choice} key={item.name} style={{opacity:.48}}><strong>{item.name} · Em breve</strong><span>{item.description}</span></div>)}
   </div></fieldset>
   <label className={styles.field}><span>Administrador do cliente</span><input name="adminEmail" type="email" placeholder="cliente@email.com" required/><small>Receberá acesso para editar conteúdo, aparência, equipe, Preview e publicação.</small></label>
   <div className={styles.actions}><Link href="/owner/projects" className={styles.buttonGhost}>Cancelar</Link><button className={`${styles.button} ${styles.submit}`}>Criar projeto e enviar convite</button></div>
  </form>
 </section></div></main>
}
