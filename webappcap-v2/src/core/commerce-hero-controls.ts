export type CommerceHeroControls=Record<string,string>;

const defaults:CommerceHeroControls={
 hero_text_x_desktop:'4',hero_text_y_desktop:'70',hero_text_width_desktop:'58',hero_text_align_desktop:'left',
 hero_title_size_desktop:'76',hero_title_bold_desktop:'true',hero_title_italic_desktop:'false',
 hero_descriptor_size_desktop:'16',hero_descriptor_bold_desktop:'false',hero_descriptor_italic_desktop:'false',
 hero_slogan_size_desktop:'30',hero_slogan_bold_desktop:'false',hero_slogan_italic_desktop:'false',
 hero_image_x_desktop:'50',hero_image_y_desktop:'50',hero_image_zoom_desktop:'100',
 hero_text_x_mobile:'5',hero_text_y_mobile:'69',hero_text_width_mobile:'90',hero_text_align_mobile:'left',
 hero_title_size_mobile:'56',hero_title_bold_mobile:'true',hero_title_italic_mobile:'false',
 hero_descriptor_size_mobile:'14',hero_descriptor_bold_mobile:'false',hero_descriptor_italic_mobile:'false',
 hero_slogan_size_mobile:'28',hero_slogan_bold_mobile:'false',hero_slogan_italic_mobile:'false',
 hero_image_x_mobile:'50',hero_image_y_mobile:'50',hero_image_zoom_mobile:'100'
};

export const commerceHeroDefaults=()=>({...defaults});

export function commerceHeroControls(appearance:Record<string,unknown>):CommerceHeroControls{
 return Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,String(appearance[key]??'').trim()||fallback]));
}

const bounds:Record<string,[number,number]>={
 hero_text_x:[0,75],hero_text_y:[20,90],hero_text_width:[20,96],
 hero_title_size:[24,120],hero_descriptor_size:[10,36],hero_slogan_size:[14,54],
 hero_image_x:[0,100],hero_image_y:[0,100],hero_image_zoom:[100,180]
};

export function commerceHeroPatch(formData:FormData):CommerceHeroControls{
 const patch:CommerceHeroControls={};
 for(const device of ['desktop','mobile'] as const){
  const align=String(formData.get(`hero_text_align_${device}`)||defaults[`hero_text_align_${device}`]);
  patch[`hero_text_align_${device}`]=['left','center','right'].includes(align)?align:'left';
  for(const base of Object.keys(bounds)){
   const key=`${base}_${device}`,[min,max]=bounds[base],fallback=Number(defaults[key]);
   const parsed=Number(String(formData.get(key)||fallback));
   patch[key]=String(Math.round(Math.min(max,Math.max(min,Number.isFinite(parsed)?parsed:fallback))));
  }
  for(const base of ['hero_title_bold','hero_title_italic','hero_descriptor_bold','hero_descriptor_italic','hero_slogan_bold','hero_slogan_italic']){
   const key=`${base}_${device}`;patch[key]=formData.has(key)?'true':'false';
  }
 }
 return patch;
}
