import {InstitutionalMainTemplate} from './institutional/institutional-main';
import {PersonalTrainerMainTemplate} from './trainer/trainer-main';
import type { ComponentType } from 'react';
import { NativeMainParityPortfolioTemplate } from './portfolio/native-main-parity';
import { MultidisciplinaryPortfolioTemplate } from './portfolio/multidisciplinary';
import {CapellariConcept} from '@/app/portfolio-concept/concept-client';
import { CommerceTemplate } from './commerce/commerce';
import { BakeryTemplate } from './commerce/bakery';
import type { TemplateRenderProps } from './types';
import './hero-text-motion.css';

const renderers: Record<string,ComponentType<TemplateRenderProps>> = {
  'institutional-main-1':InstitutionalMainTemplate,
  'personal-trainer-main-1':PersonalTrainerMainTemplate,
  'portfolio-legacy-1': NativeMainParityPortfolioTemplate,
  'portfolio-multidisciplinary-1': ({data,preview})=><CapellariConcept data={data} preview={preview}/>,
  'portfolio-native-1': NativeMainParityPortfolioTemplate,
  'portfolio-multidisciplinary-2': MultidisciplinaryPortfolioTemplate,
  'commerce-main-1': CommerceTemplate,
  'commerce-sales-1': CommerceTemplate,
  'commerce-modern-1': CommerceTemplate,
  'commerce-bakery-1': BakeryTemplate
};

export function renderTemplate(props:TemplateRenderProps){
  const key=props.project.templateKey||'';
  // The multidisciplinary concept is exclusive to PRJ-0002. Other tenants must not render it accidentally.
  if(key==='portfolio-multidisciplinary-1' && (props.project.id!=='PRJ-0002' || props.project.slug!=='capellari')){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div><strong>WebAppCap</strong><h1>Modelo indisponível para este projeto.</h1></div></main>;
  }
  const Renderer=renderers[key];
  if(!Renderer){
    return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'2rem',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:620}}><strong>WebAppCap</strong><h1>Modelo ainda não disponível.</h1><p>Este projeto utiliza um modelo que não está ativo na versão atual da plataforma.</p></div></main>;
  }
  return <Renderer {...props}/>;
}
