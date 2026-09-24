'use client';

import { useFormStatus } from 'react-dom';
import { deleteOrderAction } from './actions';

function SubmitButton(){
  const {pending}=useFormStatus();
  return <button className="text-danger" type="submit" disabled={pending}>{pending?'Excluindo…':'Excluir pedido'}</button>;
}

export default function DeleteOrderButton({slug,orderId}:{slug:string;orderId:string}){
  return <form action={deleteOrderAction} onSubmit={event=>{
    if(!window.confirm('Excluir este pedido do histórico? Esta ação não poderá ser desfeita.'))event.preventDefault();
  }}>
    <input type="hidden" name="slug" value={slug}/>
    <input type="hidden" name="orderId" value={orderId}/>
    <SubmitButton/>
  </form>;
}
