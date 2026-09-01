import Link from 'next/link';

export default function LoginPage() {
  return <main className="shell"><section className="segment-card" style={{maxWidth:520,margin:'8vh auto 0'}}><span>WEBAPPCAP V2</span><h2>Acesso</h2><p>A camada de sessão já está isolada e protegida no servidor. O formulário definitivo de entrada, convite e criação de senha será entregue junto do onboarding no Bloco 2.</p><Link href="/entry" style={{display:'inline-block',marginTop:18,fontWeight:800}}>Continuar com sessão ativa →</Link></section></main>;
}
