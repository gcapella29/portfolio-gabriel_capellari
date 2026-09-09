import type { Metadata } from 'next';
import Image from 'next/image';
import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import styles from './home.module.css';

const headingFont=Fraunces({subsets:['latin'],weight:'variable',axes:['opsz'],variable:'--home-heading',display:'swap'});
const bodyFont=Inter({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-body',display:'swap'});
const monoFont=IBM_Plex_Mono({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-mono',display:'swap'});

export const metadata:Metadata={
  title:'WebAppCap — Sites que trabalham por você',
  description:'Sites profissionais, rápidos e fáceis de atualizar. Conheça os projetos criados pela WebAppCap.'
};

const benefits=[
  {number:'01',title:'Seu site, de verdade',text:'Uma presença digital com identidade própria — sem cara de modelo pronto e sem depender de redes sociais.'},
  {number:'02',title:'Você no controle',text:'Atualize textos, imagens e informações em um painel simples. Salve, confira no preview e publique quando estiver pronto.'},
  {number:'03',title:'Preparado para crescer',text:'Estrutura rápida, responsiva e organizada para evoluir junto com o seu trabalho ou negócio.'}
];

export default function HomePage(){
  return <main className={`${styles.site} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
    <header className={styles.nav}>
      <a className={styles.brand} href="#inicio" aria-label="WebAppCap — início"><span>W</span>WebAppCap</a>
      <nav aria-label="Navegação principal">
        <a href="#como-funciona">Como funciona</a>
        <a href="#projetos">Projetos</a>
        <a href="#contato">Contato</a>
      </nav>
      <a className={styles.login} href="/login">Área do cliente <span>↗</span></a>
    </header>

    <section className={styles.hero} id="inicio">
      <div className={styles.heroGlow}/>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}><i/> Sites autorais · gestão simples</span>
        <h1>Seu trabalho merece um site à <em>altura.</em></h1>
        <p>A WebAppCap cria sites profissionais com personalidade, desempenho e um painel simples para você manter tudo atualizado.</p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#contato">Criar meu site <span>↘</span></a>
          <a className={styles.secondaryButton} href="#projetos">Ver projetos <span>↓</span></a>
        </div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true">
        <div className={styles.orbit}><span>W</span></div>
        <div className={`${styles.floatCard} ${styles.cardOne}`}><small>PUBLICADO</small><strong>Seu domínio</strong><i/></div>
        <div className={`${styles.floatCard} ${styles.cardTwo}`}><small>CONTROLE</small><strong>Edite e publique</strong><i/></div>
        <div className={`${styles.floatCard} ${styles.cardThree}`}><small>EXPERIÊNCIA</small><strong>Rápido em qualquer tela</strong><i/></div>
      </div>
    </section>

    <div className={styles.marquee} aria-hidden="true"><div><span>IDENTIDADE DIGITAL ◆</span><span>DESIGN RESPONSIVO ◆</span><span>PAINEL DE CONTEÚDO ◆</span><span>DOMÍNIO PRÓPRIO ◆</span><span>IDENTIDADE DIGITAL ◆</span><span>DESIGN RESPONSIVO ◆</span><span>PAINEL DE CONTEÚDO ◆</span><span>DOMÍNIO PRÓPRIO ◆</span></div></div>

    <section className={styles.intro} id="como-funciona">
      <div className={styles.sectionLabel}><span>01</span> Uma presença que é sua</div>
      <div className={styles.introCopy}>
        <h2>Mais do que uma página bonita.</h2>
        <p>Construímos uma base digital para apresentar seu trabalho, conquistar confiança e transformar visitas em oportunidades.</p>
      </div>
      <div className={styles.benefitGrid}>{benefits.map(item=><article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className={styles.projects} id="projetos">
      <div className={styles.projectsHeader}>
        <div className={styles.sectionLabel}><span>02</span> Projetos no ar</div>
        <div><h2>Criados para pessoas reais.</h2><p>Cada projeto nasce do conteúdo, dos objetivos e da personalidade de quem está por trás dele.</p></div>
      </div>
      <article className={styles.projectCard}>
        <a className={styles.projectPreview} href="/native-preview/portfolio" aria-label="Abrir o portfólio de Gabriel Capellari">
          <Image src="/assets/media/hero-gabriel.jpg" alt="Portfólio de Gabriel Capellari" fill sizes="(max-width: 800px) 100vw, 58vw"/>
          <div className={styles.browserBar}><i/><i/><i/><span>capellari.webappcap.com.br</span></div>
          <div className={styles.previewName}><span>Gabriel</span><em>Capellari</em></div>
        </a>
        <div className={styles.projectInfo}>
          <span className={styles.projectNumber}>PROJETO 01</span>
          <div><span className={styles.live}><i/> NO AR</span><h3>Gabriel Capellari</h3><p>Portfólio editorial bilíngue para jornalista de poker, com experiências, coberturas internacionais e canais de contato.</p></div>
          <div className={styles.tags}><span>Portfólio</span><span>Jornalismo</span><span>Bilíngue</span></div>
          <a href="/native-preview/portfolio">Visitar projeto <span>↗</span></a>
        </div>
      </article>
    </section>

    <section className={styles.contact} id="contato">
      <span className={styles.contactKicker}>TEM UM PROJETO EM MENTE?</span>
      <h2>Vamos colocar sua ideia <em>no ar.</em></h2>
      <p>Conte o que você precisa. A gente conversa, organiza o projeto e transforma tudo em um site com a sua identidade.</p>
      <div className={styles.contactActions}>
        <a className={styles.primaryButton} href="https://wa.me/5516997168229?text=Ol%C3%A1%2C%20Gabriel!%20Quero%20conversar%20sobre%20um%20site." target="_blank" rel="noreferrer">Falar pelo WhatsApp <span>↗</span></a>
        <a className={styles.contactEmail} href="mailto:gcapellari1@gmail.com">gcapellari1@gmail.com</a>
      </div>
    </section>

    <footer className={styles.footer}><a className={styles.brand} href="#inicio"><span>W</span>WebAppCap</a><p>Sites com identidade. Gestão sem complicação.</p><span>© 2026 WEBAPPCAP</span></footer>
  </main>;
}
