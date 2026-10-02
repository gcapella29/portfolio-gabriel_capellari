import Image from 'next/image';
import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import {HomeProjectCarousel} from './home-project-carousel';
import {parseHomeProjectCases,mergeHomeProjectCases,type HomeProjectCase} from '@/core/home-project-cases';
import { HomeHeader } from './home-header';
import { HomeLeadForm } from './home-lead-form';
import { HomeMotion } from './home-motion';
import { rootValue, type RootSiteContent } from '@/core/root-site';
import styles from './home.module.css';
import projectStyles from './home-projects.module.css';

const headingFont=Fraunces({subsets:['latin'],weight:'variable',axes:['opsz'],variable:'--home-heading',display:'swap'});
const bodyFont=Inter({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-body',display:'swap'});
const monoFont=IBM_Plex_Mono({subsets:['latin'],weight:['400','500','600','700'],variable:'--home-mono',display:'swap'});
const DEFAULT_PORTFOLIO_URL='https://capellari.webappcap.com.br';
const DEFAULT_VETSE_URL='https://vet-se.webappcap.com.br';
const defaultProjectCases=[
  {
    name:'Gabriel Capellari',
    url:DEFAULT_PORTFOLIO_URL,
    category:'Portfólio',
    description:'Um portfólio editorial que reúne trajetória, coberturas internacionais, trabalhos publicados e contato — com conteúdo gerenciado pelo próprio painel.',
    facts:[['PT / EN','Experiência bilíngue'],['100%','Responsivo'],['PAINEL','Conteúdo e mídia']],
    tags:['Portfólio','Jornalismo','Leads integrados']
  },
  {
    name:'Vet-se',
    url:DEFAULT_VETSE_URL,
    category:'Loja Digital',
    description:'Uma loja digital com catálogo, categorias, promoções, carrinho e pedidos integrados ao WhatsApp, gerenciada pelo próprio painel do WebAppCap.',
    facts:[['CATÁLOGO','Produtos e categorias'],['PEDIDOS','Carrinho + WhatsApp'],['GESTÃO','Promoções e conteúdo pelo painel']],
    tags:['Loja Digital','Catálogo','WhatsApp','Mobile first']
  }
] as const;
const defaultProjectCasesText=defaultProjectCases.map(project=>[
  project.name,
  project.url,
  project.category,
  project.description,
  project.facts.map(([label,text])=>`${label}:${text}`).join(';'),
  project.tags.join(';')
].join(' | ')).join('\n');

const defaultSteps=[
  {number:'01',title:'Você conta sua ideia',text:'Entendemos seu trabalho, seu público e o que o site precisa alcançar.'},
  {number:'02',title:'Criamos sua presença',text:'Conteúdo, identidade e estrutura são transformados em uma experiência feita para você.'},
  {number:'03',title:'Você revisa no preview',text:'Confira cada detalhe em um endereço reservado antes de qualquer mudança ir ao ar.'},
  {number:'04',title:'Publicamos e você assume',text:'O site entra no seu domínio e o painel fica pronto para as próximas atualizações.'}
];

const defaultAssurances=['Identidade própria','Painel simples','Preview antes de publicar','Responsivo por padrão'];
const defaultMarqueeItems=[
  'IDENTIDADE DIGITAL ◆','DESIGN RESPONSIVO ◆','PAINEL DE CONTEÚDO ◆','DOMÍNIO PRÓPRIO ◆',
  'SITES COM IDENTIDADE ◆','GESTÃO SEM COMPLICAÇÃO ◆','PREVIEW ANTES DE PUBLICAR ◆','PERFORMANCE EM QUALQUER TELA ◆',
  'IDENTIDADE DIGITAL ◆','DESIGN RESPONSIVO ◆','PAINEL DE CONTEÚDO ◆','DOMÍNIO PRÓPRIO ◆'
];

const defaultServices=[
  {number:'01',title:'Portfólio profissional',text:'Uma presença autoral para apresentar sua trajetória, projetos, serviços e formas de contato.',items:['Identidade sob medida','Conteúdo organizado','Painel para atualizar']},
  {number:'02',title:'Site institucional',text:'Uma base sólida para negócios que precisam explicar o que fazem e transformar visitas em oportunidades.',items:['Páginas estratégicas','Formulário de leads','Experiência responsiva']},
  {number:'03',title:'Landing page',text:'Uma página direta para divulgar um serviço, validar uma ideia ou conduzir uma campanha específica.',items:['Mensagem objetiva','Chamada para ação','Publicação rápida']}
];

const defaultCommitments=[
  {label:'ESCOPO',title:'Tudo definido antes',text:'Você sabe o que será criado, quais conteúdos entram e como será a entrega.'},
  {label:'PREVIEW',title:'Nada vai ao ar no escuro',text:'O site fica disponível para revisão em um endereço reservado antes da publicação.'},
  {label:'CONTROLE',title:'O conteúdo continua seu',text:'Depois da entrega, o painel permite atualizar textos, imagens e informações.'},
  {label:'SUPORTE',title:'Acompanhamento de verdade',text:'Você recebe orientação para revisar, publicar e assumir a gestão do projeto.'}
];

const defaultQuestions=[
  {question:'Preciso ter todo o conteúdo pronto?',answer:'Não. Podemos começar organizando sua ideia, suas referências e o material que já existe. A estrutura do site ajuda a revelar o que ainda precisa ser produzido.'},
  {question:'Consigo atualizar o site sozinho?',answer:'Sim. Textos, imagens e informações principais ficam reunidos em um painel simples. Você confere as mudanças no preview e decide quando publicar.'},
  {question:'O site funciona bem no celular?',answer:'Sim. Cada projeto é desenvolvido e revisado para computador, tablet e celular, com atenção a leitura, navegação, imagens e formulários.'},
  {question:'Domínio e hospedagem estão incluídos?',answer:'A configuração é orientada conforme a necessidade do projeto. Antes de começar, você recebe uma definição clara do que será contratado, configurado e mantido.'},
  {question:'Quanto tempo leva para ficar pronto?',answer:'O prazo depende do tamanho do site e da disponibilidade do conteúdo. Depois do briefing, você recebe um escopo com etapas e previsão de entrega.'},
  {question:'Como começamos?',answer:'Envie o formulário ou chame pelo WhatsApp. Primeiro entendemos seu objetivo; depois você recebe os próximos passos, sem compromisso.'}
];

export function HomeSite({content={},preview=false,publishedProjects=[]}:{content?:RootSiteContent;preview?:boolean;publishedProjects?:HomeProjectCase[]}){
  const value=(key:string,fallback:string)=>rootValue(content,key,fallback);
  const lines=(raw:string)=>raw.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
  const projectCases=mergeHomeProjectCases(parseHomeProjectCases(value('projects_cases',defaultProjectCasesText)),publishedProjects);
  const marqueeItems=lines(value('marquee_items',defaultMarqueeItems.map(item=>item.replace(/ ◆$/,'')).slice(0,8).join('\n'))).map(item=>`${item} ◆`);
  const marqueeSequence=Array.from({length:Math.ceil(8/marqueeItems.length)},()=>marqueeItems).flat();
  const steps=lines(value('process_steps',defaultSteps.map(item=>`${item.title} | ${item.text}`).join('\n'))).map((item,index)=>{const [title,...text]=item.split('|');return{number:String(index+1).padStart(2,'0'),title:title.trim(),text:text.join('|').trim()}}).filter(item=>item.title&&item.text);
  const assurances=lines(value('assurances',defaultAssurances.join('\n')));
  const services=lines(value('services',defaultServices.map(item=>`${item.title} | ${item.text} | ${item.items.join('; ')}`).join('\n'))).map((item,index)=>{const [title,text='',rawItems='']=item.split('|');return{number:String(index+1).padStart(2,'0'),title:title.trim(),text:text.trim(),items:rawItems.split(';').map(part=>part.trim()).filter(Boolean)}}).filter(item=>item.title);
  const commitments=lines(value('commitments',defaultCommitments.map(item=>`${item.label} | ${item.title} | ${item.text}`).join('\n'))).map(item=>{const [label,title='',...text]=item.split('|');return{label:label.trim(),title:title.trim(),text:text.join('|').trim()}}).filter(item=>item.label&&item.title);
  const questions=lines(value('faq',defaultQuestions.map(item=>`${item.question} | ${item.answer}`).join('\n'))).map(item=>{const [question,...answer]=item.split('|');return{question:question.trim(),answer:answer.join('|').trim()}}).filter(item=>item.question&&item.answer);
  return <main className={`${styles.site} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`} data-home-root>
    <HomeMotion/>
    <HomeHeader/>

    {preview?<div style={{position:'fixed',zIndex:1000,top:12,left:'50%',transform:'translateX(-50%)',padding:'8px 14px',borderRadius:999,background:'#e3bb3d',color:'#082e25',font:'700 11px Inter,sans-serif',boxShadow:'0 8px 30px rgba(0,0,0,.18)'}}>PREVIEW DA RAIZ · NÃO PUBLICADO</div>:null}

    <section className={styles.hero} id="inicio">
      <div className={styles.heroGlow}/>
      <div className={styles.heroCopy} data-reveal>
        <span className={styles.eyebrow}><i/> {value('hero_eyebrow','Sites autorais · gestão simples')}</span>
        <h1>{value('hero_title','Seu trabalho merece um site à')} <em>{value('hero_emphasis','altura.')}</em></h1>
        <p>{value('hero_description','A WebAppCap cria sites profissionais com personalidade, desempenho e um painel simples para você manter tudo atualizado.')}</p>
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
        {[0,1].map(group=><div className={styles.marqueeGroup} key={group}>{marqueeSequence.map((item,index)=><span key={index}>{item}</span>)}</div>)}
      </div>
    </div>

    <section className={styles.intro} id="como-funciona">
      <div className={styles.sectionLabel} data-reveal><span>01</span> Do primeiro contato à publicação</div>
      <div className={styles.introCopy}>
        <h2 data-reveal>{value('process_title','Um caminho simples até o seu site.')}</h2>
        <p data-reveal data-reveal-delay="100">{value('process_description','Você não precisa entender de código, hospedagem ou configuração. A WebAppCap organiza o processo e deixa as decisões importantes nas suas mãos.')}</p>
      </div>
      <div className={styles.processGrid}>{steps.map((item,index)=><article key={item.number} data-motion-process={index} data-reveal data-reveal-delay={String(index*80)}><span>{item.number}</span><i aria-hidden="true"/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <div className={styles.assuranceStrip}>{assurances.map((item,index)=><span key={item} data-reveal data-reveal-delay={String(index*65)}><i aria-hidden="true">✓</i>{item}</span>)}</div>
    </section>

    <section className={styles.control} id="painel">
      <div className={styles.controlCopy} data-reveal>
        <div className={`${styles.sectionLabel} ${styles.lightLabel}`}><span>02</span> Seu site continua nas suas mãos</div>
        <h2>{value('control_title','Mude o conteúdo.')}<br/><em>{value('control_emphasis','Não o código.')}</em></h2>
        <p>{value('control_description','O painel reúne o que você precisa para manter o site vivo. Edite com tranquilidade, confira o resultado e escolha quando publicar.')}</p>
        <ol className={styles.controlSteps}>
          <li><span>01</span><div><strong>Edite</strong><small>Textos, imagens e informações em campos claros.</small></div></li>
          <li><span>02</span><div><strong>Confira</strong><small>O preview mostra as mudanças antes do público.</small></div></li>
          <li><span>03</span><div><strong>Publique</strong><small>Quando estiver pronto, coloque a nova versão no ar.</small></div></li>
        </ol>
      </div>
      <div className={styles.dashboardDemo} aria-label="Demonstração visual do painel WebAppCap" data-reveal data-reveal-delay="120">
        <div className={styles.demoTop}><span><i/><i/><i/></span><small>painel.webappcap.com.br</small><b>ONLINE</b></div>
        <div className={styles.demoBody}>
          <aside><strong><i>W</i> WebAppCap</strong><span className={styles.demoActive} data-motion-demo="edit">▣ Conteúdo</span><span>▧ Aparência</span><span>◫ Mídia</span><span>◇ Domínio</span><span>◎ Leads</span></aside>
          <div className={styles.demoContent}>
            <div className={styles.demoHeader}><div><small>CONTEÚDO</small><h3>Seu site, do seu jeito.</h3></div><span data-motion-demo="preview">Preview ↗</span></div>
            <div className={styles.demoNotice} data-motion-demo="edit"><i/>Alterações salvas no rascunho. Confira no preview antes de publicar.</div>
            <div className={styles.demoFields}><label data-motion-demo="edit"><span>Título principal</span><b>Seu trabalho merece um site à altura.</b></label><label data-motion-demo="preview"><span>Texto de apresentação</span><b>Uma presença digital feita para crescer com você.</b></label></div>
            <div className={styles.demoActions}><span>Rascunho atualizado</span><button data-motion-demo="publish" type="button" tabIndex={-1}>Publicar alterações</button></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.projects} id="projetos">
      <div className={styles.projectsHeader} data-reveal>
        <div className={styles.sectionLabel}><span>03</span> Projetos em destaque</div>
        <div><h2>{value('projects_title','Ideias diferentes. Uma plataforma que se adapta.')}</h2><p>{value('projects_description','Do portfólio editorial à loja digital, o WebAppCap muda de forma sem perder gestão, performance e identidade.')}</p></div>
      </div>
      <HomeProjectCarousel count={projectCases.length}>
        {projectCases.map((project,index)=><article className={projectStyles.caseCard} data-reveal data-case-index={index} key={`${project.name}-${index}`}>
          <a className={projectStyles.preview} href={project.url} target="_blank" rel="noreferrer" aria-label={`Abrir projeto ${project.name}`}>
            <div className={projectStyles.browserBar}><i/><i/><i/><span>{project.url.replace(/^https?:\/\//,'').replace(/\/$/,'')}</span></div>
            {project.name==='Gabriel Capellari'?
              <div className={projectStyles.portfolioPreview}>
                <Image src="/assets/media/hero-gabriel.jpg" alt="" fill sizes="(max-width: 800px) 100vw, 54vw"/>
                <div className={projectStyles.portfolioTop}><span>🇧🇷　🇬🇧</span><span>IBITINGA · SP · BR</span></div>
                <div className={projectStyles.portfolioName}><span>Gabriel</span><em>Capellari”</em><small>Jornalista de Poker · Professor · Redator</small><b>Ver meu trabalho ↘</b></div>
              </div>
              :project.name==='Vet-se'?
              <div className={projectStyles.storePreview}>
                <div className={projectStyles.storeTop}><strong>Vet-se</strong><span>Início　 Catálogo　 Carrinho　 Sobre</span><b>Ver produtos</b></div>
                <div className={projectStyles.storeHero}><Image src="/assets/media/vet-hero.webp" alt="" fill sizes="(max-width: 800px) 100vw, 54vw"/><div><h3>Vet-se</h3><p>Adesivos · Chaveiros · Mimos · Bottons · Ecobags e mais</p><em>Feito com amor especialmente para você!</em></div></div>
              </div>:
              <div className={projectStyles.genericPreview}>
                {project.image?<img src={project.image} alt="" loading="lazy" decoding="async"/>:null}
                <div><small>{project.category}</small><h3>{project.name}</h3><span>Conhecer projeto ↗</span></div>
              </div>}
          </a>
          <div className={projectStyles.info}>
            <span className={projectStyles.caseNumber}>ESTUDO DE CASO · {String(index+1).padStart(2,'0')}</span>
            <div><span className={projectStyles.live}><i/> NO AR</span><small>{project.category}</small><h3>{project.name}</h3><p>{project.description}</p></div>
            {project.facts.length?<div className={projectStyles.facts}>{project.facts.map(fact=><span key={fact.label}><b>{fact.label}</b>{fact.text}</span>)}</div>:null}
            {project.tags.length?<div className={projectStyles.tags}>{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>:null}
            <a className={projectStyles.visit} href={project.url} target="_blank" rel="noreferrer">Visitar projeto <span>↗</span></a>
          </div>
        </article>)}
      </HomeProjectCarousel>
    </section>

    <section className={styles.services} id="servicos">
      <div className={styles.servicesHeader} data-reveal>
        <div className={`${styles.sectionLabel} ${styles.lightLabel}`}><span>04</span> Formatos de projeto</div>
        <div><h2>{value('services_title','O ponto de partida para a sua presença digital.')}</h2><p>{value('services_description','Cada site nasce de uma necessidade diferente. Escolha o formato mais próximo da sua ideia — o escopo final é sempre ajustado ao seu projeto.')}</p></div>
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
      <div className={styles.trustIntro} data-reveal><div className={styles.sectionLabel}><span>05</span> Confiança</div><h2>{value('trust_title','Clareza do primeiro contato à publicação.')}</h2><p>{value('trust_description','Um bom site também depende de um bom processo. Estes são os compromissos que orientam cada projeto WebAppCap.')}</p></div>
      <div className={styles.commitmentGrid}>{commitments.map((item,index)=><article key={item.label} data-reveal data-reveal-delay={String(index*70)}><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </section>

    <section className={styles.faq} id="duvidas">
      <div className={styles.faqHeading} data-reveal><div className={styles.sectionLabel}><span>06</span> Antes de começar</div><h2>Perguntas que ajudam a tirar a ideia do papel.</h2></div>
      <div className={styles.faqList} data-reveal data-reveal-delay="100">{questions.map((item,index)=><details key={item.question}><summary><span>{String(index+1).padStart(2,'0')}</span>{item.question}<i aria-hidden="true">+</i></summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className={styles.contact} id="contato">
      <div className={styles.contactPitch} data-reveal>
        <span className={styles.contactKicker}>07 · {value('contact_kicker','TEM UM PROJETO EM MENTE?').replace(/^\s*0?[67]\s*[·.–-]\s*/,'')}</span>
        <h2>{value('contact_title','Vamos colocar sua ideia')} <em>{value('contact_emphasis','no ar.')}</em></h2>
        <p>{value('contact_description','Conte o que você precisa. Eu organizo o projeto e retorno com os próximos passos para transformar a ideia em um site com identidade.')}</p>
        <div className={styles.contactDirect}>
          <span>Prefere conversar agora?</span>
          <a href={`https://wa.me/${value('whatsapp','5516997168229').replace(/\D/g,'')}?text=Ol%C3%A1%2C%20Gabriel!%20Quero%20conversar%20sobre%20um%20site.`} target="_blank" rel="noreferrer">WhatsApp ↗</a>
          <a href={`mailto:${value('email','gcapellari1@gmail.com')}`}>{value('email','gcapellari1@gmail.com')}</a>
        </div>
      </div>
      <div className={styles.contactForm} data-reveal data-reveal-delay="120"><HomeLeadForm/></div>
    </section>

    <footer className={styles.footer}><a className={styles.brand} href="#inicio"><span>W</span>WebAppCap</a><p>{value('footer_tagline','Sites com identidade. Gestão sem complicação.')}</p><span>© 2026 WEBAPPCAP</span></footer>
  </main>;
}
