import type { ComponentType } from 'react';
import { PerformanceReferenceTemplate } from './personal-trainer/performance-reference';
import { EditorialTrainerTemplate } from './personal-trainer/editorial';
import { VelocityTrainerTemplate } from './personal-trainer/velocity';
import { LegacyPortfolioTemplate } from './portfolio/legacy';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import type { TemplateRenderProps } from './types';

const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
  'portfolio-legacy-1': LegacyPortfolioTemplate,
  'portfolio-native-1': NativeMainParityPortfolioTemplate,
  'trainer-performance-1': PerformanceReferenceTemplate,
  'trainer-template-2': EditorialTrainerTemplate,
  'trainer-template-3': VelocityTrainerTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  const Renderer=renderers[key];
  if(!Renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Modelo ainda não disponível.</h1><p>Este projeto já possui conteúdo, mas o renderer visual escolhido ainda não foi implementado.</p></div></main>;
  }
  return <Renderer {...props}/>;
}
