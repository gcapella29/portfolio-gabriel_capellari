/** Fixed image slots use their site ratio; fluid heroes use a labelled desktop reference. */
export function imageEditorFrame(template:string,slot:string){
 const common={previewMaxWidth:420};
 if(template==='institutional-main-1'&&(slot==='project'||slot==='campaign'))return {...common,previewAspectRatio:'16 / 10'};
 if(slot==='hero'||slot==='bakery_hero'||slot==='sales_hero'){
  if(template==='institutional-main-1')return {...common,previewAspectRatio:'1440 / 720'};
  if(template==='personal-trainer-main-1')return {...common,previewAspectRatio:'4 / 5'};
  if(template==='commerce-modern-1')return {...common,previewAspectRatio:'1160 / 560'};
  if(template==='commerce-main-1')return {...common,previewAspectRatio:'1440 / 360'};
  if(template==='commerce-bakery-1')return {...common,previewAspectRatio:'1440 / 612'};
  if(template==='commerce-sales-1')return {...common,previewAspectRatio:'1120 / 410'};
  return {...common,previewAspectRatio:'16 / 9'};
 }
 if(slot==='product'&&template==='commerce-main-1')return {...common,previewAspectRatio:'1.18 / 1'};
 if(slot==='product'&&template==='commerce-sales-1')return {...common,previewAspectRatio:'16 / 10'};
 if(slot==='about'&&template.startsWith('portfolio'))return {...common,previewAspectRatio:'4 / 5'};
 if(slot==='contact'&&template.startsWith('portfolio'))return {...common,previewAspectRatio:'16 / 10'};
 if(slot==='before'||slot==='after')return {...common,previewAspectRatio:'4 / 5'};
 return {...common,previewAspectRatio:'1 / 1'};
}
