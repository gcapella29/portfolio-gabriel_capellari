import type { Metadata } from 'next';
import { readPublicSiteBySlug } from '@/core/public-site';
import { NativePortfolioTemplate } from '@/templates/portfolio/native';

export const metadata:Metadata={
  title:'Gabriel Capellari — Portfólio nativo em homologação',
  description:'Homologação isolada do renderer React nativo do portfólio de Gabriel Capellari.',
  robots:{index:false,follow:false}
};

export default async function NativePortfolioPreviewPage(){
  const result=await readPublicSiteBySlug('gabriel-capellari');
  return <NativePortfolioTemplate
    project={result?{...result.project,templateKey:'portfolio-native-1'}:{id:'native-preview',slug:'gabriel-capellari',name:'Gabriel Capellari',segment:'portfolio',templateKey:'portfolio-native-1'}}
    data={result?.data??{identity:{},content:{},media:{},appearance:{},contact:{}}}
  />;
}
