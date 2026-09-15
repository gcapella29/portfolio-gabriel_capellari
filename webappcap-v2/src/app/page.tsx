import type { Metadata } from 'next';
import { readPublishedRootContent } from '@/core/root-site';
import { HomeSite } from './home-site';

export const metadata:Metadata={
  title:'WebAppCap — Sites que trabalham por você',
  description:'Sites profissionais, rápidos e fáceis de atualizar. Conheça os projetos criados pela WebAppCap.',
  alternates:{canonical:'https://www.webappcap.com.br'},
  openGraph:{
    title:'WebAppCap — Sites que trabalham por você',
    description:'Sites profissionais, rápidos e fáceis de atualizar. Conheça os projetos criados pela WebAppCap.',
    url:'https://www.webappcap.com.br',
    siteName:'WebAppCap',
    locale:'pt_BR',
    type:'website'
  }
};

export default async function HomePage(){
  const content=await readPublishedRootContent();
  return <HomeSite content={content}/>;
}
