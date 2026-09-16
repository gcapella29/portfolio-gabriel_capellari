export type CommerceSettings = {
  catalogLabel: string;
  catalogLabelLower: string;
};

const clean=(value:unknown)=>String(value??'').trim();

export function commerceSettings(content:Record<string,unknown>):CommerceSettings{
  const catalogLabel=clean(content.catalog_label)||'Catálogo';
  return {catalogLabel,catalogLabelLower:catalogLabel.toLocaleLowerCase('pt-BR')};
}

export function replaceCommerceCatalogTerm(value:string,settings:CommerceSettings){
  return value.replace(/cardápio/gi,match=>match[0]===match[0].toUpperCase()?settings.catalogLabel:settings.catalogLabelLower);
}
