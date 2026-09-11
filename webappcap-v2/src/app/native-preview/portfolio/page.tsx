import type { Metadata } from 'next';
import { readPublicSiteBySlug } from '@/core/public-site';
import { NativeMainParityPortfolioTemplate } from '@/templates/portfolio/native-main-parity';

export const metadata:Metadata={
  title:'Gabriel Capellari — Portfólio nativo em homologação',
  description:'Homologação do renderer nativo React do portfólio de Gabriel Capellari no WebAppCap v2.',
  robots:{index:false,follow:false}
};

export default async function NativePortfolioPreviewPage(){
  const result=await readPublicSiteBySlug('gabriel-capellari');

  return <NativeMainParityPortfolioTemplate
    project={result
      ? {...result.project,templateKey:'portfolio-native-1'}
      : {id:'native-preview',slug:'gabriel-capellari',name:'Gabriel Capellari',segment:'portfolio',templateKey:'portfolio-native-1'}
    }
    data={result?.data??{identity:{},content:{},media:{},appearance:{},contact:{}}}
    preview
  />;
}
