export type CommerceOrderItem={name:string;quantity:number;unitPrice:number;total:number};

export function trackCommerceOrder(payload:{
 projectId:string;
 templateKey:'commerce-main-1'|'commerce-sales-1';
 items:CommerceOrderItem[];
 total:number;
 customerName:string;
 customerPhone:string;
}){
 if(typeof window!=='undefined'&&(window.location.pathname.startsWith('/preview/')||window.location.hostname==='localhost'||window.location.hostname.endsWith('.vercel.app')))return;
 const body=JSON.stringify(payload);
 try{
  void fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true,credentials:'same-origin'});
 }catch{/* O envio ao WhatsApp não deve ser bloqueado pelo histórico. */}
}
