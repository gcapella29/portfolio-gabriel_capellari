// Preserve positions in the published JSON array, including inactive/malformed rows.
export function activeCommerceProducts(value:unknown){
 if(!Array.isArray(value))return [];
 return value.flatMap((raw,productIndex)=>raw&&typeof raw==='object'&&!Array.isArray(raw)&&String(raw.active??'true').trim().toLowerCase()!=='false'?[{raw:raw as Record<string,unknown>,productIndex}]:[]);
}

export function restoreCatalogCart(value:unknown,signature:string,validIds:Set<number>):Record<string,number>{
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const stored=value as {signature?:unknown;items?:unknown};
 // Positional product references cannot survive catalog reordering safely.
 if(stored.signature!==signature||!stored.items||typeof stored.items!=='object'||Array.isArray(stored.items))return {};
 return Object.fromEntries(Object.entries(stored.items).filter(([id,qty])=>/^(0|[1-9]\d*)$/.test(id)&&validIds.has(Number(id))&&typeof qty==='number'&&Number.isInteger(qty)&&qty>0&&qty<=999));
}

export function restoreModernCart(value:unknown,signature:string,validIds:Set<number>){return restoreCatalogCart(value,signature,new Set([...validIds].filter(id=>id>0)))}
