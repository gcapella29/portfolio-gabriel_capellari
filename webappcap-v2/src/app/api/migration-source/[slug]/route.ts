import {NextResponse} from 'next/server';
import {readPublicSiteByHost,readPublicSiteBySlug} from '@/core/public-site';
import {readPublishedRootContent} from '@/core/root-site';

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

  if(clean==='webappcap'){
    const content=await readPublishedRootContent();
    if(Object.keys(content).length===0){
      return NextResponse.json({ok:false,error:'root_content_unavailable'},{status:409,headers:{'Cache-Control':'no-store'}});
    }
    return NextResponse.json({
      ok:true,
      project:{id:'platform-root',slug:'webappcap',name:'WebAppCap',segment:'platform-root',templateKey:'platform-root-v1'},
      data:{identity:{name:'WebAppCap'},content,media:{},appearance:{preview_template_key:'platform-root-v1'},contact:{}},
      state:{lifecycle:'published',source:'platform_root_content'}
    },{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
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
