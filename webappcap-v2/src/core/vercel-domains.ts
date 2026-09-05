const normalize=(value:string)=>value.toLowerCase().trim().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');

type VercelDomainResponse={name?:string;verified?:boolean;verification?:Array<{type:string;domain:string;value:string;reason?:string}>;error?:{code?:string;message?:string}};

function config(){
  const token=String(process.env.VERCEL_API_TOKEN||'').trim();
  const project=String(process.env.VERCEL_PROJECT_ID||process.env.VERCEL_PROJECT_NAME||'').trim();
  const team=String(process.env.VERCEL_TEAM_ID||'').trim();
  return {token,project,team,ready:Boolean(token&&project)};
}

async function request(path:string,init:RequestInit={}){
  const {token,team}=config();
  if(!token)throw new Error('VERCEL_API_TOKEN não configurado.');
  const url=new URL(`https://api.vercel.com${path}`); if(team)url.searchParams.set('teamId',team);
  const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});
  const body=await response.json().catch(()=>({})) as VercelDomainResponse;
  if(!response.ok)throw new Error(body.error?.message||`Vercel API ${response.status}`);
  return body;
}

export function isVercelDomainAutomationConfigured(){return config().ready}

export async function attachCustomDomain(raw:string){
  const domain=normalize(raw),{project}=config(); if(!domain)throw new Error('Domínio inválido.');
  const body=await request(`/v10/projects/${encodeURIComponent(project)}/domains`,{method:'POST',body:JSON.stringify({name:domain})});
  return {domain,verified:Boolean(body.verified),verification:body.verification||[]};
}

export async function inspectCustomDomain(raw:string){
  const domain=normalize(raw),{project}=config(); if(!domain)throw new Error('Domínio inválido.');
  const body=await request(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`);
  return {domain,verified:Boolean(body.verified),verification:body.verification||[]};
}

export async function verifyCustomDomain(raw:string){
  const domain=normalize(raw),{project}=config(); if(!domain)throw new Error('Domínio inválido.');
  const body=await request(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}/verify`,{method:'POST'});
  return {domain,verified:Boolean(body.verified),verification:body.verification||[]};
}

export async function detachCustomDomain(raw:string){
  const domain=normalize(raw),{project}=config(); if(!domain)return;
  await request(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}`,{method:'DELETE'});
}
