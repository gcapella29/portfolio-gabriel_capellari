export type TemplateEditorSection = {
  key: string;
  label: string;
  description: string;
};

export type TemplateEditorDefinition = {
  templateKey: string;
  label: string;
  mode: 'complete' | 'sales';
  sections: TemplateEditorSection[];
};

const commerceEditors: Record<string, TemplateEditorDefinition> = {
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
  }
};

export function editorForTemplate(templateKey: string | null | undefined) {
  return templateKey ? commerceEditors[templateKey] || null : null;
}

export function editorSectionsForTemplate(templateKey: string | null | undefined) {
  return editorForTemplate(templateKey)?.sections || [];
}
