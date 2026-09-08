import type { SegmentKey } from './domain';

export type RepeatableField={key:string;label:string;placeholder?:string};
export type RepeatableSection={key:string;label:string;description:string;fields:RepeatableField[];min?:number;max?:number};

export const universalProfile={
 identity:['name','tagline','description','location'],
 business:['hero_title','hero_text','primary_offer','proof','about'],
 contact:['whatsapp','phone','email','instagram','address','hours'],
 media:['logo','hero','gallery']
};

const commonSections:RepeatableSection[]=[
 {key:'services',label:'Serviços / soluções',description:'O que você oferece.',fields:[{key:'title',label:'Título'},{key:'description',label:'Descrição'}],max:24},
 {key:'differentials',label:'Diferenciais',description:'Motivos para escolher você ou sua organização.',fields:[{key:'title',label:'Diferencial'},{key:'description',label:'Detalhe'}],max:20},
 {key:'testimonials',label:'Depoimentos',description:'Provas sociais que podem ser usadas por qualquer modelo compatível.',fields:[{key:'name',label:'Nome'},{key:'role',label:'Identificação'},{key:'text',label:'Depoimento'}],max:30},
 {key:'faq',label:'Perguntas frequentes',description:'Dúvidas e respostas.',fields:[{key:'question',label:'Pergunta'},{key:'answer',label:'Resposta'}],max:30},
 {key:'gallery_items',label:'Galeria',description:'Legendas e contexto para imagens.',fields:[{key:'title',label:'Título'},{key:'description',label:'Legenda'}],max:30}
];

const segmentOnly:Partial<Record<SegmentKey,RepeatableSection[]>>={
 'personal-trainer':[
  {key:'method',label:'Método / etapas',description:'Etapas do acompanhamento ou processo.',fields:[{key:'title',label:'Etapa'},{key:'description',label:'Descrição'}],max:16},
  {key:'credentials',label:'Credenciais',description:'Formações, registros e certificações.',fields:[{key:'title',label:'Credencial'},{key:'description',label:'Instituição / detalhe'}],max:20},
  {key:'results',label:'Resultados',description:'Resultados, casos e conquistas.',fields:[{key:'title',label:'Resultado'},{key:'description',label:'Contexto'}],max:20}
 ],
 portfolio:[{key:'projects',label:'Projetos / trabalhos',description:'Trabalhos que podem ser apresentados em diferentes layouts.',fields:[{key:'title',label:'Projeto'},{key:'description',label:'Descrição'},{key:'url',label:'Link'}],max:40}],
 'food-business':[{key:'products',label:'Produtos / destaques',description:'Itens, pratos ou produtos principais.',fields:[{key:'title',label:'Nome'},{key:'description',label:'Descrição'},{key:'price',label:'Preço'}],max:50}],
 school:[{key:'courses',label:'Cursos / programas',description:'Cursos, turmas ou programas oferecidos.',fields:[{key:'title',label:'Nome'},{key:'description',label:'Descrição'}],max:40}]
};

export function sectionsForSegment(segment:SegmentKey){return [...commonSections,...(segmentOnly[segment]||[])];}
