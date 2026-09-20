export type CommerceOrderItem={name:string;quantity:number;unitPrice:number;total:number};

export function trackCommerceOrder(payload:{projectId:string;templateKey:'commerce-main-1'|'commerce-sales-1';items:CommerceOrderItem[];total:number}){
 const body=JSON.stringify(payload);
 try{
  void fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true,credentials:'same-origin'});
 }catch{/* O envio ao WhatsApp não deve ser bloqueado por analytics/histórico. */}
}
