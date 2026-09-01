import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { renderTemplate } from '@/templates/registry';

export default async function PreviewPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const {project}=await resolveProjectAccess(slug);
  const data=await readV2Content(project.id);
  return renderTemplate({project:{id:project.id,slug:project.slug,name:project.name,segment:project.segment,templateKey:project.templateKey},data,preview:true});
}
