import {renderSnapshotPayload,type SnapshotPayload} from './snapshot-preview';

const FILE_ID_PATTERN=/^[A-Za-z0-9_-]{20,100}$/;
const TOKEN_PATTERN=/^[a-f0-9]{32}$/i;

type DraftPayload=SnapshotPayload&{
  mode?:string;
  preview?:{
    token?:string;
    project_id?:string;
    slug?:string;
    draft_version?:number;
    created_at?:string;
    expires_at?:string;
  };
};

export async function readDraftPreview(fileId:string,token:string){
  if(!FILE_ID_PATTERN.test(fileId)||!TOKEN_PATTERN.test(token))return null;

  const url=`https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;

  let payload:DraftPayload;

  try{
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)return null;

    const raw=await response.text();
    if(!raw.trim().startsWith('{'))return null;

    payload=JSON.parse(raw) as DraftPayload;
  }catch{
    return null;
  }

  if(payload.mode!=='draft')return null;
  if(payload.preview?.token!==token)return null;

  const expiresAt=Date.parse(String(payload.preview?.expires_at||''));
  if(!Number.isFinite(expiresAt)||expiresAt<=Date.now())return null;

  const rendered=renderSnapshotPayload(payload);
  if(!rendered)return null;

  return {
    ...rendered,
    preview:payload.preview||null
  };
}
