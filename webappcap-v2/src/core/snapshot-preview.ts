import type {V2Content} from './onboarding-data';
import type {TemplateRenderProject} from '@/templates/types';

const PUBLIC_REGISTRY_URL=process.env.WEBAPPCAP_PUBLIC_SNAPSHOT_REGISTRY_URL?.trim()||'https://drive.google.com/uc?export=download&id=1mt6C4FOTuXkIBOmMunVqsEPIRuME4zQ0';

type Row=Record<string,unknown>;
export type SnapshotPayload={
  ok:boolean;
  error?:string;
  publication?:{published_id?:string;timestamp?:string;version?:number;checksum?:string};
  snapshot?:{
    project?:Row;
    config?:Row;
    meta?:Row;
    style?:Row;
    blocks?:Row[];
    media?:Row[];
    items?:Row[];
    categories?:Row[];
    highlights?:Row[];
    testimonials?:Row[];
    faq?:Row[];
    v2?:V2Content;
  };
};

const text=(value:unknown)=>String(value??'').trim();
const bool=(value:unknown)=>{
  if(typeof value==='boolean')return value;
  return ['true','1','sim','yes'].includes(text(value).toLowerCase());
};
const json=(value:unknown)=>{
  try{return JSON.parse(text(value)||'{}') as Row}
  catch{return {}}
};
const brl=(value:unknown)=>{
  const number=typeof value==='number'?value:Number(String(value??'').replace(',','.'));
  if(!Number.isFinite(number))return text(value);
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(number);
};

function mediaMap(rows:Row[]){
  return new Map(rows.map(row=>[text(row.media_id),row]));
}

function blockMap(rows:Row[]){
  return new Map(
    rows
      .filter(row=>bool(row.ativo))
      .map(row=>[text(row.tipo),row])
  );
}

export function buildBakeryContent(snapshot:NonNullable<SnapshotPayload['snapshot']>){
  const project=snapshot.project||{};
  const config=snapshot.config||{};
  const style=snapshot.style||{};
  const media=Array.isArray(snapshot.media)?snapshot.media:[];
  const items=Array.isArray(snapshot.items)?snapshot.items:[];
  const categories=Array.isArray(snapshot.categories)?snapshot.categories:[];
  const highlights=Array.isArray(snapshot.highlights)?snapshot.highlights:[];
  const blocks=Array.isArray(snapshot.blocks)?snapshot.blocks:[];

  const mediaById=mediaMap(media);
  const categoriesById=new Map(categories.map(row=>[text(row.categoria_id),row]));
  const blocksByType=blockMap(blocks);

  const hero=blocksByType.get('hero')||{};
  const heroCfg=json(hero.config_json);
  const heroMedia=mediaById.get(text(heroCfg.image_id))||{};

  const highlightsBlock=blocksByType.get('destaques')||{};
  const highlightsCfg=json(highlightsBlock.config_json);
  const productsBlock=blocksByType.get('produtos')||{};
  const orderBlock=blocksByType.get('pedido')||{};

  const menuItems=items
    .filter(row=>bool(row.ativo)&&bool(row.disponivel))
    .sort((a,b)=>Number(a.ordem||0)-Number(b.ordem||0))
    .map(row=>{
      const category=categoriesById.get(text(row.categoria_id));
      const image=mediaById.get(text(row.imagem_id));
      return {
        title:text(row.nome),
        category:text(category?.nome),
        description:text(row.descricao),
        price:brl(row.preco_promocional||row.preco),
        image:text(image?.url||image?.preview_url)
      };
    });

  const bakeryHighlights=highlights
    .filter(row=>bool(row.ativo))
    .sort((a,b)=>Number(a.ordem||0)-Number(b.ordem||0))
    .map(row=>{
      const cfg=json(row.config_json);
      const image=mediaById.get(text(row.imagem_id));
      return {
        tag:text(cfg.tag||'Destaque'),
        title:text(row.titulo),
        description:text(row.subtitulo),
        image:text(image?.url||image?.preview_url)
      };
    });

  const identity={
    name:text(config.nome||project.nome),
    tagline:text(hero.subtitulo)
  };

  const content={
    menu_items:menuItems,
    bakery_eyebrow:text(heroCfg.eyebrow),
    bakery_hero_title:text(hero.titulo||config.nome||project.nome),
    bakery_highlights:bakeryHighlights,
    bakery_menu_intro:text(productsBlock.subtitulo),
    bakery_menu_title:text(productsBlock.titulo),
    bakery_order_title:text(orderBlock.titulo),
    bakery_hero_subtitle:text(hero.subtitulo),
    bakery_highlights_intro:text(highlightsBlock.subtitulo),
    bakery_highlights_title:text(highlightsBlock.titulo),
    bakery_highlights_eyebrow:text(highlightsCfg.eyebrow||'Destaques da casa')
  };

  const heroUrl=text(heroMedia.url||heroMedia.preview_url);
  const appearance={
    bakery_accent:text(style.cor_primaria||'#9c4f2f'),
    preview_template_key:'commerce-bakery-1'
  };

  const result:V2Content={
    identity,
    content,
    media:{
      bakery_hero:{
        fit:text(heroCfg.fit||'cover'),
        url:heroUrl,
        zoom:text(heroCfg.zoom||'100'),
        position:text(heroCfg.position||'center center')
      }
    },
    appearance,
    contact:{
      phone:text(config.telefone||heroCfg.phone),
      whatsapp:text(config.whatsapp),
      instagram:text(config.instagram)
    }
  };

  const renderProject:TemplateRenderProject={
    id:text(project.project_id),
    slug:text(project.slug),
    name:text(project.nome||config.nome),
    segment:'commerce',
    templateKey:'commerce-bakery-1'
  };

  return {project:renderProject,data:result};
}

