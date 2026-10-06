export type TemplateEditorSection = {
  key: string;
  label: string;
  description: string;
};

export type TemplateEditorDefinition = {
  templateKey: string;
  label: string;
  mode: 'complete' | 'sales' | 'trainer' | 'institutional';
  sections: TemplateEditorSection[];
};

const templateEditors: Record<string, TemplateEditorDefinition> = {
  'commerce-main-1': {
    templateKey: 'commerce-main-1',
    label: 'Completo',
    mode: 'complete',
    sections: [
      {key:'identity',label:'Início',description:'Capa, nome, frase principal, endereço e botões.'},
      {key:'navigation',label:'Navegação',description:'Textos dos links e chamadas principais.'},
      {key:'news',label:'Novidades',description:'Conteúdo recém-chegado ou em destaque.'},
      {key:'highlights',label:'Destaques',description:'Produtos e itens prioritários.'},
      {key:'menu',label:'Catálogo',description:'Itens, preços, imagens e descrições.'},
      {key:'order',label:'Pedido',description:'Montagem do pedido e envio pelo WhatsApp.'},
      {key:'contact',label:'Contato',description:'WhatsApp, Instagram e localização.'},
      {key:'social',label:'Redes sociais',description:'Chamadas para acompanhar o negócio.'},
      {key:'about',label:'Sobre',description:'História, apresentação e responsável pelo negócio.'},
      {key:'testimonials',label:'Relatos dos compradores',description:'Feedbacks, fotos e prints autorizados dos clientes.'},
      {key:'appearance',label:'Aparência',description:'Cores, fontes e proporções do template.'}
    ]
  },
  'commerce-sales-1': {
    templateKey: 'commerce-sales-1',
    label: 'Venda rápida',
    mode: 'sales',
    sections: [
      {key:'identity',label:'Oferta',description:'Nome, chamada principal e imagem da oferta.'},
      {key:'menu',label:'Produtos',description:'Produtos, preços e imagens usados na venda.'},
      {key:'order',label:'Conversão',description:'Chamada, pedido e botão do WhatsApp.'},
      {key:'contact',label:'Contato',description:'WhatsApp e informações essenciais.'},
      {key:'appearance',label:'Aparência',description:'Cores e identidade visual da página.'}
    ]
  },
  'commerce-bakery-1': {
    templateKey:'commerce-bakery-1',label:'Padaria',mode:'complete',sections:[
      {key:'identity',label:'Início',description:'Nome, capa, chamada, telefone e botões.'},
      {key:'highlights',label:'Destaques',description:'Fotos e textos do carrossel.'},
      {key:'menu',label:'Cardápio',description:'Categorias, produtos, fotos e preços.'},
      {key:'order',label:'Pedido',description:'Retirada, entrega e envio pelo WhatsApp.'},
      {key:'contact',label:'Contato',description:'WhatsApp, telefone e Instagram.'}
    ]
  }
};

templateEditors['commerce-modern-1']={templateKey:'commerce-modern-1',label:'Modern',mode:'complete',sections:templateEditors['commerce-main-1'].sections.filter(section=>['identity','highlights','menu','order','contact','about','testimonials'].includes(section.key))};

templateEditors['personal-trainer-main-1']={templateKey:'personal-trainer-main-1',label:'Personal Trainer',mode:'trainer',sections:[{key:'identity',label:'Identidade e início',description:'Nome, CREF, foto e hero.'},{key:'agenda',label:'Agenda e contato',description:'Estado, WhatsApp e chamadas.'},{key:'method',label:'Método',description:'Etapas do acompanhamento.'},{key:'results',label:'Resultados',description:'Comparador de antes e depois.'},{key:'modes',label:'Modalidades',description:'Formas de atendimento.'},{key:'testimonials',label:'Depoimentos',description:'Relatos dos alunos.'},{key:'faq',label:'FAQ',description:'Perguntas e respostas.'},{key:'copy',label:'Textos do modelo',description:'Navegação e chamadas.'}]};

export function editorForTemplate(templateKey: string | null | undefined) {
  return templateKey ? templateEditors[templateKey] || null : null;
}

export function editorSectionsForTemplate(templateKey: string | null | undefined) {
  return editorForTemplate(templateKey)?.sections || [];
}

templateEditors['institutional-main-1']={templateKey:'institutional-main-1',label:'Institucional',mode:'institutional',sections:[{key:'identity',label:'Identidade e início',description:'Nome e apresentação.'},{key:'projects',label:'Projetos e campanhas',description:'Ações e transparência.'},{key:'history',label:'História',description:'Marcos e valores.'},{key:'management',label:'Gestão',description:'Diretoria e membros.'},{key:'albums',label:'Fotos',description:'Álbuns e imagens.'},{key:'contact',label:'Contato e Pix',description:'Canais e chave de doação.'}]};
