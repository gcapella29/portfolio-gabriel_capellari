import { PerformanceTrainerTemplate } from './personal-trainer/performance';
import { LegacyPortfolioTemplate } from './portfolio/legacy';
import type { TemplateRenderProps } from './types';

const renderers: Record<string,(props:TemplateRenderProps)=>React.ReactNode> = {
  'portfolio-legacy-1': LegacyPortfolioTemplate,
  'trainer-performance-1': PerformanceTrainerTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  const renderer=renderers[key];
  if(!renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Modelo ainda não disponível.</h1><p>Este projeto já possui conteúdo, mas o renderer visual escolhido ainda não foi implementado.</p></div></main>;
  }
  return renderer(props);
}
