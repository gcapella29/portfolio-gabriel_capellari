import type { SegmentKey, TemplateDefinition } from './domain';
export type SegmentDefinition={key:SegmentKey;name:string;description:string;templates:TemplateDefinition[]};

/**
 * Scope reset: until the portfolio migration is complete, WebAppCap v2 has
 * one active product surface: Portfolio. Other segment keys remain in the
 * domain type only for database/backward compatibility, with no selectable
 * templates or active product flow.
 */
export const segments:Record<SegmentKey,SegmentDefinition>={
 portfolio:{
  key:'portfolio',
  name:'Portfólio',
  description:'Primeiro projeto nativo do WebAppCap: migração do portfólio atual para a nova plataforma.',
  templates:[
   {key:'portfolio-legacy-1',segment:'portfolio',name:'Referência atual',description:'Ponte temporária para comparar o site raiz durante a migração.',status:'ready'},
   {key:'portfolio-native-1',segment:'portfolio',name:'Portfólio WebAppCap',description:'Versão nativa e gerenciável que substituirá o projeto raiz após homologação.',status:'ready'}
  ]
 },
 'personal-trainer':{key:'personal-trainer',name:'Fitness',description:'Segmento pausado enquanto o portfólio é migrado.',templates:[]},
 'food-business':{key:'food-business',name:'Comércio',description:'Segmento pausado enquanto o portfólio é migrado.',templates:[]},
 school:{key:'school',name:'Educação',description:'Segmento pausado enquanto o portfólio é migrado.',templates:[]}
};
export function templatesForSegment(segment:SegmentKey){return segments[segment].templates}
export function getTemplate(segment:SegmentKey,templateKey:string){return templatesForSegment(segment).find(template=>template.key===templateKey)??null}
