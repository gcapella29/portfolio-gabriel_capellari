'use client';
import {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  institutionalInstagram,
  institutionalData,
  institutionalImage,
  institutionalImageStyle,
} from '@/core/institutional-content';
import type {TemplateRenderProps} from '../types';
import {InstitutionalContext} from './context';
import {
  Stats,
  Projects,
  Donations,
  Campaigns,
  Timeline,
  Values,
  Management,
  AlbumChips,
  Albums,
  ContactInfo,
  ContactForm,
  Lightbox,
} from './sections';
const views = ['inicio', 'historia', 'gestao', 'fotos', 'contato'];
export function InstitutionalMainTemplate({
  project,
  data,
}: TemplateRenderProps) {
  const host = useRef<HTMLDivElement>(null),
    root = useRef<HTMLDivElement>(null),
    alive = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    frame = useRef<number | null>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null),
    [view, setView] = useState('inicio'),
    [album, setAlbum] = useState('todos'),
    [photo, setPhoto] = useState<{src: string; caption: string} | null>(null),
    [toast, setToast] = useState('');
  const model = useMemo(() => {
    const number = String(data.contact.whatsapp || '').replace(/\D/g, '');
    return {
      ...institutionalData(data.content),
      name: String(data.identity.name || project.name),
      contact: data.contact,
      wa: (message = '') =>
        /^\d{10,15}$/.test(number)
          ? `https://wa.me/${number}${message ? '?text=' + encodeURIComponent(message) : ''}`
          : undefined,
    };
  }, [data.content, data.identity.name, data.contact, project.name]);
  const {copy, name, visible} = model;
  const instagram = institutionalInstagram(data.contact.instagram);
  useEffect(() => {
    alive.current = true;
    if (!host.current) return;
    const shadow =
        host.current.shadowRoot || host.current.attachShadow({mode: 'open'}),
      sheet = document.createElement('link'),
      bridge = document.createElement('style'),
      target = document.createElement('div');
    sheet.rel = 'stylesheet';
    sheet.href = '/templates/institutional/styles.css';
    const refinements = document.createElement('link');
    refinements.rel = 'stylesheet';
    refinements.href = '/templates/institutional/refinements.css';
    bridge.textContent = `:host{display:block}.institutional-document{--ink:#0f1d33;--blue:#1f3a64;--gold:#b8863b;--gold-l:#d4a24c;--paper:#f6f1e7;--card:#fffdf8;--muted:#55607a;--line:rgba(15,29,51,.14);--max:1160px;--serif:"Cormorant Garamond",Georgia,serif;--sans:"Source Sans 3",system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.6;-webkit-font-smoothing:antialiased}.institutional-document section{scroll-margin-top:var(--top-height,120px)}.card-media{aspect-ratio:16/10;overflow:hidden}.card-media img{height:100%;width:100%}.date{z-index:1}.photo img{transform:scale(var(--photo-scale,1))}.photo:hover img{transform:scale(calc(var(--photo-scale,1)*1.06))}.lb-x{display:grid;place-items:center}.brand{white-space:normal;min-width:0}.mono{flex-shrink:0}@media(max-width:640px){.form input,.form select,.form textarea{font-size:16px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
    shadow.append(sheet, bridge, refinements, target);
    setMount(target);
    let font = document.querySelector<HTMLLinkElement>(
      'link[data-institutional-font]',
    );
    if (!font) {
      font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href =
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap';
      font.dataset.institutionalFont = '';
      document.head.append(font);
    }
    font.dataset.users = String(Number(font.dataset.users || 0) + 1);
    return () => {
      alive.current = false;
      sheet.remove();
      refinements.remove();
      bridge.remove();
      target.remove();
      font.dataset.users = String(Number(font.dataset.users || 1) - 1);
      if (font.dataset.users === '0') font.remove();
      if (timer.current) clearTimeout(timer.current);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);
  useEffect(() => {
    if (!mount) return;
    const route = () => {
      const hash = window.location.hash.slice(1),
        next = views.includes(hash) && (hash === 'inicio' || visible[hash as 'historia'|'gestao'|'fotos'|'contato']) ? hash : 'inicio';
      setView(next);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        if (['projetos', 'doacoes', 'campanhas'].includes(hash) && visible[hash as 'projetos'|'doacoes'|'campanhas'])
          root.current?.querySelector(`#${hash}`)?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'auto'
              : 'smooth',
          });
        else window.scrollTo(0, 0);
      });
    };
    route();
    window.addEventListener('hashchange', route);
    return () => {
      window.removeEventListener('hashchange', route);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [mount, visible]);
  useEffect(() => {
    if (!mount) return;
    const top = root.current?.querySelector<HTMLElement>('.top');
    if (!top) return;
    const measure = () =>
      root.current?.style.setProperty(
        '--top-height',
        `${Math.ceil(top.getBoundingClientRect().height) + 16}px`,
      );
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(top);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mount]);
  useEffect(() => {
    if (!mount || !root.current) return;
    const nodes = root.current.querySelectorAll(
      '.view:not([hidden]) .head,.view:not([hidden]) .card,.view:not([hidden]) .don,.view:not([hidden]) .tl,.view:not([hidden]) .person,.view:not([hidden]) .album,.view:not([hidden]) .info>div,.view:not([hidden]) .form',
    );
    nodes.forEach((node, index) => {
      node.classList.add('reveal');
      (node as HTMLElement).style.setProperty(
        '--reveal-delay',
        `${Math.min(index % 6, 3) * 55}ms`,
      );
    });
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach((node) => node.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        }),
      {threshold: 0.08},
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [mount, view, album, model.lists]);
  const notify = (message: string) => {
    if (!alive.current) return;
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 2200);
  };
  const navigate = (event: React.MouseEvent) => {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (
      !anchor ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const hash = anchor.getAttribute('href')!;
    if (window.location.hash === hash) {
      event.preventDefault();
      if (['projetos', 'doacoes', 'campanhas'].includes(hash.slice(1)))
        root.current?.querySelector(hash)?.scrollIntoView();
      else window.scrollTo(0, 0);
    }
  };
  return (
    <div ref={host}>
      {mount
        ? createPortal(
            <InstitutionalContext.Provider
              value={{model, album, setAlbum, photo, setPhoto, notify}}
            >
              <div
                className="institutional-document"
                ref={root}
                onClick={navigate}
              >
                <header className="top">
                  <div className="wrap top-in">
                    <a className="brand" href="#inicio">
                      <span className="mono">
                        {name.trim().charAt(0).toUpperCase()}
                      </span>
                      {name}
                    </a>
                    <nav className="tabs" aria-label="Principal">
                      <a
                        href="#inicio"
                        aria-current={view === 'inicio' ? 'page' : undefined}
                      >
                        {copy.institutional_main_nav_home}
                      </a>
                      <a
                        hidden={!visible.historia} href="#historia"
                        aria-current={view === 'historia' ? 'page' : undefined}
                      >
                        {copy.institutional_main_nav_history}
                      </a>
                      <a
                        hidden={!visible.gestao} href="#gestao"
                        aria-current={view === 'gestao' ? 'page' : undefined}
                      >
                        {copy.institutional_main_nav_management}
                      </a>
                      <a
                        hidden={!visible.fotos} href="#fotos"
                        aria-current={view === 'fotos' ? 'page' : undefined}
                      >
                        {copy.institutional_main_nav_photos}
                      </a>
                      <a
                        hidden={!visible.contato} href="#contato"
                        aria-current={view === 'contato' ? 'page' : undefined}
                      >
                        {copy.institutional_main_nav_contact}
                      </a>
                    </nav>
                    <a className="give" hidden={!visible.contato} href="#contato">
                      {copy.institutional_main_help_cta}
                    </a>
                  </div>
                </header>

                <main>
                  <div
                    className="view"
                    data-view="inicio"
                    hidden={view !== 'inicio'}
                  >
                    <div className="hero" hidden={!visible.hero}>
                      {institutionalImage(data.media.hero) ? (
                        <div className="hero-image" aria-hidden="true">
                          <img
                            src={institutionalImage(data.media.hero)}
                            style={institutionalImageStyle(data.media.hero)}
                            alt=""
                            fetchPriority="high"
                          />
                        </div>
                      ) : null}
                      <div className="wrap">
                        <p className="kick" style={{color: 'var(--gold-l)'}}>
                          {copy.institutional_main_hero_kicker}
                        </p>
                        <h1>
                          {copy.hero_title}{' '}
                          <em>{copy.institutional_main_hero_emphasis}</em>
                        </h1>
                        <p>{copy.hero_text}</p>
                        <div className="cta">
                          <a className="btn btn-gold" hidden={!visible.projetos} href="#projetos">
                            {copy.institutional_main_projects_cta}
                          </a>
                          <a className="btn btn-line" hidden={!visible.contato} href="#contato">
                            {copy.institutional_main_donation_cta}
                          </a>
                          {instagram ? (
                            <a
                              className="btn btn-line"
                              href={instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {copy.institutional_main_instagram_cta}
                            </a>
                          ) : null}
                        </div>
                        {visible.stats ? <Stats /> : null}
                      </div>
                    </div>
                    <div className="sub" hidden={!visible.projetos && !visible.doacoes && !visible.campanhas}>
                      <div className="wrap">
                        <a hidden={!visible.projetos} href="#projetos">
                          {copy.institutional_main_sub_projects}
                        </a>
                        <a hidden={!visible.doacoes} href="#doacoes">
                          {copy.institutional_main_sub_donations}
                        </a>
                        <a hidden={!visible.campanhas} href="#campanhas">
                          {copy.institutional_main_sub_campaigns}
                        </a>
                      </div>
                    </div>

                    <section hidden={!visible.projetos} id="projetos">
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_projects_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_projects_title}
                            <br />
                            {copy.institutional_main_projects_title_end}
                          </h2>
                          <p className="lead">
                            {copy.institutional_main_projects_intro}
                          </p>
                        </div>
                        <Projects />
                      </div>
                    </section>

                    <section hidden={!visible.doacoes} id="doacoes" className="alt">
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_donations_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_donations_title}
                            <br />
                            {copy.institutional_main_donations_title_end}
                          </h2>
                          <p className="lead">
                            {copy.institutional_main_donations_intro}
                          </p>
                        </div>
                        <Donations />
                      </div>
                    </section>

                    <section hidden={!visible.campanhas} id="campanhas">
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_campaigns_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_campaigns_title}
                            <br />
                            {copy.institutional_main_campaigns_title_end}
                          </h2>
                          <p className="lead">
                            {copy.institutional_main_campaigns_intro}
                          </p>
                        </div>
                        <Campaigns />
                      </div>
                    </section>

                    <section className="band" hidden={!visible.band || !visible.contato}>
                      <div className="wrap">
                        <h2>{copy.institutional_main_band_title}</h2>
                        <p>{copy.institutional_main_band_text}</p>
                        <a className="btn btn-dark" hidden={!visible.contato} href="#contato">
                          {copy.institutional_main_contact_cta}
                        </a>
                      </div>
                    </section>
                  </div>

                  <div
                    className="view"
                    data-view="historia"
                    hidden={view !== 'historia' || !visible.historia}
                  >
                    <section>
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_history_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_history_title}
                            <br />
                            {copy.institutional_main_history_title_end}
                          </h2>
                          <p className="lead">{model.historyIntro}</p>
                        </div>
                        <Timeline />
                        <div className="vals" hidden={!visible.valores}>
                          <p className="kick">
                            {copy.institutional_main_values_kicker}
                          </p>
                          <Values />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div
                    className="view"
                    data-view="gestao"
                    hidden={view !== 'gestao' || !visible.gestao}
                  >
                    <section>
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_management_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_management_title}
                            <br />
                            {name}{' '}
                            {copy.institutional_main_management_title_end}
                          </h2>
                        </div>

                        <Management />
                      </div>
                    </section>
                  </div>

                  <div
                    className="view"
                    data-view="fotos"
                    hidden={view !== 'fotos' || !visible.fotos}
                  >
                    <section>
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_photos_kicker}
                          </p>
                          <h2>
                            {copy.institutional_main_photos_title}
                            <br />
                            {copy.institutional_main_photos_title_end}
                          </h2>
                          <p className="lead">
                            {copy.institutional_main_photos_intro}
                          </p>
                        </div>
                        <AlbumChips />
                        <Albums />
                      </div>
                    </section>
                  </div>

                  <div
                    className="view"
                    data-view="contato"
                    hidden={view !== 'contato' || !visible.contato}
                  >
                    <section>
                      <div className="wrap">
                        <div className="head">
                          <p className="kick">
                            {copy.institutional_main_contact_kicker}
                          </p>
                          <h2>{copy.institutional_main_contact_title}</h2>
                          <p className="lead">
                            {copy.institutional_main_contact_intro}
                          </p>
                        </div>
                        <div className="contact">
                          <ContactInfo />
                          <ContactForm />
                        </div>
                      </div>
                    </section>
                  </div>
                </main>

                <footer>
                  <div className="wrap foot">
                    <div>{`© ${new Date().getFullYear()} ${name} · ${copy.institutional_main_footer_description}`}</div>
                    <div>
                      {copy.institutional_main_footer_credit}
                      <a
                        href="https://webappcap.com.br"
                        target="_blank"
                        rel="noopener"
                      >
                        {copy.institutional_main_footer_brand}
                      </a>
                    </div>
                  </div>
                </footer>

                <Lightbox />
                <div
                  className={`toast ${toast ? 'show' : ''}`}
                  role="status"
                  aria-live="polite"
                >
                  {toast}
                </div>
              </div>
            </InstitutionalContext.Provider>,
            mount,
          )
        : null}
    </div>
  );
}
