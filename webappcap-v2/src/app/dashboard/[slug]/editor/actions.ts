'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content,saveV2Section} from '@/core/onboarding-data';
import {getTemplate} from '@/core/segments';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const editorPath=(slug:string)=>`/dashboard/${encodeURIComponent(slug)}/editor`;

export async function saveEditorTemplateAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para trocar o modelo.');
 const templateKey=text(formData,'templateKey'),template=getTemplate(access.project.segment,templateKey);
 if(!template||template.status!=='ready')throw new Error('Esse modelo não está disponível para este projeto.');
 const current=await readV2Content(access.project.id);
 await saveV2Section(access.project.id,'appearance',{...current.appearance,preview_template_key:templateKey});
 revalidatePath(editorPath(slug));revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(`${editorPath(slug)}?template=${encodeURIComponent(templateKey)}`);
}

export async function saveEditorAppearanceAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para editar aparência.');
 const current=await readV2Content(access.project.id);
 await saveV2Section(access.project.id,'appearance',{...current.appearance,accent:text(formData,'accent')||'#d9ff43',heading_font:text(formData,'heading_font')||'Montserrat',body_font:text(formData,'body_font')||'DM Sans',scale:text(formData,'scale')||'normal',alignment:text(formData,'alignment')||'left',density:text(formData,'density')||'normal',support_font:text(formData,'support_font')||text(formData,'body_font')||'DM Sans',support_size:text(formData,'support_size')||'14',support_bold:formData.has('support_bold')?'true':'false',support_italic:formData.has('support_italic')?'true':'false',button_font:text(formData,'button_font')||text(formData,'body_font')||'DM Sans',button_size:text(formData,'button_size')||'12',button_bold:formData.has('button_bold')?'true':'false',button_italic:formData.has('button_italic')?'true':'false'});
 revalidatePath(editorPath(slug));revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(`${editorPath(slug)}?savedAppearance=1#appearance`);
}
