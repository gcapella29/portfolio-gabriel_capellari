import type { SegmentKey, TemplateDefinition } from './domain';
export type SegmentDefinition={key:SegmentKey;name:string;description:string;templates:TemplateDefinition[]};

export const segments:Record<SegmentKey,SegmentDefinition>={
 portfolio:{key:'portfolio',name:'Portfólio',description:'Portfólio profissional e editorial.',templates:[
  {key:'portfolio-legacy-1',segment:'portfolio',name:'Compatibilidade do portfólio',description:'Chave histórica preservada.',status:'ready'},
  {key:'portfolio-native-1',segment:'portfolio',name:'Portfólio WebAppCap',description:'Versão nativa e gerenciável do portfólio.',status:'ready'}
 ]},
 'food-business':{key:'food-business',name:'Comércio',description:'Lojas, cafés, restaurantes e negócios locais com catálogo e pedidos.',templates:[
  {key:'commerce-main-1',segment:'food-business',name:'Completo',description:'Bistrô editorial: presença completa, catálogo, destaques, conteúdo institucional e pedidos.',status:'ready'},
  {key:'commerce-sales-1',segment:'food-business',name:'Venda rápida',description:'Versão enxuta focada em produto, oferta e conversão pelo WhatsApp.',status:'ready'}
 ]},
 'personal-trainer':{key:'personal-trainer',name:'Personal Trainer',description:'Treinos, agenda, método e resultados. Em breve.',templates:[]},
 school:{key:'school',name:'Escola',description:'Cursos, turmas, estrutura e matrículas. Em breve.',templates:[]}
};
export function templatesForSegment(segment:SegmentKey){return segments[segment].templates}
export function getTemplate(segment:SegmentKey,key:string){return templatesForSegment(segment).find(template=>template.key===key)||null}
