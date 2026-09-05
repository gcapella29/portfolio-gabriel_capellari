import type { Metadata } from 'next';
import { NativePortfolioTemplate } from '@/templates/portfolio/native';

export const metadata:Metadata={
  title:'Gabriel Capellari — Portfólio nativo em homologação',
  description:'Homologação isolada do renderer React nativo do portfólio de Gabriel Capellari.',
  robots:{index:false,follow:false}
};

export default function NativePortfolioPreviewPage(){
  return <NativePortfolioTemplate
    preview
    project={{id:'native-preview',slug:'gabriel-capellari',name:'Gabriel Capellari',segment:'portfolio',templateKey:'portfolio-native-1'}}
    data={{identity:{},content:{},media:{},appearance:{},contact:{}}}
  />;
}
