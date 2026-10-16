import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {renderTemplate} from '@/templates/registry';
import {readDraftPreview} from '@/core/draft-preview';
import {HomeSite} from '@/app/home-site';
import {readPublishedHomeProjects} from '@/core/home-projects';
import type {RootSiteContent} from '@/core/root-site';
import {capellariPreviewLayout} from '@/core/capellari-preview';

export const dynamic='force-dynamic';

type Props={
  searchParams:Promise<{
    file?:string;
    token?:string;
    layout?:string;
  }>;
};

export const metadata:Metadata={
  title:{absolute:'Preview do rascunho — WebAppCap'},
  robots:{index:false,follow:false}
};

export default async function DraftPreviewPage({searchParams}:Props){
  const {file='',token='',layout}=await searchParams;
  const result=await readDraftPreview(file,token);
  if(!result)notFound();

  if(result.project.slug==='webappcap'&&result.project.templateKey==='platform-root-v1'){
    const content=Object.fromEntries(Object.entries(result.data.content||{}).filter(([,value])=>typeof value==='string')) as RootSiteContent;
    return <HomeSite content={content} publishedProjects={await readPublishedHomeProjects()} preview/>;
  }

  const selection=capellariPreviewLayout(result.project,result.data,layout);
  const rendered=renderTemplate({
    project:selection?{...result.project,templateKey:selection.templateKey}:result.project,
    data:selection?.data||result.data,
    preview:true
  });
  if(!selection)return rendered;
  const link=(value:string)=>`/draft-preview?${new URLSearchParams({file,token,layout:value})}`;
  return <>
    <nav aria-label="Comparar layouts do rascunho" style={{position:'relative',zIndex:100,display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',padding:'12px 16px',background:'#fff',color:'#18302b',fontFamily:'Arial,sans-serif',fontSize:14}}>
      <strong>Rascunho v{result.preview?.draft_version} · Comparar layouts</strong>
      <a href={link('classic')} aria-current={selection.templateKey==='portfolio-legacy-1'||selection.templateKey==='portfolio-native-1'?'page':undefined}>Clássico</a>
      <a href={link('multidisciplinary')} aria-current={selection.templateKey==='portfolio-multidisciplinary-1'?'page':undefined}>Multidisciplinar</a>
      <span>Comparação temporária. O rascunho salvo permanece igual.</span>
    </nav>
    <div style={{position:'relative'}}>{rendered}</div>
  </>;
}
