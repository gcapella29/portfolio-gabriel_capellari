import type { SegmentKey } from '@/core/domain';

export type TemplateContract={
 key:string;segment:SegmentKey;version:number;
 requiredContent:string[];optionalContent:string[];
 media:{hero:boolean;galleryMax:number};
 appearance:{accent:boolean;headingFont:boolean;bodyFont:boolean;alignment:boolean;density:boolean;scale:boolean};
 notes?:string[];
};

const trainerBase={
 segment:'personal-trainer' as const,version:1,
 requiredContent:['identity.name','content.hero_title'],
 optionalContent:['identity.location','identity.description','content.trainer_specialty','content.trainer_cref','content.hero_text','content.primary_offer','content.proof','content.trainer_services','content.trainer_method','content.trainer_results_title','content.about','content.trainer_credentials','content.trainer_schedule_title','content.trainer_schedule_text','contact.whatsapp','contact.instagram'],
 media:{hero:true,galleryMax:5}
};

export const templateContracts:Record<string,TemplateContract>={
 'trainer-performance-1':{...trainerBase,key:'trainer-performance-1',appearance:{accent:true,headingFont:true,bodyFont:true,alignment:true,density:true,scale:true}},
 'trainer-template-2':{...trainerBase,key:'trainer-template-2',media:{hero:true,galleryMax:4},appearance:{accent:false,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false},notes:['Editorial candidate: visual identity is template-owned; CMS content stays shared.']},
 'trainer-template-3':{...trainerBase,key:'trainer-template-3',appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}},
 'portfolio-native-1':{key:'portfolio-native-1',segment:'portfolio',version:1,requiredContent:['identity.name','content.hero_title'],optionalContent:[],media:{hero:true,galleryMax:12},appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}}
};

export const contractForTemplate=(key:string|null|undefined)=>key?templateContracts[key]??null:null;
