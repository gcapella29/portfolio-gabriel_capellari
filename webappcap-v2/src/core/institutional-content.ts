import {imageMediaStyle} from './image-placement.ts';
import copyDefaults from './institutional-copy.json' with {type: 'json'};
import examples from './institutional-examples.json' with {type: 'json'};
import type {CSSProperties} from 'react';
export const institutionalCopy = copyDefaults;
export const institutionalLists = {
  institutional_projects: {
    label: 'Projetos realizados',
    fields: {
      title: 'Título',
      date: 'Data / período',
      cat: 'Categoria',
      text: 'Descrição',
      impact: 'Impacto',
      image: 'Foto',
    },
  },
  institutional_donations: {
    label: 'Doações registradas',
    fields: {
      date: 'Data',
      title: 'Título',
      to: 'Beneficiários',
      qty: 'Quantidade entregue',
    },
  },
  institutional_campaigns: {
    label: 'Projetos em andamento',
    fields: {
      date: 'Data',
      time: 'Horário',
      location: 'Local',
      title: 'Título',
      text: 'Descrição',
      goal: 'Meta (0 para ocultar)',
      raised: 'Arrecadado',
      unit: 'Unidade / complemento',
      image: 'Foto',
    },
  },
  institutional_timeline: {
    label: 'Linha do tempo',
    fields: {year: 'Ano', title: 'Título', text: 'Descrição'},
  },
  institutional_values: {
    label: 'Valores',
    fields: {t: 'Título', d: 'Descrição'},
  },
  institutional_current_board: {
    label: 'Diretoria atual',
    fields: {
      name: 'Nome',
      role: 'Cargo',
      photo: 'Foto',
      instagram: 'Instagram (URL ou @usuário)',
    },
  },
  institutional_current_members: {
    label: 'Membros atuais',
    fields: {
      name: 'Nome',
      role: 'Cargo / função (opcional)',
      photo: 'Foto',
      instagram: 'Instagram (URL ou @usuário)',
    },
  },
  institutional_previous_board: {
    label: 'Diretoria anterior',
    fields: {
      name: 'Nome',
      role: 'Cargo',
      photo: 'Foto',
      instagram: 'Instagram (URL ou @usuário)',
    },
  },
  institutional_previous_members: {
    label: 'Membros anteriores',
    fields: {
      name: 'Nome',
      role: 'Cargo / função (opcional)',
      photo: 'Foto',
      instagram: 'Instagram (URL ou @usuário)',
    },
  },
  institutional_albums: {
    label: 'Álbuns de fotos',
    fields: {title: 'Título', date: 'Data / período'},
  },
};
export type InstitutionalListKey = keyof typeof institutionalLists;
export type InstitutionalRow = {id: string; [key: string]: unknown};
export function institutionalUrl(value: unknown) {
  const url = String(value ?? '').trim();
  return /^(https?:\/\/|\/(?!\/))[^\s\\]+$/i.test(url) ? url : '';
}
export function institutionalImage(value: unknown) {
  return institutionalUrl(
    value && typeof value === 'object'
      ? 'url' in value
        ? value.url
        : ''
      : value,
  );
}
export function institutionalImageStyle(value:unknown):CSSProperties{return imageMediaStyle(value)}
export function institutionalRows(
  value: unknown,
  key: InstitutionalListKey,
): InstitutionalRow[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .slice(0, 100)
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item, index) => {
      let id = String(item.id || `${key}-${index}`).slice(0, 100);
      if (!/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id) || id === 'todos')
        id = `${key}-${index}`;
      while (seen.has(id)) id += '-item';
      seen.add(id);
      const row: InstitutionalRow = {id};
      for (const field of Object.keys(institutionalLists[key].fields))
        row[field] =
          field === 'photo' || field === 'image'
            ? institutionalImage(item[field])
              ? item[field]
              : ''
            : String(key === 'institutional_campaigns' && field === 'date' && item.date === undefined ? [item.day,item.month].filter(Boolean).join(' ') : item[field] ?? '').slice(0, 10000);
      if (key === 'institutional_albums') {
        row.photos = Array.isArray(item.photos)
          ? item.photos
              .slice(0, 100)
              .filter((photo: unknown) => institutionalImage(photo))
          : [];
        row.count = Math.max(
          0,
          Math.min(30, Math.floor(Number(item.count) || 0)),
        );
      }
      return row;
    });
}
export function campaignProgress(row: InstitutionalRow) {
  const finite = (value: unknown) =>
    Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  const goal = finite(row.goal),
    raised = finite(row.raised);
  return {
    goal,
    raised,
    value: Math.min(goal, raised),
    percent: goal ? Math.min(100, (raised / goal) * 100) : 0,
  };
}
export const institutionalBlocks = {hero:'Hero / capa',stats:'Números do hero',projetos:'Projetos',doacoes:'Doações',campanhas:'Projetos em andamento',band:'Chamada final',historia:'História',valores:'Valores',gestao:'Gestão e membros',current_board:'Diretoria atual',current_members:'Membros atuais',previous_board:'Diretoria anterior',previous_members:'Membros anteriores',fotos:'Álbuns de fotos',contato:'Contato'} as const;
export function institutionalVisibility(content:Record<string,unknown>){
 return Object.fromEntries(Object.keys(institutionalBlocks).map(key=>[key,content[`institutional_visible_${key}`]!==false&&content[`institutional_visible_${key}`]!=='false'])) as Record<keyof typeof institutionalBlocks,boolean>;
}
export function institutionalData(content: Record<string, unknown>) {
  return {
    visible: institutionalVisibility(content),
    copy: Object.fromEntries(
      Object.entries(institutionalCopy).map(([key, fallback]) => [
        key,
        content[key] === undefined || (key === 'institutional_main_sub_campaigns' && ['Campanhas','Campanhas futuras'].includes(String(content[key]))) || content[key] === ({institutional_main_campaigns_kicker:'Campanhas futuras',institutional_main_campaigns_title:'Vem aí, e você',institutional_main_campaigns_title_end:'pode participar',institutional_main_campaigns_intro:'Conheça as próximas campanhas e veja como contribuir.',institutional_main_sub_campaigns:'Campanhas'} as Record<string,string>)[key]
          ? fallback
          : String(content[key] ?? '').slice(0, 10000),
      ]),
    ) as typeof institutionalCopy,
    lists: Object.fromEntries(
      Object.keys(institutionalLists).map((key) => [
        key,
        institutionalRows(content[key], key as InstitutionalListKey),
      ]),
    ) as Record<InstitutionalListKey, InstitutionalRow[]>,
    demo: content.institutional_demo === true,
    showPhotos: content.institutional_show_photos !== false,
    historyIntro: String(content.institutional_history_intro || ''),
    currentPeriod: String(content.institutional_current_period || ''),
    previousPeriod: String(content.institutional_previous_period || ''),
  };
}
export function institutionalDefaults(name: string) {
  const sample = structuredClone(examples);
  sample.institutional_timeline = sample.institutional_timeline.map((row) => ({
    ...row,
    text: row.text.replaceAll('Alumni Ibitinga', () => name),
  }));
  return {
    identity: {name},
    content: {
      ...institutionalCopy,
      ...sample,
      institutional_demo: true,
      institutional_show_photos: true,
      institutional_history_intro: `Escreva aqui como e por que ${name} nasceu e qual é a sua missão.`,
      institutional_current_period: 'Gestão 20XX–20XX',
      institutional_previous_period: 'Gestão 20XX–20XX',
    },
    contact: {
      whatsapp: '',
      email: '',
      address: '',
      instagram: '',
      pix: '',
      pix_name: '',
    },
    appearance: {preview_template_key: 'institutional-main-1'},
  };
}

export function institutionalInstagram(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^@?[a-zA-Z0-9._]{1,30}$/.test(raw))
    return `https://www.instagram.com/${raw.replace(/^@/, '')}/`;
  try {
    const url = new URL(raw);
    return ['https:', 'http:'].includes(url.protocol) &&
      ['instagram.com', 'www.instagram.com'].includes(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href
      : '';
  } catch {
    return '';
  }
}
