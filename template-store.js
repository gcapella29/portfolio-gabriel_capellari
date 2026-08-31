(() => {
  const clone=v=>structuredClone(v);
  let cache=null, source='static';
  const canonicalType=value=>({journalist:'editorial',editorial:'editorial',portfolio:'editorial',other:'editorial',personal_trainer:'personal_trainer',fitness:'personal_trainer',educator:'educator',language_teacher:'educator',local:'local',local_business:'local'})[String(value||'').trim().toLowerCase()]||String(value||'').trim().toLowerCase();
  function normalize(row){
    if(!row)return null;
    return {
      key:row.key,
      name:row.name,
      site_type:canonicalType(row.site_type),
      description:row.description||'',
      visual:row.visual||'',
      color:row.color||'#fff',
      chips:Array.isArray(row.chips)?row.chips:[],
      layout:Array.isArray(row.layout)?row.layout:[],
      theme:row.theme&&typeof row.theme==='object'?row.theme:{},
      version:Number(row.version)||1,
      is_active:row.is_active!==false
    };
  }
  async function queryDatabase(sb){
    const q=await sb.from('platform_templates').select('key,name,site_type,description,visual,color,chips,layout,theme,version,is_active').eq('is_active',true).order('key');
    if(q.error)throw q.error;
    return q.data||[];
  }
  async function load(sb,{refresh=false}={}){
    if(cache&&!refresh)return clone(cache);
    const fallback=Object.fromEntries(Object.entries(window.WebAppCapTemplateRegistry?.all?.()||{}).map(([key,t])=>[key,normalize(t)]));
    if(!sb){cache=fallback;source='static';return clone(cache)}
    try{
      const rows=await queryDatabase(sb);
      if(!rows.length){cache=fallback;source='static-empty-db';return clone(cache)}
      cache=Object.fromEntries(rows.map(r=>{const t=normalize(r);return[t.key,t]}));
      source='database';
      return clone(cache);
    }catch(e){
      console.warn('[WebAppCap TemplateStore] banco indisponível; usando registry estático.',e.message||e);
      cache=fallback;source='static-fallback';return clone(cache);
    }
  }
  async function seedIfEmpty(sb,userId){
    try{
      const existing=await queryDatabase(sb);
      if(existing.length){await load(sb,{refresh:true});return{seeded:false,source:'database',count:existing.length}}
      const rows=Object.values(window.WebAppCapTemplateRegistry.all()).map(t=>({...t,description:t.description||'',version:Number(t.version)||1,is_active:true,updated_by:userId}));
      const q=await sb.from('platform_templates').upsert(rows,{onConflict:'key'}).select('key');
      if(q.error)throw q.error;
      await load(sb,{refresh:true});
      return{seeded:true,source,count:q.data?.length||rows.length};
    }catch(e){return{seeded:false,source,error:e}}
  }
  async function save(sb,template,userId){
    const normalized=normalize(template);
    const row={...normalized,site_type:template.site_type,updated_at:new Date().toISOString(),updated_by:userId};
    const q=await sb.from('platform_templates').upsert(row,{onConflict:'key'}).select().single();
    if(q.error)throw q.error;await load(sb,{refresh:true});return normalize(q.data);
  }
  async function get(sb,key){const all=await load(sb);return all[key]?clone(all[key]):null}
  async function bySiteType(sb,type){const all=await load(sb),wanted=canonicalType(type);return clone(Object.values(all).find(t=>canonicalType(t.site_type)===wanted)||null)}
  async function compatible(sb,type){const all=await load(sb),wanted=canonicalType(type);return Object.fromEntries(Object.entries(all).filter(([,t])=>canonicalType(t.site_type)===wanted).map(([k,t])=>[k,clone(t)]))}
  async function keys(sb){return Object.keys(await load(sb))}
  window.WebAppCapTemplateStore=Object.freeze({load,get,bySiteType,compatible,keys,save,seedIfEmpty,canonicalType,source:()=>source});
})();