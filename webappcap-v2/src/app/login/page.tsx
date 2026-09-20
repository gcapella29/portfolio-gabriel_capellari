import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage(){
  return (
    <main className="shell">
      <section className="auth-card">
        <span className="eyebrow">WEBAPPCAP</span>
        <h1>Entre no seu site.</h1>
        <p>Use seu e-mail e senha. Se você foi convidado para uma equipe, pode entrar com a senha provisória recebida por e-mail.</p>
        <Suspense fallback={<div className="form-stack" aria-hidden="true" />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
