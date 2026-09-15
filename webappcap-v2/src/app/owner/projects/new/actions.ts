'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';
import { segments } from '@/core/segments';
import type { SegmentKey } from '@/core/domain';

const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
const siteType=(segment:SegmentKey)=>({'portfolio':'portfolio','personal-trainer':'personal_trainer','food-business':'local_business','school':'language_teacher'}[segment]);

async function requestOrigin(){const h=await headers(),host=h.get('x-forwarded-host')||h.get('host');if(!host)throw new Error('Não foi possível determinar o endereço da aplicação.');const proto=h.get('x-forwarded-proto')||'https';return `${proto}://${host}`}

export async function createClientProject(formData:FormData){
  const user=await requireUser();
  if(!(await projectsForUser(user.id)).some(project=>project.owner_id===user.id))throw new Error('Apenas o owner pode criar projetos.');
  const name=String(formData.get('name')||'').trim(),segment=String(formData.get('segment')||'') as SegmentKey,adminEmail=String(formData.get('adminEmail')||'').trim().toLowerCase();
  const segmentDefinition=segments[segment];
  if(!name)throw new Error('Informe o nome do projeto.');if(!segmentDefinition||segment==='portfolio'||!segmentDefinition.templates.some(template=>template.status==='ready'))throw new Error('Escolha um segmento disponível para novos clientes.');if(!/^\S+@\S+\.\S+$/.test(adminEmail))throw new Error('Informe um e-mail válido para o administrador.');
  const slug=slugify(String(formData.get('slug')||name));if(!slug)throw new Error('Não foi possível gerar o identificador do projeto.');
  const sb=await createSupabaseServerClient();const exists=await sb.from('projects').select('id').eq('slug',slug).maybeSingle();if(exists.error)throw exists.error;if(exists.data)throw new Error('Esse identificador já está em uso.');
  const created=await sb.functions.invoke('create-project',{body:{slug,name,site_type:siteType(segment),subdomain:null,snapshot:{},template_key:'v2-pending',template_version:1}});if(created.error)throw created.error;
  const project=created.data?.project||{id:created.data?.project_id,slug,name};if(!project.id)throw new Error('O projeto foi criado sem identificador.');
  const state=await sb.from('project_v2_state').upsert({project_id:project.id,segment,template_key:segment==='food-business'?'commerce-main-1':null,lifecycle:'invited',onboarding_step:'account',domain_status:'unconfigured'},{onConflict:'project_id'});if(state.error)throw state.error;
  const commerce=segment==='food-business';const defaults=commerce?{
 identity:{name,tagline:'Feito hoje. Servido com calma.',description:'Um comércio local feito para receber bem.',location:'Rua das Flores, 120 · Centro'},
 content:{hero_title:'Casa Aurora',hero_text:'Sabores, encontros e novidades todos os dias.',primary_offer:'Produtos preparados com cuidado.',proof:'Ingredientes selecionados e atendimento próximo.',about:'Conheça nossas escolhas da casa.',news:[
  {title:'Forno aberto todo dia',description:'Uma nova seleção de pães de fermentação lenta, assados em pequenos lotes.',image:'/commerce/commerce-hero.png'},
  {title:'Almoço de terça a sábado',description:'Pratos leves e ingredientes da estação.',image:'/commerce/commerce-feature.png'},
  {title:'Café da tarde',description:'Bolos, cafés e uma pausa sem pressa.',image:'/commerce/commerce-menu.png'}],
 highlights:[
  {title:'Sanduíche da casa',description:'Pão artesanal, queijo fresco, tomate e folhas.',image:'/commerce/commerce-feature.png'},
  {title:'Cappuccino cremoso',description:'Café encorpado e leite vaporizado.',image:'/commerce/commerce-menu.png'},
  {title:'Cheesecake de frutas vermelhas',description:'Recheio cremoso e frutas frescas.',image:'/commerce/commerce-menu.png'}],
 menu_items:[
  {title:'Sanduíche da casa',description:'Pão rústico, queijo fresco, tomate e folhas.',price:'R$ 28,00',image:'/commerce/commerce-feature.png'},
  {title:'Croissant artesanal',description:'Massa folhada, manteiga e fermentação lenta.',price:'R$ 14,00',image:'/commerce/commerce-menu.png'},
  {title:'Cappuccino',description:'Espresso, leite vaporizado e cacau.',price:'R$ 12,00',image:'/commerce/commerce-menu.png'},
  {title:'Cheesecake',description:'Fatia com calda de frutas vermelhas.',price:'R$ 18,00',image:'/commerce/commerce-menu.png'}]},
 media:{hero:'/commerce/commerce-hero.png',gallery:['/commerce/commerce-feature.png','/commerce/commerce-menu.png']},
 appearance:{accent:'#ef5b3f',heading_font:'Arial Black',body_font:'Arial',preview_template_key:'commerce-main-1'},
 contact:{phone:'(16) 3342-2026',whatsapp:'5516999999999',email:'contato@exemplo.com',instagram:'@casaaurora',address:'Rua das Flores, 120 · Centro',hours:'Terça a domingo, das 8h às 20h'}
}:{};const content=await sb.from('project_v2_content').upsert({project_id:project.id,...defaults},{onConflict:'project_id'});if(content.error)throw content.error;
  const origin=await requestOrigin();const invite=await sb.functions.invoke('manage-project-member',{body:{project_id:project.id,action:'invite',email:adminEmail,role:'admin',redirect_to:`${origin}/auth/callback?next=${encodeURIComponent(`/invite/${slug}`)}`}});if(invite.error)throw invite.error;
  redirect(`/dashboard/${encodeURIComponent(slug)}/content`);
}
