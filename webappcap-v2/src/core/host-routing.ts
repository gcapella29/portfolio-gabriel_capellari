export type HostRoute=
  | {kind:'platform';host:string}
  | {kind:'native';host:string;subdomain:string}
  | {kind:'custom';host:string};

const PLATFORM_HOSTS=new Set(['webappcap.com.br','www.webappcap.com.br','localhost','127.0.0.1']);
const clean=(raw:string)=>raw.toLowerCase().trim().replace(/^https?:\/\//,'').split('/')[0].split(':')[0].replace(/\.$/,'');

export function classifyHost(raw:string):HostRoute{
  const host=clean(raw);
  if(!host||PLATFORM_HOSTS.has(host)||host.endsWith('.vercel.app'))return {kind:'platform',host};
  if(host.endsWith('.webappcap.com.br')){
    const subdomain=host.slice(0,-'.webappcap.com.br'.length);
    if(!subdomain||subdomain==='www')return {kind:'platform',host};
    return {kind:'native',host,subdomain};
  }
  return {kind:'custom',host};
}

export function isPublicAssetPath(pathname:string){
  return pathname.startsWith('/_next/')||pathname==='/favicon.ico'||/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$/i.test(pathname);
}
