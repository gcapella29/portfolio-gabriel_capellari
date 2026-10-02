import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content} from '@/core/onboarding-data';
import EditorWorkspaceHeader from '../../editor-workspace-header';
import TrainerEditor from './trainer-editor';
export default async function TrainerEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{saved?:string}>}){
 const {slug}=await params,{saved}=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment!=='personal-trainer'||!can(role,'editContent'))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const data=await readV2Content(project.id);
 return <div><EditorWorkspaceHeader eyebrow="EDITAR SITE · PERSONAL TRAINER" title={project.name} description="Edite agenda, método, modalidades e resultados. As alterações chegam primeiro ao rascunho." facts={[{label:'Modelo',value:'Personal Trainer'}]}/><p className="notice">O formulário do site prepara a mensagem para WhatsApp; não reserva horários automaticamente. Substitua os números, depoimentos e resultados de exemplo por informações reais antes de publicar.</p>{saved?<div className="notice success" role="status">Salvo no rascunho. Confira no Preview antes de publicar.</div>:null}<TrainerEditor projectId={project.id} slug={project.slug} data={data} canManageMedia={can(role,'manageMedia')} saved={Boolean(saved)}/></div>;
}
