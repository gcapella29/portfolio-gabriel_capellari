import type { SegmentKey } from '@/core/domain';

export type TemplateContract={
 key:string;segment:SegmentKey;version:number;
 requiredContent:string[];optionalContent:string[];
 media:{hero:boolean;galleryMax:number};
 appearance:{accent:boolean;headingFont:boolean;bodyFont:boolean;alignment:boolean;density:boolean;scale:boolean};
 notes?:string[];
};

export const templateContracts:Record<string,TemplateContract>={
 'portfolio-legacy-1':{key:'portfolio-legacy-1',segment:'portfolio',version:1,requiredContent:['identity.name','content.hero_title'],optionalContent:[],media:{hero:true,galleryMax:12},appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}},
 'portfolio-native-1':{key:'portfolio-native-1',segment:'portfolio',version:1,requiredContent:['identity.name','content.hero_title'],optionalContent:[],media:{hero:true,galleryMax:12},appearance:{accent:true,headingFont:false,bodyFont:false,alignment:false,density:false,scale:false}}
};

export const contractForTemplate=(key:string|null|undefined)=>key?templateContracts[key]??null:null;
