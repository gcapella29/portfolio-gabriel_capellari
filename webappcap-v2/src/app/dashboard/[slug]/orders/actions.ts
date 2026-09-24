'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const text=(formData:FormData,key:string)=>String(formData.get(key)||'').trim();

export async function deleteOrderAction(formData:FormData){
  const slug=text(formData,'slug');
  const orderId=text(formData,'orderId');
  const access=await resolveProjectAccess(slug);

  if(access.project.segment!=='food-business'||!can(access.role,'viewLeads')){
    throw new Error('Sem permissão para excluir pedidos.');
  }
  if(!orderId)throw new Error('Pedido inválido.');

  const sb=await createSupabaseServerClient();

  if(orderId.startsWith('legacy-')){
    const legacyId=Number(orderId.slice('legacy-'.length));
    if(!legacyId)throw new Error('Pedido inválido.');
    const result=await sb
      .from('site_leads')
      .delete()
      .eq('id',legacyId)
      .eq('project_id',access.project.id)
      .like('message','WEBAPPCAP_ORDER_V1|%');
    if(result.error)throw result.error;
  }else{
    const result=await sb
      .from('commerce_orders')
      .delete()
      .eq('id',orderId)
      .eq('project_id',access.project.id);
    if(result.error)throw result.error;
  }

  const path=`/dashboard/${encodeURIComponent(slug)}/orders`;
  revalidatePath(path);
  redirect(`${path}?deleted=1`);
}
