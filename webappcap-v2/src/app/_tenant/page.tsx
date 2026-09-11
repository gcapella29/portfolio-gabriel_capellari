import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { readPublicSiteByHost } from '@/core/public-site';
import { renderTemplate } from '@/templates/registry';

export const dynamic='force-dynamic';
const readSite=cache(readPublicSiteByHost);
type TenantProps={searchParams:Promise<{host?:string}>};

export async function generateMetadata({searchParams}:TenantProps):Promise<Metadata>{
  const {host}=await searchParams,result=host?await readSite(host):null;
  if(!result)return {title:{absolute:'Projeto não encontrado — WebAppCap'},robots:{index:false,follow:false}};
  const name=String(result.data.identity.name||result.project.name).trim();
  const role=String(result.data.content.hero_text||'Portfólio profissional').trim();
  const description=String(result.data.identity.description||role).trim().slice(0,160);
  const canonical=result.state.custom_domain&&result.state.domain_status==='active'
    ?`https://${result.state.custom_domain}`
    :result.state.native_subdomain?`https://${result.state.native_subdomain}.webappcap.com.br`:undefined;
  const title=`${name} — ${role}`;
  return {title:{absolute:title},description,alternates:canonical?{canonical}:undefined,openGraph:{title,description,url:canonical,siteName:'WebAppCap',locale:'pt_BR',type:'website'}};
}

export default async function TenantPage({searchParams}:TenantProps){
  const {host}=await searchParams;
  if(!host)notFound();
  const result=await readSite(host);
  if(!result)notFound();
  return renderTemplate({project:result.project,data:result.data});
}
