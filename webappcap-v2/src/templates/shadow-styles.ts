/** Keep Shadow DOM content hidden until every layout stylesheet has loaded. */
export function protectShadowStyles(target:HTMLElement,sheets:HTMLLinkElement[]){
 const doc=target.ownerDocument;
 const status=doc.createElement('div');
 status.setAttribute('role','status');
 status.style.cssText='min-height:100vh;display:grid;place-content:center;gap:16px;padding:24px;box-sizing:border-box;font-family:system-ui,sans-serif;text-align:center';
 status.textContent='Carregando site…';
 // This guard cannot depend on the external CSS it is protecting.
 target.style.display='none';
 target.inert=true;
 target.before(status);
 const pending=new Set(sheets);
 let disposed=false;
 const failed=()=>{
  if(disposed||!pending.size)return;
  status.textContent='Não foi possível carregar o visual do site.';
  const retry=doc.createElement('button');
  retry.type='button';retry.textContent='Recarregar';
  retry.onclick=()=>doc.defaultView?.location.reload();
  status.append(retry);
 };
 const reveal=()=>{
  if(disposed||pending.size)return;
  clearTimeout(timeout);
  target.style.removeProperty('display');target.inert=false;status.remove();
 };
 const loaded=(event:Event)=>{pending.delete(event.currentTarget as HTMLLinkElement);reveal()};
 const timeout=setTimeout(failed,12000);
 for(const sheet of sheets){
  sheet.addEventListener('load',loaded);
  sheet.addEventListener('error',failed);
  if(sheet.sheet)pending.delete(sheet);
 }
 reveal();
 return()=>{
  disposed=true;clearTimeout(timeout);status.remove();
  for(const sheet of sheets){sheet.removeEventListener('load',loaded);sheet.removeEventListener('error',failed)}
 };
}
