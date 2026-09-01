(() => {
  const clone=v=>structuredClone(v);
  let cache=null, source='static';
  const canonicalType=value=>({journalist:'editorial',editorial:'editorial',portfolio:'editorial',other:'editorial',personal_trainer:'personal_trainer',fitness:'personal_trainer',educator:'school',language_teacher:'school',school:'school',local:'food_business',local_business:'food_business',food_business:'food_business',food:'food_business'})[String(value||'').trim().toLowerCase()]||String(value||'').trim().toLowerCase();
  const registry=()=>window.WebAppCapTemplateRegistry?.all?.()||{};
  const allowedKeys=()=>new Set(Object.keys(registry()));
  function normalize(row){
    if(!row)return null;
    const base=registry()[row.key]||{};
    return {
      key:row.key,
      name:row.name||base.name||row.key,
      site_type:canonicalType(row.site_type||base.site_type),
      description:row.description||base.description||'',
      visual:row.visual||base.visual||'',
      color:row.color||base.color||'#fff',
      chips:Array.isArray(row.chips)?row.chips:(base.chips||[]),
      layout:Array.isArray(row.layout)?row.layout:(base.layout||[]),
      theme:row.theme&&typeof row.theme==='object'?row.theme:(base.theme||{}),
      version:Number(row.version)||Number(base.version)||1,
      is_active:row.is_active!==false,
      status:base.status||row.status||'ready'
    };
  }
  async function queryDatabase(sb){
    const q=await sb.from('platform_templates').select('key,name,site_type,description,visual,color,chips,layout,theme,version,is_active').eq('is_active',true).order('key');
    if(q.error)throw q.error;
    return (q.data||[]).filter(r=>allowedKeys().has(r.key));
  }
  function staticTemplates(){return Object.fromEntries(Object.entries(registry()).map(([key,t])=>[key,normalize(t)]))}
  async function load(sb,{refresh=false}={}){
    if(cache&&!refresh)return clone(cache);
    const fallback=staticTemplates();
    if(!sb){cache=fallback;source='static';return clone(cache)}
    try{
      const rows=await queryDatabase(sb),db=Object.fromEntries(rows.map(r=>{const t=normalize(r);return[t.key,t]}));
      cache={...fallback,...db};
      source=rows.length?'database+registry':'static-empty-db';
      return clone(cache);
    }catch(e){
      console.warn('[WebAppCap TemplateStore] banco indisponível; usando registry estático.',e.message||e);
      cache=fallback;source='static-fallback';return clone(cache);
    }
  }
  async function seedIfEmpty(sb,userId){
    try{
      const existing=await queryDatabase(sb);
      const missing=Object.values(registry()).filter(t=>!existing.some(x=>x.key===t.key));
      if(!missing.length){await load(sb,{refresh:true});return{seeded:false,source:'database',count:existing.length}}
      const rows=missing.map(t=>({...t,description:t.description||'',version:Number(t.version)||1,is_active:true,updated_by:userId}));
      const q=await sb.from('platform_templates').upsert(rows,{onConflict:'key'}).select('key');
      if(q.error)throw q.error;
      await load(sb,{refresh:true});
      return{seeded:true,source,count:q.data?.length||rows.length};
    }catch(e){return{seeded:false,source,error:e}}
  }
  async function save(sb,template,userId){
    if(!allowedKeys().has(template?.key))throw new Error('Template fora do catálogo ativo.');
    const normalized=normalize(template);
    const row={...normalized,site_type:template.site_type,updated_at:new Date().toISOString(),updated_by:userId};
    delete row.status;
    const q=await sb.from('platform_templates').upsert(row,{onConflict:'key'}).select().single();
    if(q.error)throw q.error;await load(sb,{refresh:true});return normalize(q.data);
  }
  async function get(sb,key){const all=await load(sb);return all[key]?clone(all[key]):null}
  async function bySiteType(sb,type){const all=await load(sb),wanted=canonicalType(type);return clone(Object.values(all).find(t=>canonicalType(t.site_type)===wanted)||null)}
  async function compatible(sb,type){const all=await load(sb),wanted=canonicalType(type);return Object.fromEntries(Object.entries(all).filter(([,t])=>canonicalType(t.site_type)===wanted).map(([k,t])=>[k,clone(t)]))}
  async function keys(sb){return Object.keys(await load(sb))}
  window.WebAppCapTemplateStore=Object.freeze({load,get,bySiteType,compatible,keys,save,seedIfEmpty,canonicalType,source:()=>source});
})();