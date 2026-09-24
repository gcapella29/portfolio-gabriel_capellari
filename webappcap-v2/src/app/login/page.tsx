import { Suspense } from 'react';
import LoginForm from './login-form';
import styles from './login.module.css';

export default function LoginPage(){
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.intro}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>W</span>
            <span className={styles.brandText}>
              <strong>WebAppCap</strong>
              <span>sites que trabalham por você</span>
            </span>
          </div>

          <div className={styles.introCopy}>
            <span className={styles.kicker}>SEU ESPAÇO DIGITAL</span>
            <h1>Seu negócio, em movimento.</h1>
            <p>Gerencie conteúdo, pedidos, clientes e publicação em uma experiência simples, visual e construída para evoluir com o seu projeto.</p>
          </div>

          <div className={styles.featureRow} aria-label="Recursos da plataforma">
            <span className={styles.feature}>Conteúdo</span>
            <span className={styles.feature}>Publicação</span>
            <span className={styles.feature}>Leads</span>
            <span className={styles.feature}>Pedidos</span>
          </div>
        </div>

        <div className={styles.auth}>
          <div className={styles.authInner}>
            <span className={styles.eyebrow}>ACESSO À PLATAFORMA</span>
            <h2>Bem-vindo de volta.</h2>
            <p className={styles.authIntro}>Entre com seu e-mail e senha. Convites de equipe também funcionam com a senha provisória recebida por e-mail.</p>
            <Suspense fallback={<div className={styles.form} aria-hidden="true" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
