import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {commerceOrdersForProject} from '@/core/commerce-orders';
import DeleteOrderButton from './delete-order-button';

const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const date=(value:string)=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
const template=(value:string)=>value==='commerce-sales-1'?'Venda rápida':'Site completo';

export default async function OrdersPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{deleted?:string}>}){
 const {slug}=await params,query=await searchParams,access=await resolveProjectAccess(slug);
 if(access.project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(access.project.slug)}/leads`);
 if(!can(access.role,'viewLeads'))redirect(`/dashboard/${encodeURIComponent(access.project.slug)}`);
 const orders=await commerceOrdersForProject(access.project.id,{limit:500}),now=Date.now(),recent=orders.filter(order=>now-new Date(order.createdAt).getTime()<=30*86400000),value=recent.reduce((sum,order)=>sum+order.total,0);
 return <div className="editor-page">
  <header><span className="eyebrow dark-text">HISTÓRICO DE PEDIDOS</span><h1>Pedidos enviados pelo site.</h1><p>Cada registro é criado quando o cliente toca em “Enviar pedido pelo WhatsApp”, tanto no Site completo quanto na Venda rápida.</p></header>
  {query.deleted?<div className="notice success">Pedido excluído do histórico.</div>:null}
  <section className="lead-stats"><article><strong>{orders.length}</strong><span>Total registrado</span></article><article><strong>{recent.length}</strong><span>Últimos 30 dias</span></article><article><strong>{money(value)}</strong><span>Valor nos últimos 30 dias</span></article><article><strong>{orders[0]?date(orders[0].createdAt):'—'}</strong><span>Último pedido</span></article></section>
  <section className="lead-list">{orders.length===0?<div className="empty-state">Nenhum pedido enviado pelo site ainda.</div>:orders.map(order=><article className="lead-card-v2" key={order.id}>
   <div className="lead-card-head"><div><strong>Pedido #{order.id.replace('legacy-','')}</strong><span>{date(order.createdAt)} · {template(order.templateKey)}</span></div><b>{money(order.total)}</b></div>
   <div className="lead-info"><div><small>Itens</small>{order.items.map((item,index)=><p key={`${order.id}-${index}`}><strong>{item.quantity}× {item.name}</strong> · {money(item.total)}</p>)}</div><div><small>Origem</small><p>{template(order.templateKey)}</p><small>O pedido foi encaminhado ao WhatsApp configurado no projeto.</small></div></div>
   <DeleteOrderButton slug={access.project.slug} orderId={order.id}/>
  </article>)}</section>
 </div>;
}
