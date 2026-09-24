export const DEFAULT_MENU_ITEM_LIMIT=80;

export function parseMenuItemLimit(value:unknown):number{
 const number=typeof value==='number'?value:typeof value==='string'&&value.trim()?Number(value):NaN;
 return Number.isSafeInteger(number)&&number>0&&number<=500?number:DEFAULT_MENU_ITEM_LIMIT;
}

export function validatedMenuItems(value:unknown,limit:number,existingCount:number):Record<string,unknown>[]{
 if(!Array.isArray(value))throw new Error('A lista de produtos é inválida. Nada foi salvo.');
 const max=Math.max(limit,existingCount);
 if(value.length>max)throw new Error(`Você atingiu o limite de ${limit} itens do seu plano. Remova um item antes de adicionar outro.`);
 if(value.some(item=>!item||typeof item!=='object'||Array.isArray(item)))throw new Error('A lista de produtos contém um item inválido. Nada foi salvo.');
 return value as Record<string,unknown>[];
}
