import type { ComponentType } from 'react';
import { LegacyPortfolioTemplate } from './portfolio/legacy';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import type { TemplateRenderProps } from './types';

/**
 * WebAppCap v2 is intentionally focused on migrating the current portfolio
 * into the first native WebAppCap project. The legacy renderer remains only
 * as a temporary comparison/migration bridge until cutover is complete.
 */
const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
  'portfolio-legacy-1': LegacyPortfolioTemplate,
  'portfolio-native-1': NativeMainParityPortfolioTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  const Renderer=renderers[key];
  if(!Renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Projeto não disponível nesta fase.</h1><p>Esta versão está dedicada exclusivamente à migração do portfólio para o primeiro projeto nativo do WebAppCap.</p></div></main>;
  }
  return <Renderer {...props}/>;
}
