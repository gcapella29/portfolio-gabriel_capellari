import type { Metadata } from 'next';
import { readPublicSiteBySlug } from '@/core/public-site';
import { LegacyPortfolioTemplate } from '@/templates/portfolio/legacy';

export const metadata:Metadata={
  title:'Gabriel Capellari — Portfólio em homologação',
  description:'Homologação fiel do portfólio de Gabriel Capellari como projeto WebAppCap.',
  robots:{index:false,follow:false}
};

export default async function NativePortfolioPreviewPage(){
  const result=await readPublicSiteBySlug('gabriel-capellari');
  return <LegacyPortfolioTemplate
    project={result?{...result.project,templateKey:'portfolio-legacy-1'}:{id:'native-preview',slug:'gabriel-capellari',name:'Gabriel Capellari',segment:'portfolio',templateKey:'portfolio-legacy-1'}}
    data={result?.data??{identity:{},content:{},media:{},appearance:{},contact:{}}}
  />;
}
