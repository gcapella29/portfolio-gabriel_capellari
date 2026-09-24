import type {ReactNode} from 'react';
import Link from 'next/link';
import {requirePlatformOwner} from '@/core/session';
import {readRootDraft,rootValue} from '@/core/root-site';
import {logoutRootAction,publishRootAction,saveRootDraftAction} from './actions';
import dashboardStyles from '../../dashboard/[slug]/dashboard.module.css';
import styles from './root-editor.module.css';

const field=(draft:Record<string,string>,name:string,label:string,fallback:string,wide=false,area=false)=><label className={`${styles.field} ${wide?styles.wide:''}`}><span>{label}</span>{area?<textarea name={name} rows={3} defaultValue={rootValue(draft,name,fallback)}/>:<input name={name} defaultValue={rootValue(draft,name,fallback)}/>}</label>;

function Block({id,title,description,children,open=false}:{id:string;title:string;description:string;children:ReactNode;open?:boolean}){
 return <details className={styles.section} id={id} open={open}><summary><span className={styles.sectionIcon}>≡</span><span className={styles.sectionTitle}><strong>{title}</strong><small>{description}</small></span><i className={styles.plus}>+</i></summary><div className={styles.sectionBody}><div className={styles.grid}>{children}</div></div></details>;
}

export default async function RootEditorPage({searchParams}:{searchParams:Promise<{saved?:string;published?:string}>}){
 await requirePlatformOwner();
 const query=await searchParams,{draft,publishedAt}=await readRootDraft();
 return <div className={dashboardStyles.shell}>
  <aside className={dashboardStyles.sidebar}>
   <Link href="/owner/projects" className={dashboardStyles.brand}><span className={dashboardStyles.brandMark}>W</span><span className={dashboardStyles.brandText}><strong>WebAppCap</strong><small>Área do owner</small></span></Link>
   <div className={dashboardStyles.projectMini}><span>Owner</span><strong>WebAppCap — Raiz</strong><small>{publishedAt?'Site publicado':'Em configuração'}</small></div>
   <nav className={dashboardStyles.nav} aria-label="Gerenciamento do projeto raiz">
    <Link href="/owner/projects"><i aria-hidden="true">⌂</i><span>Projetos</span></Link>
    <Link href="/owner/root"><i aria-hidden="true">≡</i><span>Conteúdo</span></Link>
    <Link href="/owner/root/preview" target="_blank"><i aria-hidden="true">◐</i><span>Preview</span></Link>
    <a href="https://www.webappcap.com.br" target="_blank" rel="noreferrer"><i aria-hidden="true">↗</i><span>Ver site</span></a>
   </nav>
   <div className={dashboardStyles.sidebarBottom}><Link href="/owner/projects">← Trocar projeto</Link><form action={logoutRootAction}><button type="submit" className={dashboardStyles.logout}>Sair</button></form></div>
  </aside>
  <main className={dashboardStyles.main}>
   <header className={dashboardStyles.topbar}><div className={dashboardStyles.topIdentity}><span>PROJETO</span><strong>WebAppCap — Raiz</strong></div><div className={dashboardStyles.topActions}>
    <Link className={dashboardStyles.buttonGhost} href="/owner/root/preview" target="_blank">Preview ↗</Link>
    <a className={dashboardStyles.buttonGhost} href="https://www.webappcap.com.br" target="_blank" rel="noreferrer">Ver site ↗</a>
    <form action={publishRootAction}><button className={dashboardStyles.publish}>Publicar</button></form>
   </div></header>
   <div className={`${dashboardStyles.content} ${dashboardStyles.pageFrame}`}>
    <div className={styles.editor}>
     <header className={styles.header}><span>PROJETO RAIZ</span><h1>Edite o site institucional.</h1><p>Atualize os textos por seção, salve o rascunho e revise no Preview antes de publicar.</p></header>
     {query.saved?<div className={styles.notice} role="status">Rascunho salvo. Confira no Preview antes de publicar.</div>:null}
     {query.published?<div className={styles.notice} role="status">Raiz publicada com sucesso.</div>:null}
     <nav className={styles.sectionNav} aria-label="Seções do conteúdo">
      <a href="#abertura">Abertura</a><a href="#processo">Processo e painel</a><a href="#fundador">Projeto fundador</a><a href="#servicos">Serviços e dúvidas</a><a href="#contato">Contato e rodapé</a>
     </nav>
     <form action={saveRootDraftAction} className={styles.form}>
      <Block id="abertura" title="Abertura" description="Título, apresentação e primeira mensagem do site" open>{field(draft,'hero_eyebrow','Linha de contexto','Sites autorais · gestão simples')}{field(draft,'hero_title','Título','Seu trabalho merece um site à')}{field(draft,'hero_emphasis','Destaque','altura.')}{field(draft,'hero_description','Apresentação','A WebAppCap cria sites profissionais com personalidade, desempenho e um painel simples para você manter tudo atualizado.',true,true)}</Block>
      <Block id="processo" title="Movimento, processo e painel" description="Faixa animada, etapas, diferenciais e apresentação do painel">{field(draft,'marquee_items','Textos da faixa · um por linha','IDENTIDADE DIGITAL\nDESIGN RESPONSIVO\nPAINEL DE CONTEÚDO\nDOMÍNIO PRÓPRIO',true,true)}{field(draft,'process_title','Título do processo','Um caminho simples até o seu site.')}{field(draft,'process_description','Descrição do processo','Você não precisa entender de código, hospedagem ou configuração. A WebAppCap organiza o processo e deixa as decisões importantes nas suas mãos.',false,true)}{field(draft,'process_steps','Etapas · Título | descrição','Você conta sua ideia | Entendemos seu trabalho, seu público e o que o site precisa alcançar.\nCriamos sua presença | Conteúdo, identidade e estrutura são transformados em uma experiência feita para você.\nVocê revisa no preview | Confira cada detalhe em um endereço reservado antes de qualquer mudança ir ao ar.\nPublicamos e você assume | O site entra no seu domínio e o painel fica pronto para as próximas atualizações.',true,true)}{field(draft,'assurances','Diferenciais · um por linha','Identidade própria\nPainel simples\nPreview antes de publicar\nResponsivo por padrão',true,true)}{field(draft,'control_title','Título do painel','Mude o conteúdo.')}{field(draft,'control_emphasis','Destaque do painel','Não o código.')}{field(draft,'control_description','Descrição do painel','O painel reúne o que você precisa para manter o site vivo. Edite com tranquilidade, confira o resultado e escolha quando publicar.',true,true)}</Block>
      <Block id="fundador" title="Projeto fundador" description="Apresentação do portfólio que deu origem à plataforma">{field(draft,'projects_title','Título','Primeiro usamos em casa.')}{field(draft,'project_name','Nome do projeto','Gabriel Capellari')}{field(draft,'projects_description','Introdução','O portfólio de Gabriel Capellari nasceu como site independente e se tornou o primeiro projeto completo construído sobre a base do WebAppCap.',true,true)}{field(draft,'project_description','Descrição do projeto','Um portfólio editorial que reúne trajetória, coberturas internacionais, trabalhos publicados e contato — com conteúdo gerenciado pelo próprio painel.',true,true)}{field(draft,'portfolio_url','Endereço do portfólio','https://capellari.webappcap.com.br',true)}</Block>
      <Block id="servicos" title="Serviços, confiança e dúvidas" description="Serviços oferecidos, compromissos e perguntas frequentes">{field(draft,'services_title','Título de serviços','O ponto de partida para a sua presença digital.')}{field(draft,'trust_title','Título de confiança','Clareza do primeiro contato à publicação.')}{field(draft,'services_description','Descrição de serviços','Cada site nasce de uma necessidade diferente. Escolha o formato mais próximo da sua ideia — o escopo final é sempre ajustado ao seu projeto.',false,true)}{field(draft,'trust_description','Descrição de confiança','Um bom site também depende de um bom processo. Estes são os compromissos que orientam cada projeto WebAppCap.',false,true)}{field(draft,'services','Serviços · Título | descrição | itens separados por ;','Portfólio profissional | Uma presença autoral para apresentar sua trajetória, projetos, serviços e formas de contato. | Identidade sob medida; Conteúdo organizado; Painel para atualizar\nSite institucional | Uma base sólida para negócios que precisam explicar o que fazem e transformar visitas em oportunidades. | Páginas estratégicas; Formulário de leads; Experiência responsiva\nLanding page | Uma página direta para divulgar um serviço, validar uma ideia ou conduzir uma campanha específica. | Mensagem objetiva; Chamada para ação; Publicação rápida',true,true)}{field(draft,'commitments','Compromissos · Selo | título | descrição','ESCOPO | Tudo definido antes | Você sabe o que será criado, quais conteúdos entram e como será a entrega.\nPREVIEW | Nada vai ao ar no escuro | O site fica disponível para revisão em um endereço reservado antes da publicação.\nCONTROLE | O conteúdo continua seu | Depois da entrega, o painel permite atualizar textos, imagens e informações.\nSUPORTE | Acompanhamento de verdade | Você recebe orientação para revisar, publicar e assumir a gestão do projeto.',true,true)}{field(draft,'faq','Perguntas · Pergunta | resposta','Preciso ter todo o conteúdo pronto? | Não. Podemos começar organizando sua ideia, suas referências e o material que já existe.\nConsigo atualizar o site sozinho? | Sim. Textos, imagens e informações principais ficam reunidos em um painel simples.\nO site funciona bem no celular? | Sim. Cada projeto é desenvolvido e revisado para computador, tablet e celular.\nDomínio e hospedagem estão incluídos? | A configuração é orientada conforme a necessidade do projeto.\nQuanto tempo leva para ficar pronto? | O prazo depende do tamanho do site e da disponibilidade do conteúdo.\nComo começamos? | Envie o formulário ou chame pelo WhatsApp.',true,true)}</Block>
      <Block id="contato" title="Contato e rodapé" description="Chamada final, canais de atendimento e assinatura do site">{field(draft,'contact_kicker','Chamada curta','TEM UM PROJETO EM MENTE?')}{field(draft,'contact_title','Título','Vamos colocar sua ideia')}{field(draft,'contact_emphasis','Destaque','no ar.')}{field(draft,'contact_description','Descrição','Conte o que você precisa. Eu organizo o projeto e retorno com os próximos passos para transformar a ideia em um site com identidade.',true,true)}{field(draft,'whatsapp','WhatsApp','5516997168229')}{field(draft,'email','E-mail','gcapellari1@gmail.com')}{field(draft,'footer_tagline','Frase do rodapé','Sites com identidade. Gestão sem complicação.',true)}</Block>
      <div className={styles.saveBar}><span>{publishedAt?'Existe uma versão publicada. Salve para atualizar apenas o Preview.':'Salve o rascunho e revise antes da primeira publicação.'}</span><div><Link className={styles.button} href="/owner/root/preview" target="_blank">Abrir Preview ↗</Link><button className={styles.primary} type="submit">Salvar no rascunho</button></div></div>
     </form>
    </div>
   </div>
  </main>
 </div>;
}
