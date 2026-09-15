import type { SegmentKey, TemplateDefinition } from './domain';
export type SegmentDefinition={key:SegmentKey;name:string;description:string;templates:TemplateDefinition[]};

export const segments:Record<SegmentKey,SegmentDefinition>={
 portfolio:{key:'portfolio',name:'Portfólio',description:'Portfólio profissional e editorial.',templates:[
  {key:'portfolio-legacy-1',segment:'portfolio',name:'Compatibilidade do portfólio',description:'Chave histórica preservada.',status:'ready'},
  {key:'portfolio-native-1',segment:'portfolio',name:'Portfólio WebAppCap',description:'Versão nativa e gerenciável do portfólio.',status:'ready'}
 ]},
 'food-business':{key:'food-business',name:'Comércio',description:'Lojas, cafés, restaurantes e negócios locais com cardápio e pedidos.',templates:[
  {key:'commerce-main-1',segment:'food-business',name:'Bistrô editorial',description:'Fotografia ampla, tipografia marcante e movimentos suaves.',status:'ready'},
  {key:'commerce-night-1',segment:'food-business',name:'Noite vibrante',description:'Fundo escuro, cores elétricas e transições mais rápidas.',status:'ready'},
  {key:'commerce-classic-1',segment:'food-business',name:'Clássico artesanal',description:'Tons naturais, formas arredondadas e movimento discreto.',status:'ready'}
 ]},
 'personal-trainer':{key:'personal-trainer',name:'Personal Trainer',description:'Treinos, agenda, método e resultados. Em breve.',templates:[]},
 school:{key:'school',name:'Escola',description:'Cursos, turmas, estrutura e matrículas. Em breve.',templates:[]}
};
export function templatesForSegment(segment:SegmentKey){return segments[segment].templates}
export function getTemplate(segment:SegmentKey,key:string){return templatesForSegment(segment).find(template=>template.key===key)||null}
