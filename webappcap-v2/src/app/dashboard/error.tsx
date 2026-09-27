'use client';

export default function DashboardError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return (
    <main className="error-shell">
      <section className="error-card">
        <span>Painel WebAppCap</span>
        <h1>Não foi possível carregar esta área.</h1>
        <p>O projeto continua salvo. Tente recarregar somente esta tela.</p>
        <button type="button" onClick={reset}>Tentar novamente</button>
      </section>
    </main>
  );
}
