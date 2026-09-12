import type { SegmentKey, TemplateDefinition } from './domain';
export type SegmentDefinition={key:SegmentKey;name:string;description:string;templates:TemplateDefinition[]};

/**
 * Current product scope: WebAppCap has one active project surface: Portfolio.
 * Other segment keys remain in the
 * domain type only for database/backward compatibility, with no selectable
 * templates or active product flow.
 */
export const segments:Record<SegmentKey,SegmentDefinition>={
 portfolio:{
  key:'portfolio',
  name:'Portfólio',
  description:'Primeiro projeto nativo e publicado do WebAppCap.',
  templates:[
   {key:'portfolio-legacy-1',segment:'portfolio',name:'Compatibilidade do portfólio',description:'Chave histórica preservada para renderizar o modelo canônico sem duplicar conteúdo.',status:'ready'},
   {key:'portfolio-native-1',segment:'portfolio',name:'Portfólio WebAppCap',description:'Versão nativa, publicada e gerenciável do portfólio.',status:'ready'}
  ]
 },
 'personal-trainer':{key:'personal-trainer',name:'Fitness',description:'Segmento reservado para uma fase futura.',templates:[]},
 'food-business':{key:'food-business',name:'Comércio',description:'Segmento reservado para uma fase futura.',templates:[]},
 school:{key:'school',name:'Educação',description:'Segmento reservado para uma fase futura.',templates:[]}
};
export function templatesForSegment(segment:SegmentKey){return segments[segment].templates}
export function getTemplate(segment:SegmentKey,templateKey:string){return templatesForSegment(segment).find(template=>template.key===templateKey)??null}
