import {NextResponse} from 'next/server';
import {readPublicSiteByHost,readPublicSiteBySlug} from '@/core/public-site';

const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request:Request,
  context:{params:Promise<{slug:string}>}
){
  const {slug}=await context.params;
  const clean=String(slug||'').trim().toLowerCase();

  if(!slugPattern.test(clean)){
    return NextResponse.json({ok:false,error:'invalid_slug'},{status:400,headers:{'Cache-Control':'no-store'}});
  }

  const site=(await readPublicSiteBySlug(clean))||(await readPublicSiteByHost(`${clean}.webappcap.com.br`));

  if(!site){
    return NextResponse.json({ok:false,error:'not_found'},{status:404,headers:{'Cache-Control':'no-store'}});
  }

  return NextResponse.json({
    ok:true,
    project:site.project,
    data:site.data,
    state:site.state
  },{
    headers:{
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    }
  });
}
