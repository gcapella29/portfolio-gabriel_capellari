import type { SegmentKey, TemplateDefinition } from './domain';
export type SegmentDefinition={key:SegmentKey;name:string;description:string;templates:TemplateDefinition[]};

export const segments:Record<SegmentKey,SegmentDefinition>={
 portfolio:{key:'portfolio',name:'Portfólio',description:'Portfólio profissional e editorial.',templates:[
  {key:'portfolio-legacy-1',segment:'portfolio',name:'Compatibilidade do portfólio',description:'Chave histórica preservada.',status:'ready'},
  {key:'portfolio-native-1',segment:'portfolio',name:'Portfólio WebAppCap',description:'Versão nativa e gerenciável do portfólio.',status:'ready'}
 ]},
 'food-business':{key:'food-business',name:'Loja Digital',description:'Lojas digitais com catálogo, categorias, promoções, carrinho e pedidos.',templates:[
  {key:'commerce-main-1',segment:'food-business',name:'Clássico',description:'Loja digital completa: catálogo, destaques, conteúdo institucional e pedidos.',status:'ready'},
  {key:'commerce-modern-1',segment:'food-business',name:'Modern',description:'Visual leve e contemporâneo, com hero imersivo, destaques, busca, categorias e carrinho.',status:'ready'},
  {key:'commerce-sales-1',segment:'food-business',name:'Venda rápida',description:'Versão enxuta focada em produto, oferta e conversão pelo WhatsApp.',status:'ready'}
 ]},
 commerce:{key:'commerce',name:'Comércio',description:'Sites para negócios locais com apresentação, destaques, cardápio e pedidos pelo WhatsApp.',templates:[
  {key:'commerce-bakery-1',segment:'commerce',name:'Padaria',description:'Pães, destaques da casa, cardápio e pedido pelo WhatsApp.',status:'ready'}
 ]},
 'personal-trainer':{key:'personal-trainer',name:'Personal Trainer',description:'Treinos, agenda, método e resultados.',templates:[{key:'personal-trainer-main-1',segment:'personal-trainer',name:'Personal Trainer',description:'Método, modalidades, resultados e agenda com contato pelo WhatsApp.',status:'ready'}]},
 institutional:{key:'institutional',name:'Institucional',description:'Organizações, projetos, campanhas, gestão e transparência.',templates:[{key:'institutional-main-1',segment:'institutional',name:'Institucional',description:'História, projetos, doações, campanhas, gestão e álbuns de fotos.',status:'ready'}]},
 school:{key:'school',name:'Escola',description:'Cursos, turmas, estrutura e matrículas. Em breve.',templates:[]}
};
export function templatesForSegment(segment:SegmentKey){return segments[segment].templates}
export function getTemplate(segment:SegmentKey,key:string){return templatesForSegment(segment).find(template=>template.key===key)||null}

export function templateName(key:string|null|undefined){return Object.values(segments).flatMap(segment=>segment.templates).find(template=>template.key===key)?.name||'Modelo não identificado'}
