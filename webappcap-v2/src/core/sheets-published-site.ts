import type { V2Content } from './onboarding-data';
import type { TemplateRenderProject } from '@/templates/types';

const DEFAULT_OWNER_API_URL =
  'https://script.google.com/macros/s/AKfycbyu2wAzXzH3gU0ft3MOFu45KQzIsTVeGJIoN9UABF8d5NW04yohfe3sdmduIciTcefubQ/exec';

type Row = Record<string, unknown>;

type PublishedApiResponse = {
  ok: boolean;
  error?: string;
  publication?: {
    published_id?: string;
    timestamp?: string;
    version?: number;
    checksum?: string;
  };
  snapshot?: Row;
};

export type SheetsPublishedSite = {
  project: TemplateRenderProject;
  data: V2Content;
  publication: NonNullable<PublishedApiResponse['publication']>;
};

const text = (value: unknown) => String(value ?? '').trim();
const boolean = (value: unknown) =>
  value === true || ['true', '1', 'sim', 'yes'].includes(text(value).toLowerCase());
const number = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = text(value).replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = (value: unknown) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number(value));

const rows = (value: unknown): Row[] =>
  Array.isArray(value)
    ? value.filter(item => item && typeof item === 'object') as Row[]
    : [];

const record = (value: unknown): Row =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Row
    : {};

const json = (value: unknown): Row => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Row;
  }
  try {
    const parsed = JSON.parse(text(value) || '{}');
    return record(parsed);
  } catch {
    return {};
  }
};

const mediaUrl = (mediaMap: Map<string, Row>, mediaId: unknown) => {
  const media = mediaMap.get(text(mediaId));
  return text(media?.preview_url || media?.url);
};

const blockByType = (blocks: Row[], type: string) =>
  blocks.find(block => text(block.tipo) === type) || {};

function snapshotToBakeryContent(snapshot: Row): V2Content {
  const config = record(snapshot.config);
  const style = record(snapshot.style);
  const media = rows(snapshot.media);
  const items = rows(snapshot.items)
    .filter(item => boolean(item.ativo) && boolean(item.disponivel))
    .sort((a, b) => number(a.ordem) - number(b.ordem));
  const categories = rows(snapshot.categories);
  const highlights = rows(snapshot.highlights)
    .filter(item => boolean(item.ativo))
    .sort((a, b) => number(a.ordem) - number(b.ordem));
  const blocks = rows(snapshot.blocks)
    .filter(block => boolean(block.ativo))
    .sort((a, b) => number(a.ordem) - number(b.ordem));

  const mediaMap = new Map(media.map(item => [text(item.media_id), item]));
  const categoryMap = new Map(categories.map(item => [text(item.categoria_id), item]));

  const hero = blockByType(blocks, 'hero');
  const heroConfig = json(hero.config_json);
  const highlightBlock = blockByType(blocks, 'destaques');
  const highlightConfig = json(highlightBlock.config_json);
  const productsBlock = blockByType(blocks, 'produtos');
  const productsConfig = json(productsBlock.config_json);
  const orderBlock = blockByType(blocks, 'pedido');

  const menuItems = items.map(item => {
    const category = categoryMap.get(text(item.categoria_id));
    const regularPrice = number(item.preco);
    const promotionalPrice = number(item.preco_promocional);
    return {
      title: text(item.nome),
      category: text(category?.nome),
      description: text(item.descricao),
      price: money(promotionalPrice > 0 ? promotionalPrice : regularPrice),
      image: mediaUrl(mediaMap, item.imagem_id)
    };
  });

  const bakeryHighlights = highlights.map(item => {
    const settings = json(item.config_json);
    return {
      tag: text(settings.tag || 'Destaque'),
      title: text(item.titulo),
      description: text(item.subtitulo),
      image: mediaUrl(mediaMap, item.imagem_id)
    };
  });

  const heroMedia = mediaMap.get(text(heroConfig.image_id));

  return {
    identity: {
      name: text(config.nome),
      description: text(hero.subtitulo)
    },
    content: {
      menu_items: menuItems,
      bakery_eyebrow: text(heroConfig.eyebrow),
      bakery_hero_title: text(hero.titulo || config.nome),
      bakery_hero_subtitle: text(hero.subtitulo),
      bakery_highlights: bakeryHighlights,
      bakery_highlights_eyebrow: text(highlightConfig.eyebrow || 'Destaques da casa'),
      bakery_highlights_title: text(highlightBlock.titulo),
      bakery_highlights_intro: text(highlightBlock.subtitulo),
      bakery_menu_title: text(productsBlock.titulo),
      bakery_menu_intro: text(productsBlock.subtitulo),
      bakery_order_title: text(orderBlock.titulo)
    },
    media: {
      bakery_hero: {
        url: text(heroMedia?.preview_url || heroMedia?.url),
        fit: text(heroConfig.fit || 'cover'),
        position: text(heroConfig.position || 'center center'),
        zoom: text(heroConfig.zoom || '100')
      }
    },
    appearance: {
      bakery_accent: text(style.cor_primaria || '#9c4f2f'),
      preview_template_key: text(config.source_template_key || 'commerce-bakery-1')
    },
    contact: {
      phone: text(config.telefone),
      whatsapp: text(config.whatsapp),
      instagram: text(config.instagram)
    }
  };
}

function mapSnapshot(snapshot: Row, publication: SheetsPublishedSite['publication']): SheetsPublishedSite {
  const projectRow = record(snapshot.project);
  const config = record(snapshot.config);
  const templateId = text(projectRow.template_id);
  const type = text(projectRow.tipo).toLowerCase();
  const isBakery = templateId === 'TPL-0005' || type === 'padaria';
  const templateKey = text(config.source_template_key) || (isBakery ? 'commerce-bakery-1' : '');

  const project: TemplateRenderProject = {
    id: text(projectRow.project_id),
    slug: text(projectRow.slug),
    name: text(projectRow.nome || config.nome),
    segment: isBakery ? 'commerce' : 'portfolio',
    templateKey
  };

  const data = isBakery
    ? snapshotToBakeryContent(snapshot)
    : {
        identity: { name: project.name },
        content: {},
        media: {},
        appearance: {},
        contact: {}
      };

  return { project, data, publication };
}

export async function readSheetsPublishedSiteBySlug(rawSlug: string): Promise<SheetsPublishedSite | null> {
  const slug = rawSlug.trim().toLowerCase();
  if (!slug) return null;

  const endpoint =
    process.env.WEBAPPCAP_OWNER_API_URL?.trim() ||
    DEFAULT_OWNER_API_URL;

  const url = new URL(endpoint);
  url.searchParams.set('api', 'published');
  url.searchParams.set('slug', slug);

  const response = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar snapshot do WebAppCap Owner: HTTP ${response.status}`
    );
  }

  const payload = await response.json() as PublishedApiResponse;

  if (!payload.ok || !payload.snapshot) {
    return null;
  }

  return mapSnapshot(
    payload.snapshot,
    payload.publication || {}
  );
}
