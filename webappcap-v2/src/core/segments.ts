import type { SegmentKey, TemplateDefinition } from './domain';

export type SegmentDefinition = {
  key: SegmentKey;
  name: string;
  description: string;
  templates: TemplateDefinition[];
};

export const segments: Record<SegmentKey, SegmentDefinition> = {
  portfolio: {
    key: 'portfolio',
    name: 'Portfólio',
    description: 'Portfólio profissional preservado no renderer legado durante a migração.',
    templates: [
      {key:'portfolio-legacy-1',segment:'portfolio',name:'Portfólio atual',description:'Site atual preservado sem alterações.',status:'legacy'}
    ]
  },
  'personal-trainer': {
    key: 'personal-trainer',
    name: 'Personal Trainer',
    description: 'Sites comerciais para personal trainers com foco em confiança, prova social e conversão.',
    templates: [
      {key:'trainer-performance-1',segment:'personal-trainer',name:'Performance',description:'Base aprovada em preto, off-white e lima, orientada a conversão.',status:'ready'},
      {key:'trainer-template-2',segment:'personal-trainer',name:'Modelo 2',description:'Segundo estilo visual a ser construído com referências próprias.',status:'planned'},
      {key:'trainer-template-3',segment:'personal-trainer',name:'Modelo 3',description:'Terceiro estilo visual a ser construído com referências próprias.',status:'planned'}
    ]
  },
  'food-business': {
    key: 'food-business',
    name: 'Comércio Alimentício',
    description: 'Padarias, restaurantes, confeitarias, lanchonetes e delivery.',
    templates: [
      {key:'food-template-1',segment:'food-business',name:'Modelo 1',description:'Aguardando referências.',status:'planned'},
      {key:'food-template-2',segment:'food-business',name:'Modelo 2',description:'Aguardando referências.',status:'planned'},
      {key:'food-template-3',segment:'food-business',name:'Modelo 3',description:'Aguardando referências.',status:'planned'}
    ]
  },
  school: {
    key: 'school',
    name: 'Escola',
    description: 'Escolas, cursos e instituições de ensino.',
    templates: [
      {key:'school-template-1',segment:'school',name:'Modelo 1',description:'Aguardando referências.',status:'planned'},
      {key:'school-template-2',segment:'school',name:'Modelo 2',description:'Aguardando referências.',status:'planned'},
      {key:'school-template-3',segment:'school',name:'Modelo 3',description:'Aguardando referências.',status:'planned'}
    ]
  }
};

export function templatesForSegment(segment: SegmentKey) {
  return segments[segment].templates;
}

export function getTemplate(segment: SegmentKey, templateKey: string) {
  return templatesForSegment(segment).find(template => template.key === templateKey) ?? null;
}
