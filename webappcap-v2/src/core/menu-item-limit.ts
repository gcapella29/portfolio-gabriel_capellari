import {createSupabaseServerClient} from '@/lib/supabase/server';
import {DEFAULT_MENU_ITEM_LIMIT,parseMenuItemLimit} from './menu-item-limit-value';
export {validatedMenuItems} from './menu-item-limit-value';

export async function menuItemLimitForProject(projectId:string):Promise<number>{
 const sb=await createSupabaseServerClient();
 const {data,error}=await sb.from('project_commercial').select('limits').eq('project_id',projectId).maybeSingle();
 if(error){
  // Older installations may not have commercial settings yet.
  if(['42P01','PGRST205'].includes(error.code))return DEFAULT_MENU_ITEM_LIMIT;
  throw error;
 }
 const limits=data?.limits;
 return parseMenuItemLimit(limits&&typeof limits==='object'&&!Array.isArray(limits)?(limits as Record<string,unknown>).menu_items:undefined);
}
