import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';

export default async function OwnerProjectPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{project,role}=await resolveProjectAccess(slug);
 if(role!=='owner')redirect('/unauthorized');
 redirect(project.segment==='food-business'?`/dashboard/${encodeURIComponent(project.slug)}/editor`:`/dashboard/${encodeURIComponent(project.slug)}/content`);
}
