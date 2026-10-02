'use server';
import {normalizeImagePosition} from '@/core/image-placement';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {
  readV2Content,
  saveV2Section,
  publicMediaUrl,
} from '@/core/onboarding-data';
import {
  institutionalCopy,
  institutionalBlocks,
  institutionalLists,
  institutionalRows,
  type InstitutionalListKey,
  institutionalImage,
} from '@/core/institutional-content';
const text = (form: FormData, key: string) =>
  String(form.get(key) || '').trim();
function picture(
  form: FormData,
  slot: string,
  current: unknown,
  allowed: boolean,
  projectId: string,
) {
  const raw = text(form, `uploadedMedia:${slot}`),
    remove = text(form, `removeMedia:${slot}`) === 'yes';
  if (!allowed) {
    if ((raw && raw !== 'null') || remove)
      throw new Error('Sem permissão para editar imagens.');
    return current || '';
  }
  if (remove) return '';
  let value = current;
  if (raw && raw !== 'null') {
    let uploaded: Record<string, unknown>;
    try {
      uploaded = JSON.parse(raw);
    } catch {
      throw new Error('Imagem inválida. Nada foi salvo.');
    }
    const path = String(uploaded?.path || '');
    if (
      !path.startsWith(`${projectId}/`) ||
      path.includes('..') ||
      uploaded.url !== publicMediaUrl(path)
    )
      throw new Error('Imagem incompatível com o projeto. Nada foi salvo.');
    value = uploaded;
  }
  const url = institutionalImage(value);
  if (!url) return '';
  const position = text(form, `mediaPosition:${slot}`),
    fit = text(form, `mediaFit:${slot}`),
    zoom = Number(text(form, `mediaZoom:${slot}`));
  return {
    ...(value && typeof value === 'object' ? value : {}),
    url,
    position: normalizeImagePosition(position),
    fit: ['cover', 'contain', 'fill'].includes(fit) ? fit : 'cover',
    zoom: Math.max(50, Math.min(200, zoom || 100)),
  };
}
export async function saveInstitutionalAction(form: FormData) {
  const slug = text(form, 'slug'),
    access = await resolveProjectAccess(slug);
  if (
    access.project.segment !== 'institutional' ||
    !can(access.role, 'editContent')
  )
    throw new Error('Sem permissão para editar este institucional.');
  const current = await readV2Content(access.project.id),
    content = {...current.content};
  for (const [key, fallback] of Object.entries(institutionalCopy)) {
    if (
      [
        'institutional_main_demo_notice',
        'institutional_main_close',
        'institutional_main_footer_brand',
        'institutional_main_footer_credit',
      ].includes(key)
    ) {
      content[key] = current.content[key] ?? fallback;
      continue;
    }
    if (!form.has(key))
      throw new Error('Formulário incompleto. Nada foi salvo.');
    content[key] = text(form, key).slice(0, 10000);
  }
  for (const key of [
    'institutional_history_intro',
    'institutional_current_period',
    'institutional_previous_period',
  ])
    content[key] = text(form, key).slice(0, 10000);
  for (const key of ['institutional_demo', 'institutional_show_photos']) {
    if (!['true', 'false'].includes(text(form, key)))
      throw new Error('Opção inválida. Nada foi salvo.');
    content[key] = text(form, key) === 'true';
  }
  for(const key of Object.keys(institutionalBlocks)){
    const field=`institutional_visible_${key}`;
    if(!form.has(field))continue; // Preserve existing visibility for older open editor forms.
    const value=text(form,field);
    if(!['true','false'].includes(value))throw new Error('Visibilidade inválida. Nada foi salvo.');
    content[field]=value==='true';
  }
  const managementBlocks=['current_board','current_members','previous_board','previous_members'];
  if(managementBlocks.every(key=>form.has(`institutional_visible_${key}`)))content.institutional_visible_gestao=managementBlocks.some(key=>content[`institutional_visible_${key}`]===true);
  const allowed = can(access.role, 'manageMedia');
  for (const key of Object.keys(institutionalLists) as InstitutionalListKey[]) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text(form, `section:${key}`));
    } catch {
      throw new Error('Lista inválida. Nada foi salvo.');
    }
    if (
      !Array.isArray(parsed) ||
      parsed.length > 100 ||
      parsed.some(
        (row) =>
          !row ||
          typeof row !== 'object' ||
          Array.isArray(row) ||
          !row.id ||
          !/^[a-zA-Z0-9_-]{1,100}$/.test(row.id),
      ) ||
      new Set(parsed.map((row) => row.id)).size !== parsed.length ||
      parsed.some((row) => row.id === 'todos')
    )
      throw new Error('Lista inválida ou acima de 100 itens. Nada foi salvo.');
    const old = institutionalRows(current.content[key], key);
    content[key] = institutionalRows(parsed, key).map((row, index) => {
      const before = old.find((item) => item.id === row.id);
      for (const field of ['image', 'photo'])
        if (field in institutionalLists[key].fields)
          row[field] = picture(
            form,
            `${key}-${row.id}-${field}`,
            before?.[field],
            allowed,
            access.project.id,
          );
      if (key === 'institutional_albums') {
        const input = parsed[index].photos;
        if (!Array.isArray(input) || input.length > 100)
          throw new Error('Álbum inválido. Nada foi salvo.');
        const oldPhotos = Array.isArray(before?.photos) ? before.photos : [];
        if (!allowed && JSON.stringify(input) !== JSON.stringify(oldPhotos))
          throw new Error('Sem permissão para editar fotos.');
        row.photos = input
          .map((photo: unknown, i: number) =>
            photo === '' &&
            !text(form, `uploadedMedia:${key}-${row.id}-photo-${i}`).replace(
              'null',
              '',
            )
              ? ''
              : picture(
                  form,
                  `${key}-${row.id}-photo-${i}`,
                  oldPhotos[i],
                  allowed,
                  access.project.id,
                ),
          )
          .filter(Boolean);
        row.count = before?.count || 0;
      }
      return row;
    });
  }
  const name = text(form, 'name').slice(0, 120);
  if (!name) throw new Error('Informe o nome da organização. Nada foi salvo.');
  const identity = {
      ...current.identity,
      name,
      browser_title: text(form, 'browser_title').slice(0, 80),
    },
    contact = {...current.contact};
  for (const key of [
    'whatsapp',
    'email',
    'address',
    'instagram',
    'pix',
    'pix_name',
  ])
    contact[key] = text(form, key).slice(0, 1000);
  contact.whatsapp = String(contact.whatsapp).replace(/\D/g, '').slice(0, 15);
  const media = {...current.media};
  if (allowed)
    media.hero = picture(
      form,
      'hero',
      current.media.hero,
      true,
      access.project.id,
    );
  // Reuse the existing draft writes and atomic publication flow.
  await saveV2Section(access.project.id, 'identity', identity);
  await saveV2Section(access.project.id, 'content', content);
  await saveV2Section(access.project.id, 'contact', contact);
  if (allowed) await saveV2Section(access.project.id, 'media', media);
  const base = `/dashboard/${encodeURIComponent(slug)}`;
  revalidatePath(`${base}/editor/institutional`);
  revalidatePath(`/preview/${encodeURIComponent(slug)}`);
  redirect(`${base}/editor/institutional?saved=1`);
}
