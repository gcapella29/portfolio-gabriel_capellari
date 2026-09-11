import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage(){
  return (
    <main className="shell">
      <section className="auth-card">
        <span className="eyebrow">WEBAPPCAP</span>
        <h1>Entre no seu site.</h1>
        <p>Use o e-mail cadastrado para continuar exatamente de onde parou.</p>
        <Suspense fallback={<div className="form-stack" aria-hidden="true" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
