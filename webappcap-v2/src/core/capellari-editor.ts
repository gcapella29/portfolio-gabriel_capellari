import schemaJson from './capellari-editor-schema.json';
import type {V2Content} from './onboarding-data';

type Row=Record<string,unknown>;
export type EditorField={id:string;group:string;label:string;path:string[];type:string;default:unknown;legacyPath?:string[];fallbackPath?:string[];itemFields?:{key:string;label:string;type:string}[];maxItems?:number;min?:number;max?:number};
export const capellariEditorSchema=schemaJson as {version:string;copy:{id:string;pt:string;en:string;group:string;variant:string;legacy?:{pt:string;en:string}}[];fields:EditorField[];groups:Record<string,string>};
const copyByKey=new Map(capellariEditorSchema.copy.map(item=>[item.variant+':'+item.id,item]));
function readPath(value:unknown,path:string[]):unknown{for(const key of path){if(!value||typeof value!=='object')return undefined;value=(value as Row)[key];}return value;}
export function capellariCopy(data:V2Content,id:string,language:'pt'|'en',variant='concept'){
  const item=copyByKey.get(variant+':'+id);if(!item)return '';
  const overrides=data.content[variant==='concept'?'portfolio_concept_copy':'portfolio_classic_copy'];
  if(overrides&&typeof overrides==='object'&&Object.prototype.hasOwnProperty.call(overrides,id+'_'+language))return String((overrides as Row)[id+'_'+language]??'');
  const legacy=item.legacy?.[language];
  if(legacy&&String(data.content[legacy]??'').trim())return String(data.content[legacy]);
  return item[language];
}
export function capellariEditorValue(data:V2Content,field:EditorField):unknown{
  const stored=readPath(data,field.path);
  if(stored!==undefined)return stored;
  if(field.legacyPath){const legacy=readPath(data,field.legacyPath);if(typeof legacy==='string'&&legacy.trim())return legacy;}
  if(field.fallbackPath){const fallback=readPath(data,field.fallbackPath);if(fallback!==undefined)return fallback;}
  return field.default;
}
export function capellariRows(data:V2Content,key:string):Row[]{
  const field=capellariEditorSchema.fields.find(item=>item.path.length===2&&item.path[0]==='content'&&item.path[1]===key&&item.type==='list');
  const value=field?capellariEditorValue(data,field):data.content[key];
  return Array.isArray(value)?value.filter(item=>item&&typeof item==='object') as Row[]:[];
}
