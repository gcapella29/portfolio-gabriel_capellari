import type { ComponentType } from 'react';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import type { TemplateRenderProps } from './types';

/**
 * The current WebAppCap product has one active template surface: Portfolio.
 *
 * The old iframe renderer is no longer part of the active template registry.
 * `portfolio-native-1` is the canonical renderer. The legacy database key is
 * kept only as an alias to the same native renderer so migrated projects cannot
 * fall through while their state is normalized.
 */
const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
  'portfolio-legacy-1': NativeMainParityPortfolioTemplate,
  'portfolio-native-1': NativeMainParityPortfolioTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  const Renderer=renderers[key];
  if(!Renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Modelo ainda não disponível.</h1><p>Este projeto utiliza um modelo que não está ativo na versão atual da plataforma.</p></div></main>;
  }
  return <Renderer {...props}/>;
}
