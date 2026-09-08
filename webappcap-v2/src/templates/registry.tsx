import type { ComponentType } from 'react';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import type { TemplateRenderProps } from './types';

/**
 * WebAppCap v2 now has one product target: migrate the current root portfolio
 * into the first native WebAppCap project with visual and behavioral parity.
 *
 * The old iframe renderer is no longer part of the active template registry.
 * `portfolio-native-1` is the canonical renderer and main/index.html remains
 * the external source of truth until the production cutover is approved.
 */
const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
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
