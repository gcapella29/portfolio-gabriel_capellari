import type { SegmentKey } from './domain';
import type { V2Content } from './onboarding-data';

export type ProjectDefaults = Partial<V2Content>;

type DefaultsFactory = (name: string) => ProjectDefaults;

const commerceMainDefaults: DefaultsFactory = (name) => ({
  identity: {
    name,
    tagline: 'Feito hoje. Servido com calma.',
    description: 'Um comércio local feito para receber bem.',
    location: 'Rua das Flores, 120 · Centro'
  },
  content: {
    hero_title: 'Casa Aurora',
    hero_text: 'Sabores, encontros e novidades todos os dias.',
    primary_offer: 'Produtos preparados com cuidado.',
    proof: 'Ingredientes selecionados e atendimento próximo.',
    about: 'Conheça nossas escolhas da casa.',
    news: [
      { title: 'Forno aberto todo dia', description: 'Uma nova seleção de pães de fermentação lenta, assados em pequenos lotes.', image: '/commerce/commerce-hero.png' },
      { title: 'Almoço de terça a sábado', description: 'Pratos leves e ingredientes da estação.', image: '/commerce/commerce-feature.png' },
      { title: 'Café da tarde', description: 'Bolos, cafés e uma pausa sem pressa.', image: '/commerce/commerce-menu.png' }
    ],
    highlights: [
      { title: 'Sanduíche da casa', description: 'Pão artesanal, queijo fresco, tomate e folhas.', image: '/commerce/commerce-feature.png' },
      { title: 'Cappuccino cremoso', description: 'Café encorpado e leite vaporizado.', image: '/commerce/commerce-menu.png' },
      { title: 'Cheesecake de frutas vermelhas', description: 'Recheio cremoso e frutas frescas.', image: '/commerce/commerce-menu.png' }
    ],
    menu_items: [
      { title: 'Sanduíche da casa', description: 'Pão rústico, queijo fresco, tomate e folhas.', price: 'R$ 28,00', image: '/commerce/commerce-feature.png' },
      { title: 'Croissant artesanal', description: 'Massa folhada, manteiga e fermentação lenta.', price: 'R$ 14,00', image: '/commerce/commerce-menu.png' },
      { title: 'Cappuccino', description: 'Espresso, leite vaporizado e cacau.', price: 'R$ 12,00', image: '/commerce/commerce-menu.png' },
      { title: 'Cheesecake', description: 'Fatia com calda de frutas vermelhas.', price: 'R$ 18,00', image: '/commerce/commerce-menu.png' }
    ]
  },
  media: {
    hero: '/commerce/commerce-hero.png',
    gallery: ['/commerce/commerce-feature.png', '/commerce/commerce-menu.png']
  },
  appearance: {
    accent: '#ef5b3f',
    heading_font: 'Arial Black',
    body_font: 'Arial',
    preview_template_key: 'commerce-main-1'
  },
  contact: {
    phone: '(16) 3342-2026',
    whatsapp: '5516999999999',
    email: 'contato@exemplo.com',
    instagram: '@casaaurora',
    address: 'Rua das Flores, 120 · Centro',
    hours: 'Terça a domingo, das 8h às 20h'
  }
});

const defaultsByTemplate: Record<string, DefaultsFactory> = {
  'commerce-main-1': commerceMainDefaults
};

export function initialTemplateForSegment(segment: SegmentKey): string | null {
  if (segment === 'food-business') return 'commerce-main-1';
  return null;
}

export function projectDefaultsForTemplate(templateKey: string | null, name: string): ProjectDefaults {
  if (!templateKey) return {};
  return defaultsByTemplate[templateKey]?.(name) ?? {};
}
