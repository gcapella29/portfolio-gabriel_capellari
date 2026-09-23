type ProductLike=Record<string,unknown>;

const money=(value:unknown)=>{
 const raw=String(value??'').trim();
 if(!raw)return 0;
 return Number.parseFloat(raw.replace(/[^0-9,.-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.'))||0;
};

export function commerceCategories(products:ProductLike[]){
 const seen=new Set<string>(),result:string[]=[];
 for(const product of products){
  const category=String(product.category??'').trim();
  if(category&&!seen.has(category)){seen.add(category);result.push(category)}
 }
 return result;
}

export function commerceBasePrice(product:ProductLike){
 return Math.max(0,money(product.price));
}

export function commercePromo(product:ProductLike){
 const quantity=Math.max(0,Math.floor(Number(product.promo_quantity)||0));
 const total=Math.max(0,money(product.promo_total));
 return quantity>=2&&total>0?{quantity,total}:null;
}

export function commerceLineTotal(product:ProductLike,quantity:number){
 const qty=Math.max(0,Math.floor(quantity)||0),base=commerceBasePrice(product),promo=commercePromo(product);
 if(!promo||qty<promo.quantity)return base*qty;
 const bundles=Math.floor(qty/promo.quantity),rest=qty%promo.quantity;
 return bundles*promo.total+rest*base;
}

export function commercePromoLabel(product:ProductLike,format:(value:number)=>string){
 const promo=commercePromo(product),base=commerceBasePrice(product);
 if(!promo)return '';
 return `1 por ${format(base)} · ${promo.quantity} por ${format(promo.total)}`;
}
