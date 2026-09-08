import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { templatesForSegment } from '@/core/segments';
import { saveAppearanceAction, saveTemplateAction } from '../actions';

const v=(o:Record<string,unknown>,k:string)=>String(o[k]??'');
export default async function AppearancePage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{saved?:string;template?:string}>}){
  const {slug}=await params,{saved,template}=await searchParams,{project}=await resolveProjectAccess(slug),data=await readV2Content(project.id);
  const templates=templatesForSegment(project.segment).filter(item=>item.status==='ready');
  const selectedTemplate=v(data.appearance,'preview_template_key')||project.templateKey||'';
  return <div className="editor-page">
    <header><span className="eyebrow dark-text">APARÊNCIA</span><h1>Personalize sem quebrar o template.</h1><p>Troque o modelo visual sem perder textos, fotos, contatos ou dados do projeto. A mudança aparece primeiro no preview e só chega ao site publicado quando você clicar em Publicar.</p></header>
    {saved&&<div className="notice success">Aparência salva.</div>}
    {template&&<div className="notice success">Modelo alterado no preview. O site publicado continua igual até a próxima publicação.</div>}

    <section className="editor-section" style={{marginBottom:'1.5rem'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        <div><span className="eyebrow dark-text">MODELO DO SITE</span><h2 style={{margin:'.3rem 0'}}>Escolha a experiência visual</h2><p style={{margin:0,maxWidth:720}}>Todos os modelos abaixo usam o mesmo conteúdo do seu projeto. Você pode experimentar à vontade no preview antes de publicar.</p></div>
        <Link className="action" href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Abrir preview ↗</Link>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem'}}>
        {templates.map(item=>{
          const selected=item.key===selectedTemplate,published=item.key===project.templateKey;
          return <article key={item.key} style={{border:selected?'2px solid #111':'1px solid rgba(17,17,17,.14)',borderRadius:18,padding:'1.15rem',background:selected?'#fff':'rgba(255,255,255,.55)',boxShadow:selected?'0 14px 34px rgba(0,0,0,.08)':'none',display:'flex',flexDirection:'column',minHeight:230}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:'.75rem',alignItems:'start'}}><div><strong style={{fontSize:'1.05rem'}}>{item.name}</strong><p style={{fontSize:'.84rem',lineHeight:1.5}}>{item.description}</p></div><span style={{fontSize:'.68rem',fontWeight:800,letterSpacing:'.06em',padding:'.35rem .5rem',borderRadius:999,background:selected?'#111':'#ecece8',color:selected?'#fff':'#555',whiteSpace:'nowrap'}}>{selected?'NO PREVIEW':'DISPONÍVEL'}</span></div>
            <div style={{marginTop:'auto'}}>{published&&<p style={{fontSize:'.72rem',fontWeight:700,margin:'0 0 .65rem'}}>✓ Modelo atualmente publicado</p>}<form action={saveTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={item.key}/><button className={selected?'action':'action primary'} disabled={selected} style={{width:'100%',opacity:selected ? .65 : 1}}>{selected?'Selecionado':'Usar no preview'}</button></form></div>
          </article>
        })}
      </div>
      {selectedTemplate!==project.templateKey&&<div className="appearance-note" style={{marginTop:'1rem'}}><strong>Há uma troca de modelo aguardando publicação</strong><p>Confira o preview. Se estiver tudo certo, use o botão <strong>Publicar</strong> no topo do dashboard para substituir o modelo do site ao vivo.</p></div>}
    </section>

    <form action={saveAppearanceAction} className="form-stack"><input type="hidden" name="slug" value={project.slug}/><section className="editor-section"><div className="form-grid"><label className="field"><span>Cor de destaque</span><input name="accent" type="color" defaultValue={v(data.appearance,'accent')||'#d9ff43'}/></label><label className="field"><span>Tamanho geral</span><select name="scale" defaultValue={v(data.appearance,'scale')||'normal'}><option value="compact">Compacto</option><option value="normal">Padrão</option><option value="large">Grande</option></select></label><label className="field"><span>Fonte dos títulos</span><select name="heading_font" defaultValue={v(data.appearance,'heading_font')||'Montserrat'}><option>Montserrat</option><option>Manrope</option><option>Fraunces</option><option>Playfair Display</option></select></label><label className="field"><span>Fonte dos textos</span><select name="body_font" defaultValue={v(data.appearance,'body_font')||'DM Sans'}><option>DM Sans</option><option>Inter</option><option>Manrope</option><option>Montserrat</option></select></label><label className="field"><span>Alinhamento predominante</span><select name="alignment" defaultValue={v(data.appearance,'alignment')||'left'}><option value="left">Esquerda</option><option value="center">Centralizado</option><option value="right">Direita</option></select></label><label className="field"><span>Espaçamento das seções</span><select name="density" defaultValue={v(data.appearance,'density')||'normal'}><option value="compact">Compacto</option><option value="normal">Padrão</option><option value="airy">Espaçoso</option></select></label></div><div className="appearance-note"><strong>O que fica protegido</strong><p>Responsividade, contraste mínimo, proporções críticas e estrutura do template continuam controlados pelo WebAppCap.</p></div></section><div className="sticky-save"><button className="action primary">Salvar aparência</button></div></form>
  </div>
}
