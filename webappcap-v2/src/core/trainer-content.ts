import type {CSSProperties} from 'react';
// Data shared by Personal Trainer templates; presentation copy is namespaced.
export const trainerLists={
 trainer_stats:{label:'Indicadores profissionais',fields:{value:'Valor',label:'Descrição'}},
 trainer_method:{label:'Etapas do método',fields:{title:'Título',description:'Descrição'}},
 trainer_results:{label:'Resultados / antes e depois',fields:{name:'Nome / identificação',goal:'Objetivo',result:'Resultado',detail:'Período e frequência',before:'Foto antes',after:'Foto depois'}},
 trainer_modes:{label:'Modalidades',fields:{title:'Título',audience:'Para quem é indicado (opcional)',description:'Descrição',features:'Benefícios (um por linha)'}},
 testimonials:{label:'Depoimentos',fields:{text:'Depoimento',name:'Nome',role:'Identificação'}},
 faq:{label:'Perguntas frequentes',fields:{question:'Pergunta',answer:'Resposta'}}
} as const;
export type TrainerListKey=keyof typeof trainerLists;
export type TrainerRow=Record<string,string>;
export const trainerCopy={
 hero_kicker:'Personal trainer · Presencial e online',
 hero_title:'Treino que cabe na rotina.',trainer_main_hero_emphasis:'Resultado',trainer_main_hero_end:'que cabe no espelho.',
 hero_text:'Método individual, acompanhamento de perto e evolução que você consegue medir semana a semana.',
 trainer_main_results_cta:'Ver resultados',trainer_main_method_kicker:'O método',trainer_main_method_title:'Simples de\nseguir. Difícil\nde parar.',
 trainer_main_results_kicker:'Antes e depois',trainer_main_results_title:'Resultado\nnão é promessa.',
 trainer_main_results_note:'Imagens ilustrativas, troque pelas fotos reais (com autorização do aluno). Resultados variam de pessoa para pessoa.',
 trainer_main_modes_kicker:'Modalidades',trainer_main_modes_title:'Escolha como\nquer treinar.',trainer_main_modes_cta:'Consultar valores →',
 trainer_main_faq_kicker:'Dúvidas',trainer_main_final_title:'Bora\ncomeçar?',
 trainer_main_nav_method:'Método',trainer_main_nav_results:'Resultados',trainer_main_nav_modes:'Modalidades',
 trainer_main_form_name:'Seu nome',trainer_main_form_phone:'WhatsApp',trainer_main_form_goal:'Objetivo',trainer_main_form_mode:'Modalidade',trainer_main_form_message:'Mensagem (opcional)',
 trainer_main_form_name_placeholder:'Como posso te chamar?',trainer_main_form_phone_placeholder:'(11) 99999-9999',trainer_main_form_message_placeholder:'Conte um pouco sobre sua rotina ou dúvidas',
 trainer_main_form_hint:'Ao enviar, você será levado ao WhatsApp com sua mensagem pronta.',trainer_main_agenda_kicker:'Agenda'
};
export const trainerStates={
 aberta:{pill:'Agenda aberta',title:'Horários disponíveis',short:'Garantir horário',btn:'Garantir meu horário',sub:'Há horários disponíveis. Entre em contato para combinar o melhor para você.',formTitle:'Peça seu horário',formBtn:'Enviar pedido pelo WhatsApp',msg:'Olá! Vi que a agenda está aberta e quero saber sobre os horários disponíveis.'},
 fechada:{pill:'Agenda fechada',title:'Sem horários no momento',short:'Saber mais',btn:'Entrar em contato',sub:'Entre em contato para saber mais e entrar na lista de espera.',formTitle:'Entre na lista de espera',formBtn:'Quero saber mais',msg:'Olá! Vi que a agenda está fechada e gostaria de saber mais e entrar na lista de espera.'}
};
export type TrainerState=keyof typeof trainerStates;
export const trainerExamples:Record<TrainerListKey,TrainerRow[]>={
 trainer_stats:[{value:'+180',label:'alunos atendidos'},{value:'9',label:'anos de experiência'},{value:'4,9★',label:'avaliação média'}],
 trainer_method:[{title:'Avaliação',description:'Conversa sobre objetivo, histórico e rotina, mais avaliação física para definir o ponto de partida.'},{title:'Plano sob medida',description:'Treino montado para você, com progressão clara e sem copiar planilha da internet.'},{title:'Acompanhamento',description:'Ajustes constantes, medição de resultados e apoio para manter a constância.'}],
 trainer_results:[{name:'Marina, 34',goal:'Emagrecimento',result:'−14 kg',detail:'6 meses · 3x por semana',before:'',after:''},{name:'Carlos, 41',goal:'Ganho de massa',result:'+6 kg de massa',detail:'8 meses · 4x por semana',before:'',after:''},{name:'Julia, 27',goal:'Condicionamento',result:'−9% de gordura',detail:'5 meses · 3x por semana',before:'',after:''}],
 trainer_modes:[{title:'Presencial',description:'Treino ao lado do personal, com correção em tempo real.',features:'Academia ou estúdio\nAvaliação inclusa\nAjustes a cada sessão'},{title:'Online',description:'Treine de onde estiver, com plano e acompanhamento à distância.',features:'Plano pelo app\nFeedback por vídeo\nSuporte no WhatsApp'},{title:'Em dupla',description:'Divida o treino com um amigo ou parceiro e mantenha a motivação.',features:'Até 2 pessoas\nMesmo horário\nPlano individualizado'}],
 testimonials:[{text:'Em 4 meses aprendi a treinar de verdade e parei de faltar.',name:'Marina',role:'aluna presencial'},{text:'O acompanhamento online é tão próximo que parece que ele está na sala.',name:'Diego',role:'aluno online'}],
 faq:[{question:'Preciso ter experiência?',answer:'Não. O plano parte do seu nível atual, seja iniciante ou já treinado.'},{question:'Como funciona a agenda?',answer:'Quando está aberta, você envia o formulário e combinamos o melhor horário pelo WhatsApp. Quando está fechada, entre em contato para saber mais e entrar na lista de espera.'},{question:'Em quanto tempo vejo resultado?',answer:'Depende do objetivo e da constância. Na avaliação eu explico o que esperar para o seu caso.'}]
};
export const trainerGoals=['Emagrecimento','Ganho de massa','Condicionamento','Saúde e mobilidade','Outro'];
export function trainerImage(value:unknown){const url=typeof value==='string'?value:value&&typeof value==='object'&&'url'in value?String(value.url||''):'';return /^(https?:\/\/|\/(?!\/))/.test(url)?url:''}
export function trainerRows(value:unknown,key:TrainerListKey):TrainerRow[]{
 if(!Array.isArray(value))return [];
 const fields=Object.keys(trainerLists[key].fields);
 return value.filter((item):item is Record<string,unknown>=>Boolean(item&&typeof item==='object'&&!Array.isArray(item))).slice(0,30).map(item=>{
  const row=Object.fromEntries(fields.map(field=>[field,field==='before'||field==='after'?trainerImage(item[field]):String(item[field]??'').slice(0,10000)]));
  if(key==='trainer_results')for(const side of ['before','after']){
   const picture=item[side]&&typeof item[side]==='object'?item[side] as Record<string,unknown>:{};
   row[`${side}_position`]=String(picture.position||item[`${side}_position`]||'center');
   row[`${side}_fit`]=String(picture.fit||item[`${side}_fit`]||'cover');
   row[`${side}_zoom`]=String(picture.zoom||item[`${side}_zoom`]||100);
  }
  return row;
 });
}
export function trainerData(content:Record<string,unknown>){
 const copy=Object.fromEntries(Object.entries(trainerCopy).map(([key,fallback])=>[key,content[key]===undefined?fallback:String(content[key]??'')])) as typeof trainerCopy;
 const agenda:TrainerState=content.trainer_agenda==='fechada'?'fechada':'aberta';
 const states=Object.fromEntries(Object.entries(trainerStates).map(([state,defaults])=>[state,Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,content[`trainer_main_${state}_${key}`]===undefined?fallback:String(content[`trainer_main_${state}_${key}`]??'')]))])) as typeof trainerStates;
 const lists=Object.fromEntries(Object.keys(trainerLists).map(key=>[key,trainerRows(content[key],key as TrainerListKey)])) as Record<TrainerListKey,TrainerRow[]>;
 return {copy,agenda,states,lists,goals:String(content.trainer_goals||trainerGoals.join('\n')).split('\n').map(value=>value.trim()).filter(Boolean).slice(0,30)};
}
export function trainerDefaults(name:string){return {identity:{name},content:{...trainerCopy,trainer_agenda:'aberta',trainer_cref:'',trainer_goals:trainerGoals.join('\n'),...structuredClone(trainerExamples)},appearance:{preview_template_key:'personal-trainer-main-1'},contact:{whatsapp:''}}}

export function trainerImageStyle(value:unknown):CSSProperties{const row=value&&typeof value==='object'?value as Record<string,unknown>:{};return {objectPosition:String(row.position||'center'),objectFit:['cover','contain','fill'].includes(String(row.fit))?row.fit as CSSProperties['objectFit']:'cover',transform:`scale(${Math.max(50,Math.min(200,Number(row.zoom)||100))/100})`}}