function segmentFromSnapshotType(value:unknown):TemplateRenderProject['segment']{
  const type=text(value).toLowerCase();
  if(['personal-trainer','personal_trainer','fitness'].includes(type))return 'personal-trainer';
  if(type==='institucional'||type==='institutional')return 'institutional';
  if(type==='comercio'||type==='commerce'||type==='padaria')return 'commerce';
  if(type==='escola'||type==='school')return 'school';
  return 'portfolio';
}

function buildV2SnapshotContent(snapshot:NonNullable<SnapshotPayload['snapshot']>){
  if(!snapshot.v2||typeof snapshot.v2!=='object')return null;
  const project=snapshot.project||{};
  const data=snapshot.v2;
  const templateKey=text(data.appearance?.preview_template_key);
  if(!templateKey)return null;

  const renderProject:TemplateRenderProject={
    id:text(project.project_id),
    slug:text(project.slug),
    name:text(project.nome||data.identity?.name),
    segment:segmentFromSnapshotType(project.tipo),
    templateKey
  };

  return {project:renderProject,data};
}

export function renderSnapshotPayload(payload:SnapshotPayload|null){
  if(!payload?.ok||!payload.snapshot)return null;

  const templateId=text(payload.snapshot.project?.template_id);
  const type=text(payload.snapshot.project?.tipo).toLowerCase();
  const v2=buildV2SnapshotContent(payload.snapshot);

  if(v2){
    return {
      ...v2,
      publication:payload.publication||null
    };
  }

  if(templateId==='TPL-0005'||type==='padaria'){
    return {
      ...buildBakeryContent(payload.snapshot),
      publication:payload.publication||null
    };
  }

  return null;
}

export async function readSnapshotPreviewBySlug(rawSlug:string){
  const slug=rawSlug.trim().toLowerCase();
  if(!slug)return null;

  let payload:SnapshotPayload|null=null;

  try{
    const registryResponse=await fetch(PUBLIC_REGISTRY_URL,{cache:'no-store'});
    if(!registryResponse.ok)return null;

    const registry=await registryResponse.json() as {
      projects?:Record<string,{snapshot_url?:string}>
    };

    const snapshotUrl=registry.projects?.[slug]?.snapshot_url?.trim()||'';
    if(!snapshotUrl)return null;

    const snapshotResponse=await fetch(snapshotUrl,{cache:'no-store'});
    if(!snapshotResponse.ok)return null;

    payload=await snapshotResponse.json() as SnapshotPayload;
  }catch{
    return null;
  }

  return renderSnapshotPayload(payload);
}
