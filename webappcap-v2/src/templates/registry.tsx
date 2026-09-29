import type { ComponentType } from 'react';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import { CommerceTemplate } from './commerce/commerce';
import { BakeryTemplate } from './commerce/bakery';
import type { TemplateRenderProps } from './types';
import './hero-text-motion.css';

const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
  'portfolio-legacy-1': NativeMainParityPortfolioTemplate,
  'portfolio-native-1': NativeMainParityPortfolioTemplate,
  'commerce-main-1': CommerceTemplate,
  'commerce-sales-1': CommerceTemplate,
  'commerce-bakery-1': BakeryTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  const Renderer=renderers[key];
  if(!Renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Modelo ainda não disponível.</h1><p>Este projeto utiliza um modelo que não está ativo na versão atual da plataforma.</p></div></main>;
  }
  return <Renderer {...props}/>;
}
