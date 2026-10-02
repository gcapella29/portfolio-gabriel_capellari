import type { SegmentKey } from '@/core/domain';

export type TemplateContract={
 key:string;segment:SegmentKey;version:number;
 requiredContent:string[];optionalContent:string[];
 media:{hero:boolean;galleryMax:number};
 appearance:{accent:boolean;headingFont:boolean;bodyFont:boolean;alignment:boolean;density:boolean;scale:boolean};
 notes?:string[];
};

export const templateContracts:Record<string,TemplateContract>={
 'institutional-main-1':{key:'institutional-main-1',segment:'institutional',version:1,requiredContent:['identity.name','content.hero_title','contact.whatsapp'],optionalContent:['content.institutional_albums','contact.pix'],media:{hero:false,galleryMax:0},appearance:{accent:false,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false},notes:['CSS e fontes preservados da referência HTML.','Contato abre WhatsApp; Pix copia a chave, sem processar pagamentos.']},
 'personal-trainer-main-1':{key:'personal-trainer-main-1',segment:'personal-trainer',version:1,requiredContent:['identity.name','content.hero_title','contact.whatsapp'],optionalContent:['content.trainer_cref','content.trainer_results'],media:{hero:true,galleryMax:0},appearance:{accent:false,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false},notes:['Preservar CSS e fontes da referência React.','Agenda indica disponibilidade; formulário prepara mensagem para WhatsApp.']},
 'portfolio-legacy-1':{key:'portfolio-legacy-1',segment:'portfolio',version:1,requiredContent:['identity.name','content.hero_title'],optionalContent:[],media:{hero:true,galleryMax:12},appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}},
 'portfolio-native-1':{key:'portfolio-native-1',segment:'portfolio',version:1,requiredContent:['identity.name','content.hero_title'],optionalContent:[],media:{hero:true,galleryMax:12},appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}}
};

export const contractForTemplate=(key:string|null|undefined)=>key?templateContracts[key]??null:null;
