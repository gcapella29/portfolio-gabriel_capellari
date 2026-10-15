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

/**
 * Public project cards sourced from already published Drive snapshots.
 * On the root cutover this avoids querying the legacy CMS for presentation.
 */
export async function readPublishedHomeProjectsFromSnapshots():Promise<HomeProjectCase[]>{
  const registryUrl=process.env.WEBAPPCAP_PUBLIC_SNAPSHOT_REGISTRY_URL?.trim()
    ||'https://drive.google.com/uc?export=download&id=1mt6C4FOTuXkIBOmMunVqsEPIRuME4zQ0';
  try {
    const response=await fetch(registryUrl,{cache:'no-store'});
    if(!response.ok)return [];
    const registry=await response.json() as {projects?:Record<string,{snapshot_url?:string}>};
    const entries=Object.entries(registry.projects||{}).filter(([slug])=>slug!=='webappcap');
    const results=await Promise.all(entries.map(async([slug,row]):Promise<HomeProjectCase|null>=>{
      const snapshotUrl=String(row?.snapshot_url||'').trim();
      if(!/^https:\/\/drive\.google\.com\//.test(snapshotUrl))return null;
      try{
        const snap=await fetch(snapshotUrl,{cache:'no-store'});
        if(!snap.ok)return null;
        const payload=await snap.json() as {
          ok?:boolean;
          snapshot?:{
            project?:Record<string,unknown>;
            v2?:{identity?:Record<string,unknown>;media?:Record<string,unknown>};
            config?:Record<string,unknown>;
            blocks?:unknown[];
          }
        };
        if(!payload.ok||!payload.snapshot)return null;
        const project=payload.snapshot.project||{};
        const identity=payload.snapshot.v2?.identity||{};
        const media=payload.snapshot.v2?.media||{};
        const kind=String(project.tipo||'').toLowerCase();
        const category=kind==='padaria'?'Loja Digital':
          kind==='institucional'?'Institucional':
          kind==='personal-trainer'?'Personal Trainer':
          kind==='portfolio'?'Portfólio':
          kind==='comercio'?'Comércio':'Site profissional';
        const description=kind==='padaria'
          ?'Produtos, destaques e pedidos em um site responsivo.'
          :descriptions[kind]||'Um projeto WebAppCap com conteúdo gerenciado no Owner.';
        const mediaObject=(value:unknown):string=>{
          const object=value&&typeof value==='object'?value as Record<string,unknown>:{};
          return mediaUrl(object.url||value);
        };
        const name=String(project.nome||identity.name||slug).trim();
        return{
          name,slug,url:`https://${slug}.webappcap.com.br/`,
          category,description,
          facts:[{label:'GESTÃO',text:'Editor e preview'},{label:'MOBILE',text:'Experiência responsiva'}],
          tags:[category,'WebAppCap'],
          image:mediaObject(media.hero)||mediaObject(media.bakery_hero)||undefined
        };
      }catch{return null;}
    }));
    return results.filter((item):item is HomeProjectCase=>Boolean(item));
  }catch{return [];}
}
