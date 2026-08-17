(() => {
  const clone=v=>structuredClone(v);
  let cache=null, source='static';
  function normalize(row){
    if(!row)return null;
    return {
      key:row.key,
      name:row.name,
      site_type:row.site_type,
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
  async function load(sb,{refresh=false}={}){
    if(cache&&!refresh)return clone(cache);
    const fallback=window.WebAppCapTemplateRegistry?.all?.()||{};
    if(!sb){cache=fallback;source='static';return clone(cache)}
    try{
      const q=await sb.from('platform_templates').select('key,name,site_type,description,visual,color,chips,layout,theme,version,is_active').eq('is_active',true).order('key');
      if(q.error)throw q.error;
      if(!q.data?.length){cache=fallback;source='static-empty-db';return clone(cache)}
      cache=Object.fromEntries(q.data.map(r=>{const t=normalize(r);return[t.key,t]}));
      source='database';
      return clone(cache);
    }catch(e){
      console.warn('[WebAppCap TemplateStore] banco indisponível; usando registry estático.',e.message||e);
      cache=fallback;source='static-fallback';return clone(cache);
    }
  }
  async function seedIfEmpty(sb,userId){
    const current=await load(sb,{refresh:true});
    if(source==='database')return{seeded:false,source};
    try{
      const rows=Object.values(window.WebAppCapTemplateRegistry.all()).map(t=>({...t,description:t.description||'',version:1,is_active:true,updated_by:userId}));
      const q=await sb.from('platform_templates').upsert(rows,{onConflict:'key'});
      if(q.error)throw q.error;
      await load(sb,{refresh:true});
      return{seeded:true,source};
    }catch(e){return{seeded:false,source,error:e}}
  }
  async function save(sb,template,userId){
    const row={...normalize(template),updated_at:new Date().toISOString(),updated_by:userId};
    const q=await sb.from('platform_templates').upsert(row,{onConflict:'key'}).select().single();
    if(q.error)throw q.error;await load(sb,{refresh:true});return normalize(q.data);
  }
  async function get(sb,key){const all=await load(sb);return all[key]?clone(all[key]):null}
  async function bySiteType(sb,type){const all=await load(sb);return clone(Object.values(all).find(t=>t.site_type===type)||null)}
  async function keys(sb){return Object.keys(await load(sb))}
  window.WebAppCapTemplateStore=Object.freeze({load,get,bySiteType,keys,save,seedIfEmpty,source:()=>source});
})();