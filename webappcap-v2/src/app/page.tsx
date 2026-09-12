import type { Metadata } from 'next';
import Image from 'next/image';
import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import { HomeHeader } from './home-header';
import { HomeLeadForm } from './home-lead-form';
import { HomeMotion } from './home-motion';
import styles from './home.module.css';

const headingFont=Fraunces({subsets:['latin'],weight:'variable',axes:['opsz'],variable:'--home-heading',display:'swap'});
const bodyFont=Inter({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-body',display:'swap'});
const monoFont=IBM_Plex_Mono({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-mono',display:'swap'});
const PORTFOLIO_URL='https://capellari.webappcap.com.br';

export const metadata:Metadata={
  title:'WebAppCap — Sites que trabalham por você',
  description:'Sites profissionais, rápidos e fáceis de atualizar. Conheça os projetos criados pela WebAppCap.',
  alternates:{canonical:'https://www.webappcap.com.br'},
  openGraph:{
    title:'WebAppCap — Sites que trabalham por você',
    description:'Sites profissionais, rápidos e fáceis de atualizar. Conheça os projetos criados pela WebAppCap.',
    url:'https://www.webappcap.com.br',
    siteName:'WebAppCap',
    locale:'pt_BR',
    type:'website'
  }
};

const steps=[
  {number:'01',title:'Você conta sua ideia',text:'Entendemos seu trabalho, seu público e o que o site precisa alcançar.'},
  {number:'02',title:'Criamos sua presença',text:'Conteúdo, identidade e estrutura são transformados em uma experiência feita para você.'},
  {number:'03',title:'Você revisa no preview',text:'Confira cada detalhe em um endereço reservado antes de qualquer mudança ir ao ar.'},
  {number:'04',title:'Publicamos e você assume',text:'O site entra no seu domínio e o painel fica pronto para as próximas atualizações.'}
];

const assurances=['Identidade própria','Painel simples','Preview antes de publicar','Responsivo por padrão'];
const marqueeItems=[
  'IDENTIDADE DIGITAL ◆','DESIGN RESPONSIVO ◆','PAINEL DE CONTEÚDO ◆','DOMÍNIO PRÓPRIO ◆',
  'SITES COM IDENTIDADE ◆','GESTÃO SEM COMPLICAÇÃO ◆','PREVIEW ANTES DE PUBLICAR ◆','PERFORMANCE EM QUALQUER TELA ◆',
  'IDENTIDADE DIGITAL ◆','DESIGN RESPONSIVO ◆','PAINEL DE CONTEÚDO ◆','DOMÍNIO PRÓPRIO ◆'
];

const services=[
  {number:'01',title:'Portfólio profissional',text:'Uma presença autoral para apresentar sua trajetória, projetos, serviços e formas de contato.',items:['Identidade sob medida','Conteúdo organizado','Painel para atualizar']},
  {number:'02',title:'Site institucional',text:'Uma base sólida para negócios que precisam explicar o que fazem e transformar visitas em oportunidades.',items:['Páginas estratégicas','Formulário de leads','Experiência responsiva']},
  {number:'03',title:'Landing page',text:'Uma página direta para divulgar um serviço, validar uma ideia ou conduzir uma campanha específica.',items:['Mensagem objetiva','Chamada para ação','Publicação rápida']}
];

const commitments=[
  {label:'ESCOPO',title:'Tudo definido antes',text:'Você sabe o que será criado, quais conteúdos entram e como será a entrega.'},
  {label:'PREVIEW',title:'Nada vai ao ar no escuro',text:'O site fica disponível para revisão em um endereço reservado antes da publicação.'},
  {label:'CONTROLE',title:'O conteúdo continua seu',text:'Depois da entrega, o painel permite atualizar textos, imagens e informações.'},
  {label:'SUPORTE',title:'Acompanhamento de verdade',text:'Você recebe orientação para revisar, publicar e assumir a gestão do projeto.'}
];

const questions=[
  {question:'Preciso ter todo o conteúdo pronto?',answer:'Não. Podemos começar organizando sua ideia, suas referências e o material que já existe. A estrutura do site ajuda a revelar o que ainda precisa ser produzido.'},
  {question:'Consigo atualizar o site sozinho?',answer:'Sim. Textos, imagens e informações principais ficam reunidos em um painel simples. Você confere as mudanças no preview e decide quando publicar.'},
  {question:'O site funciona bem no celular?',answer:'Sim. Cada projeto é desenvolvido e revisado para computador, tablet e celular, com atenção a leitura, navegação, imagens e formulários.'},
  {question:'Domínio e hospedagem estão incluídos?',answer:'A configuração é orientada conforme a necessidade do projeto. Antes de começar, você recebe uma definição clara do que será contratado, configurado e mantido.'},
  {question:'Quanto tempo leva para ficar pronto?',answer:'O prazo depende do tamanho do site e da disponibilidade do conteúdo. Depois do briefing, você recebe um escopo com etapas e previsão de entrega.'},
  {question:'Como começamos?',answer:'Envie o formulário ou chame pelo WhatsApp. Primeiro entendemos seu objetivo; depois você recebe os próximos passos, sem compromisso.'}
];

export default function HomePage(){
  return <main className={`${styles.site} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`} data-home-root>
    <HomeMotion/>
    <HomeHeader/>

    <section className={styles.hero} id="inicio">
      <div className={styles.heroGlow}/>
      <div className={styles.heroCopy} data-reveal>
        <span className={styles.eyebrow}><i/> Sites autorais · gestão simples</span>
        <h1>Seu trabalho merece um site à <em>altura.</em></h1>
        <p>A WebAppCap cria sites profissionais com personalidade, desempenho e um painel simples para você manter tudo atualizado.</p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#contato">Criar meu site <span>↘</span></a>
          <a className={styles.secondaryButton} href="#projetos">Ver projetos <span>↓</span></a>
        </div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true" data-reveal data-reveal-delay="180">
        <div className={styles.orbit}><span>W</span></div>
        <div className={`${styles.floatCard} ${styles.cardOne}`}><small>PUBLICADO</small><strong>Seu domínio</strong><i/></div>
        <div className={`${styles.floatCard} ${styles.cardTwo}`}><small>CONTROLE</small><strong>Edite e publique</strong><i/></div>
        <div className={`${styles.floatCard} ${styles.cardThree}`}><small>EXPERIÊNCIA</small><strong>Rápido em qualquer tela</strong><i/></div>
      </div>
    </section>

    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {[0,1].map(group=><div className={styles.marqueeGroup} key={group}>{marqueeItems.map(item=><span key={item}>{item}</span>)}</div>)}
      </div>
    </div>

    <section className={styles.intro} id="como-funciona">
      <div className={styles.sectionLabel} data-reveal><span>01</span> Do primeiro contato à publicação</div>
      <div className={styles.introCopy}>
        <h2 data-reveal>Um caminho simples até o seu site.</h2>
        <p data-reveal data-reveal-delay="100">Você não precisa entender de código, hospedagem ou configuração. A WebAppCap organiza o processo e deixa as decisões importantes nas suas mãos.</p>
      </div>
      <div className={styles.processGrid}>{steps.map((item,index)=><article key={item.number} data-reveal data-reveal-delay={String(index*80)}><span>{item.number}</span><i aria-hidden="true"/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <div className={styles.assuranceStrip}>{assurances.map((item,index)=><span key={item} data-reveal data-reveal-delay={String(index*65)}><i aria-hidden="true">✓</i>{item}</span>)}</div>
    </section>

    <section className={styles.control} id="painel">
      <div className={styles.controlCopy} data-reveal>
        <div className={`${styles.sectionLabel} ${styles.lightLabel}`}><span>02</span> Seu site continua nas suas mãos</div>
        <h2>Mude o conteúdo.<br/><em>Não o código.</em></h2>
        <p>O painel reúne o que você precisa para manter o site vivo. Edite com tranquilidade, confira o resultado e escolha quando publicar.</p>
        <ol className={styles.controlSteps}>
          <li><span>01</span><div><strong>Edite</strong><small>Textos, imagens e informações em campos claros.</small></div></li>
          <li><span>02</span><div><strong>Confira</strong><small>O preview mostra as mudanças antes do público.</small></div></li>
          <li><span>03</span><div><strong>Publique</strong><small>Quando estiver pronto, coloque a nova versão no ar.</small></div></li>
        </ol>
      </div>
      <div className={styles.dashboardDemo} aria-label="Demonstração visual do painel WebAppCap" data-reveal data-reveal-delay="120">
        <div className={styles.demoTop}><span><i/><i/><i/></span><small>painel.webappcap.com.br</small><b>ONLINE</b></div>
        <div className={styles.demoBody}>
          <aside><strong><i>W</i> WebAppCap</strong><span className={styles.demoActive}>▣ Conteúdo</span><span>▧ Aparência</span><span>◫ Mídia</span><span>◇ Domínio</span><span>◎ Leads</span></aside>
          <div className={styles.demoContent}>
            <div className={styles.demoHeader}><div><small>CONTEÚDO</small><h3>Seu site, do seu jeito.</h3></div><span>Preview ↗</span></div>
            <div className={styles.demoNotice}><i/>Alterações salvas no rascunho. Confira no preview antes de publicar.</div>
            <div className={styles.demoFields}><label><span>Título principal</span><b>Seu trabalho merece um site à altura.</b></label><label><span>Texto de apresentação</span><b>Uma presença digital feita para crescer com você.</b></label></div>
            <div className={styles.demoActions}><span>Rascunho atualizado</span><button type="button" tabIndex={-1}>Publicar alterações</button></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.projects} id="projetos">
      <div className={styles.projectsHeader} data-reveal>
        <div className={styles.sectionLabel}><span>03</span> Projeto fundador</div>
        <div><h2>Primeiro usamos em casa.</h2><p>O portfólio de Gabriel Capellari nasceu como site independente e se tornou o primeiro projeto completo construído sobre a base do WebAppCap.</p></div>
      </div>
      <article className={styles.projectCard} data-reveal>
        <a className={styles.projectPreview} href={PORTFOLIO_URL} aria-label="Abrir o portfólio de Gabriel Capellari">
          <Image src="/assets/media/hero-gabriel.jpg" alt="Portfólio de Gabriel Capellari" fill sizes="(max-width: 800px) 100vw, 58vw"/>
          <div className={styles.browserBar}><i/><i/><i/><span>capellari.webappcap.com.br</span></div>
          <div className={styles.previewName}><span>Gabriel</span><em>Capellari</em></div>
        </a>
        <div className={styles.projectInfo}>
          <span className={styles.projectNumber}>ESTUDO DE CASO · 01</span>
          <div><span className={styles.live}><i/> NO AR</span><h3>Gabriel Capellari</h3><p>Um portfólio editorial que reúne trajetória, coberturas internacionais, trabalhos publicados e contato — com conteúdo gerenciado pelo próprio painel.</p></div>
          <div className={styles.caseFacts}><span><b>PT / EN</b>Experiência bilíngue</span><span><b>100%</b>Responsivo</span><span><b>PAINEL</b>Conteúdo e mídia</span></div>
          <div className={styles.tags}><span>Portfólio</span><span>Jornalismo</span><span>Leads integrados</span></div>
          <a href={PORTFOLIO_URL}>Visitar projeto <span>↗</span></a>
        </div>
      </article>
    </section>

    <section className={styles.services} id="servicos">
      <div className={styles.servicesHeader} data-reveal>
        <div className={`${styles.sectionLabel} ${styles.lightLabel}`}><span>04</span> Formatos de projeto</div>
        <div><h2>O ponto de partida para a sua presença digital.</h2><p>Cada site nasce de uma necessidade diferente. Escolha o formato mais próximo da sua ideia — o escopo final é sempre ajustado ao seu projeto.</p></div>
      </div>
      <div className={styles.serviceGrid}>
        {services.map((service,index)=><article key={service.number} data-reveal data-reveal-delay={String(index*90)}>
          <div className={styles.serviceTop}><span>{service.number}</span><i aria-hidden="true">↗</i></div>
          <h3>{service.title}</h3><p>{service.text}</p>
          <ul>{service.items.map(item=><li key={item}>{item}</li>)}</ul>
          <a href="#contato">Conversar sobre este formato <span>→</span></a>
        </article>)}
      </div>
      <div className={styles.servicesNote} data-reveal><span>PROJETO SOB MEDIDA</span><p>Sem pacote engessado: conteúdo, quantidade de páginas, integrações e prazo são definidos depois de entendermos o que você realmente precisa.</p><a href="#contato">Pedir uma proposta ↘</a></div>
    </section>

    <section className={styles.trust}>
      <div className={styles.trustIntro} data-reveal><span>CONFIANÇA / 001</span><h2>Clareza do primeiro contato à publicação.</h2><p>Um bom site também depende de um bom processo. Estes são os compromissos que orientam cada projeto WebAppCap.</p></div>
      <div className={styles.commitmentGrid}>{commitments.map((item,index)=><article key={item.label} data-reveal data-reveal-delay={String(index*70)}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className={styles.faq} id="duvidas">
      <div className={styles.faqHeading} data-reveal><div className={styles.sectionLabel}><span>05</span> Antes de começar</div><h2>Perguntas que ajudam a tirar a ideia do papel.</h2></div>
      <div className={styles.faqList} data-reveal data-reveal-delay="100">{questions.map((item,index)=><details key={item.question}><summary><span>{String(index+1).padStart(2,'0')}</span>{item.question}<i aria-hidden="true">+</i></summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className={styles.contact} id="contato">
      <div className={styles.contactPitch} data-reveal>
        <span className={styles.contactKicker}>06 · TEM UM PROJETO EM MENTE?</span>
        <h2>Vamos colocar sua ideia <em>no ar.</em></h2>
        <p>Conte o que você precisa. Eu organizo o projeto e retorno com os próximos passos para transformar a ideia em um site com identidade.</p>
        <div className={styles.contactDirect}>
          <span>Prefere conversar agora?</span>
          <a href="https://wa.me/5516997168229?text=Ol%C3%A1%2C%20Gabriel!%20Quero%20conversar%20sobre%20um%20site." target="_blank" rel="noreferrer">WhatsApp ↗</a>
          <a href="mailto:gcapellari1@gmail.com">gcapellari1@gmail.com</a>
        </div>
      </div>
      <div className={styles.contactForm} data-reveal data-reveal-delay="120"><HomeLeadForm/></div>
    </section>

    <footer className={styles.footer}><a className={styles.brand} href="#inicio"><span>W</span>WebAppCap</a><p>Sites com identidade. Gestão sem complicação.</p><span>© 2026 WEBAPPCAP</span></footer>
  </main>;
}
