'use client';

export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return (
    <html lang="pt-BR">
      <body style={{margin:0,fontFamily:'Arial,sans-serif',background:'#f7f8fa',color:'#111820'}}>
        <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',padding:'24px'}}>
          <section style={{width:'min(100%,440px)',padding:'28px',border:'1px solid #dde3ea',borderRadius:'22px',background:'#fff',textAlign:'center'}}>
            <strong style={{display:'block',fontSize:'12px',letterSpacing:'.08em',textTransform:'uppercase',color:'#718096'}}>WebAppCap</strong>
            <h1 style={{margin:'10px 0 8px',fontSize:'28px',lineHeight:1.05}}>Não conseguimos iniciar a aplicação.</h1>
            <p style={{margin:'0 0 18px',color:'#5f6874',fontSize:'14px',lineHeight:1.55}}>Tente carregar novamente. Se o problema persistir, o erro ficará disponível nos logs do deploy.</p>
            <button type="button" onClick={reset} style={{minHeight:'46px',padding:'0 20px',border:0,borderRadius:'999px',background:'#111820',color:'#fff',fontWeight:800,cursor:'pointer'}}>Recarregar</button>
          </section>
        </main>
      </body>
    </html>
  );
}
