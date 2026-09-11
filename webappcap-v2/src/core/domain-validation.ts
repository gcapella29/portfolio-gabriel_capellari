import { promises as dns } from 'node:dns';

const normalize=(value:string)=>value.toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');
const flatten=(rows:string[][])=>rows.flat().map(v=>v.trim().toLowerCase());

export async function validateCustomDomain(raw:string){
  const domain=normalize(raw);if(!domain)return {ok:false,domain,reason:'Domínio vazio.'};
  const expected=String(process.env.WEBAPPCAP_DOMAIN_CNAME||'cname.vercel-dns.com').toLowerCase().replace(/\.$/,'');
  const verification=String(process.env.WEBAPPCAP_DOMAIN_TXT||'').trim().toLowerCase();
  try{
    const cname=(await dns.resolveCname(domain).catch(()=>[])).map(v=>v.toLowerCase().replace(/\.$/,''));
    if(cname.includes(expected))return {ok:true,domain,method:'cname' as const};
    if(verification){const txt=flatten(await dns.resolveTxt(domain).catch(()=>[]));if(txt.includes(verification))return {ok:true,domain,method:'txt' as const};}
    return {ok:false,domain,reason:`DNS ainda não aponta para ${expected}.`};
  }catch{return {ok:false,domain,reason:'Não foi possível validar o DNS agora.'}}
}
