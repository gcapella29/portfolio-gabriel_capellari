import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import {menuItemLimitForProject} from '@/core/menu-item-limit';
import EditorWorkspaceHeader from '../editor-workspace-header';
import EditorPageControls from '../editor-page-controls';
import {saveCatalogAction} from '../actions';
import CatalogManager from './catalog-manager';
import pageStyles from './page.module.css';

type RawItem=Record<string,unknown>;

function normalizeItem(value:unknown):Record<string,string>{
 if(!value||typeof value!=='object'||Array.isArray(value))return{};
 return Object.fromEntries(Object.entries(value as RawItem).map(([key,item])=>[key,String(item??'')]));
}

export default async function CatalogPage({
 params,
 searchParams
}:{
 params:Promise<{slug:string}>;
 searchParams:Promise<{saved?:string}>;
}){
 const {slug}=await params,{saved}=await searchParams,{project}=await resolveProjectAccess(slug);
 if(!['food-business','commerce'].includes(project.segment))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const [data,limit]=await Promise.all([readV2Content(project.id),menuItemLimitForProject(project.id)]);
 const items=(Array.isArray(data.content.menu_items)?data.content.menu_items:[]).map(normalizeItem);
 return <div className={`editor-page catalog-workspace-page ${pageStyles.page}`}>
  <EditorWorkspaceHeader
   eyebrow="CATÁLOGO"
   title={project.name}
   description="Gerencie produtos, categorias, preços, promoções e imagens em uma área dedicada. As mudanças ficam no rascunho até a publicação."
   facts={[{label:'Produtos',value:String(items.length)},{label:'Limite',value:String(limit)}]}
  />
  {saved?<div className="notice success"><strong>Catálogo salvo no rascunho.</strong> Confira no Preview e publique quando estiver tudo certo.</div>:null}
  <form id="catalog-manager-form" action={saveCatalogAction}>
   <input type="hidden" name="slug" value={project.slug}/>
   <CatalogManager projectId={project.id} initialItems={items} limit={Math.max(limit,items.length)}/>
  </form>
  <EditorPageControls formId="catalog-manager-form" previewUrl={`/preview/${encodeURIComponent(project.slug)}`} saved={Boolean(saved)} saveLabel="Salvar catálogo"/>
 </div>;
}
