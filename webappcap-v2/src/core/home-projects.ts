import {createSupabasePublicClient} from '@/lib/supabase/public';
import {safeProjectUrl,type HomeProjectCase} from './home-project-cases';

const categories:Record<string,string>={portfolio:'Portfólio','personal-trainer':'Personal Trainer','food-business':'Loja Digital',commerce:'Comércio',institutional:'Institucional',school:'Educação'};
const descriptions:Record<string,string>={portfolio:'Trajetória, trabalhos e contato em um portfólio com gestão de conteúdo.','personal-trainer':'Apresentação profissional, modalidades e resultados, com contato direto pelo WhatsApp.','food-business':'Catálogo, categorias e carrinho com pedidos pelo WhatsApp.',commerce:'Produtos, destaques e informações do negócio em uma experiência responsiva.',institutional:'Projetos, história, equipe e formas de participar em um site institucional.',school:'Uma presença digital para apresentar a escola e seus serviços.'};
const mediaUrl=(value:unknown)=>{const row=value&&typeof value==='object'?value as Record<string,unknown>:{};const raw=typeof value==='string'?value:row.url;return safeProjectUrl(raw)};
export async function readPublishedHomeProjects():Promise<HomeProjectCase[]>{
  try{
    const sb=createSupabasePublicClient();
    const projects=await sb.from('projects').select('id,slug,name').eq('is_published',true).is('archived_at',null).order('name');
    if(projects.error||!projects.data?.length)return [];
    const ids=projects.data.map(project=>project.id);
    const [states,snapshots]=await Promise.all([
      sb.from('project_v2_state').select('project_id,segment,template_key,lifecycle,native_subdomain,custom_domain,domain_status').in('project_id',ids).eq('lifecycle','published'),
      sb.from('project_v2_public_content').select('project_id,media').in('project_id',ids)
    ]);
    if(states.error||snapshots.error)return [];
    const stateMap=new Map(states.data?.map(row=>[row.project_id,row]));
    const mediaMap=new Map(snapshots.data?.map(row=>[row.project_id,row.media]));
    return projects.data.flatMap(project=>{
      const state=stateMap.get(project.id);if(!state?.template_key||!mediaMap.has(project.id))return [];
      const media=mediaMap.get(project.id)||{};
      const url=state.custom_domain&&state.domain_status==='active'?safeProjectUrl(`https://${state.custom_domain}`):safeProjectUrl(`https://${state.native_subdomain||project.slug}.webappcap.com.br`);
      if(!url)return [];
      return [{name:project.name,slug:project.slug,url,category:categories[state.segment]||'Site profissional',description:descriptions[state.segment]||'Um projeto criado com identidade própria e painel para atualizar o conteúdo.',facts:[{label:'GESTÃO',text:'Editor e preview'},{label:'MOBILE',text:'Experiência responsiva'}],tags:[categories[state.segment]||'Site profissional','WebAppCap'],image:mediaUrl(media.hero)||mediaUrl(media.bakery_hero)}];
    });
  }catch{return [];}
}
