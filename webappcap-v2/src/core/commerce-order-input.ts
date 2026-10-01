export const MAX_COMMERCE_ORDER_ITEMS=1000;
export type CommerceItemRef={productIndex:number;quantity:number};

// Reject the entire order rather than silently recording only a subset.
export function parseCommerceOrderItems(value:unknown):CommerceItemRef[]|null{
 if(!Array.isArray(value)||!value.length||value.length>MAX_COMMERCE_ORDER_ITEMS)return null;
 const indices=new Set<number>(),result:CommerceItemRef[]=[];
 for(const raw of value){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
  const {productIndex,quantity}=raw as Record<string,unknown>;
  if(typeof productIndex!=='number'||!Number.isSafeInteger(productIndex)||productIndex<0||typeof quantity!=='number'||!Number.isInteger(quantity)||quantity<1||quantity>999||indices.has(productIndex))return null;
  indices.add(productIndex);result.push({productIndex,quantity});
 }
 return result;
}
