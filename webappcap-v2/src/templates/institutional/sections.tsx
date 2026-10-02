'use client';
import {useEffect, useRef, useState} from 'react';
import {
  institutionalInstagram,
  campaignProgress,
  institutionalImage,
  institutionalImageStyle,
  institutionalUrl,
  type InstitutionalRow,
} from '@/core/institutional-content';
import {placeholder, useInstitutional} from './context';
const t = (value: unknown) => String(value ?? '');
const external = {target: '_blank', rel: 'noopener noreferrer'};
export function Stats() {
  const {
    model: {lists},
  } = useInstitutional();
  return (
    <div className="stats">
      {[
        [lists.institutional_projects.length, 'projetos realizados'],
        [lists.institutional_donations.length, 'doações registradas'],
        [lists.institutional_campaigns.length, 'campanhas futuras'],
        [
          lists.institutional_current_board.length +
            lists.institutional_current_members.length,
          'pessoas na gestão atual',
        ],
      ].map(([n, label]) => (
        <div key={label}>
          <strong>{n}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
export function Projects() {
  const {
    model: {lists},
  } = useInstitutional();
  return (
    <div className="grid g3">
      {lists.institutional_projects.map((p, i) => (
        <article className="card" key={p.id}>
          <div className="card-media">
            <img
              src={institutionalImage(p.image) || placeholder(t(p.title), i)}
              style={institutionalImageStyle(p.image)}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="card-b">
            <span className="tag">
              {t(p.cat)} · {t(p.date)}
            </span>
            <h3>{t(p.title)}</h3>
            <p>{t(p.text)}</p>
            <div className="impact">{t(p.impact)}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
export function Donations() {
  const {
    model: {lists},
  } = useInstitutional();
  return (
    <div>
      {lists.institutional_donations.map((d) => (
        <div className="don" key={d.id}>
          <time>{t(d.date)}</time>
          <div>
            <h3>{t(d.title)}</h3>
            <p>{t(d.to)}</p>
          </div>
          <strong>{t(d.qty)}</strong>
        </div>
      ))}
    </div>
  );
}
export function Campaigns() {
  const {
    model: {lists, wa, copy},
  } = useInstitutional();
  return (
    <div className="grid g3">
      {lists.institutional_campaigns.map((c, i) => {
        const p = campaignProgress(c),
          href = wa('Olá! Quero ajudar na campanha: ' + t(c.title));
        return (
          <article className="card camp" key={c.id}>
            <div className="date">
              <b>{t(c.day)}</b>
              {t(c.month)}
            </div>
            <div className="card-media">
              <img
                src={
                  institutionalImage(c.image) || placeholder(t(c.title), i + 1)
                }
                style={institutionalImageStyle(c.image)}
                alt=""
                loading="lazy"
              />
            </div>
            <div className="card-b">
              <h3>{t(c.title)}</h3>
              <p>{t(c.text)}</p>
              {p.goal > 0 ? (
                <>
                  <div
                    className="bar"
                    role="progressbar"
                    aria-label={`Arrecadação: ${t(c.title)}`}
                    aria-valuenow={p.value}
                    aria-valuemin={0}
                    aria-valuemax={p.goal}
                  >
                    <i style={{width: p.percent + '%'}} />
                  </div>
                  <div className="small">
                    {p.raised}
                    {t(c.unit)}
                  </div>
                </>
              ) : null}
              <a
                className="btn btn-dark"
                href={href || '#contato'}
                {...(href ? external : {})}
              >
                {copy.institutional_main_help_cta}
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
export function Timeline() {
  const {
    model: {lists},
  } = useInstitutional();
  return (
    <div className="timeline">
      {lists.institutional_timeline.map((row) => (
        <div className="tl" key={row.id}>
          <time>{t(row.year)}</time>
          <h3>{t(row.title)}</h3>
          <p>{t(row.text)}</p>
        </div>
      ))}
    </div>
  );
}
export function Values() {
  const {
    model: {lists},
  } = useInstitutional();
  return (
    <div className="grid g3">
      {lists.institutional_values.map((row) => (
        <div className="card" key={row.id}>
          <div className="card-b">
            <h3>{t(row.t)}</h3>
            <p style={{margin: 0}}>{t(row.d)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
function Avatar({person}: {person: InstitutionalRow}) {
  const {model} = useInstitutional(),
    src = institutionalImage(person.photo),
    href = institutionalInstagram(person.instagram);
  const content =
    model.showPhotos && src ? (
      <img
        src={src}
        style={institutionalImageStyle(person.photo)}
        alt={t(person.name)}
        loading="lazy"
      />
    ) : (
      t(person.name)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    );
  return href ? (
    <a
      className="avatar"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram de ${t(person.name)}`}
    >
      {content}
    </a>
  ) : (
    <div className="avatar">{content}</div>
  );
}
export function Management() {
  const {model} = useInstitutional(),
    [previous, setPrevious] = useState(false);
  const board = previous
      ? model.lists.institutional_previous_board
      : model.lists.institutional_current_board,
    members = previous
      ? model.lists.institutional_previous_members
      : model.lists.institutional_current_members;
  return (
    <>
      <div className="switch" role="tablist" aria-label="Escolher gestão">
        {[false, true].map((prior) => (
          <button
            type="button"
            role="tab"
            id={prior ? 'tAnt' : 'tAtual'}
            aria-controls="gestao"
            aria-selected={previous === prior}
            tabIndex={previous === prior ? 0 : -1}
            key={String(prior)}
            onClick={() => setPrevious(prior)}
            onKeyDown={(event) => {
              if (
                ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? false
                    : event.key === 'End'
                      ? true
                      : !previous;
                setPrevious(next);
                event.currentTarget.parentElement
                  ?.querySelector<HTMLButtonElement>(next ? '#tAnt' : '#tAtual')
                  ?.focus();
              }
            }}
          >
            {prior
              ? model.copy.institutional_main_previous_tab
              : model.copy.institutional_main_current_tab}
          </button>
        ))}
      </div>
      <div
        id="gestao"
        role="tabpanel"
        aria-labelledby={previous ? 'tAnt' : 'tAtual'}
      >
        <p className="period">
          {previous ? model.previousPeriod : model.currentPeriod}
        </p>
        <p className="kick">Diretoria</p>
        <div className="people">
          {board.map((p, i) => (
            <div className={`person ${i === 0 ? 'lead-p' : ''}`} key={p.id}>
              <Avatar person={p} />
              {i === 0 ? (
                <div>
                  <h3>{t(p.name)}</h3>
                  <span>{t(p.role)}</span>
                </div>
              ) : (
                <>
                  <h3>{t(p.name)}</h3>
                  <span>{t(p.role)}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {members.length ? (
          <>
            <h3 className="sec-t">Membros</h3>
            <div className="people members">
              {members.map((p) => (
                <div className="person" key={p.id}>
                  <Avatar person={p} />
                  <h3>{t(p.name)}</h3>
                  {p.role?<span>{t(p.role)}</span>:null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
export function AlbumChips() {
  const {model, album, setAlbum} = useInstitutional();
  return (
    <div className="chips" role="group" aria-label="Filtrar por álbum">
      {[{id: 'todos', title: 'Todos'}, ...model.lists.institutional_albums].map(
        (row) => (
          <button
            type="button"
            className="chip"
            key={row.id}
            aria-pressed={album === row.id}
            onClick={() => setAlbum(row.id)}
          >
            {t(row.title)}
          </button>
        ),
      )}
    </div>
  );
}
export function Albums() {
  const {model, album, setPhoto} = useInstitutional();
  return (
    <div>
      {model.lists.institutional_albums
        .filter((row) => album === 'todos' || row.id === album)
        .map((row) => {
          const photos =
            Array.isArray(row.photos) && row.photos.length
              ? row.photos
              : model.demo
                ? Array.from({length: Number(row.count) || 0}, (_, i) =>
                    placeholder(`${t(row.title)} ${i + 1}`, i),
                  )
                : [];
          return (
            <div className="album" key={row.id}>
              <h3>{t(row.title)}</h3>
              <p className="small">
                {t(row.date)} · {photos.length} fotos
              </p>
              <div className="photos">
                {photos.map((photo, i) => {
                  const src = institutionalImage(photo) || String(photo),
                    framing = institutionalImageStyle(photo);
                  return (
                    <button
                      type="button"
                      className="photo"
                      key={src + i}
                      aria-label={`Ampliar foto ${i + 1} de ${t(row.title)}`}
                      onClick={() => setPhoto({src, caption: t(row.title)})}
                    >
                      <img
                        src={src}
                        style={
                          {
                            ...framing,
                            transform: undefined,
                            '--photo-scale': String(framing.transform).replace(
                              /^scale\(|\)$/g,
                              '',
                            ),
                          } as React.CSSProperties
                        }
                        alt=""
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
export function Lightbox() {
  const {photo, setPhoto} = useInstitutional(),
    ref = useRef<HTMLDialogElement>(null),
    trigger = useRef<Element | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (photo) {
      trigger.current =
        dialog.getRootNode() instanceof ShadowRoot
          ? (dialog.getRootNode() as ShadowRoot).activeElement
          : document.activeElement;
      dialog.showModal();
    } else if (dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [photo]);
  return (
    <dialog
      ref={ref}
      id="lb"
      aria-label="Foto ampliada"
      onClose={() => {
        setPhoto(null);
        if (trigger.current instanceof HTMLElement) trigger.current.focus();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setPhoto(null);
      }}
    >
      <button
        type="button"
        className="lb-x"
        autoFocus
        aria-label="Fechar foto"
        onClick={() => setPhoto(null)}
      >
        ×
      </button>
      {photo ? (
        <>
          <img src={photo.src} alt={photo.caption} />
          <p>{photo.caption}</p>
        </>
      ) : null}
    </dialog>
  );
}
export function ContactInfo() {
  const {
      model: {contact, wa},
      notify,
    } = useInstitutional(),
    href = wa(),
    instagram = institutionalUrl(contact.instagram),
    email = t(contact.email);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(t(contact.pix));
      notify('Chave Pix copiada');
    } catch {
      notify('Copie a chave manualmente');
    }
  };
  return (
    <div className="info">
      {href ? (
        <div>
          <small>WhatsApp</small>
          <a href={href} {...external}>
            Chamar agora
          </a>
        </div>
      ) : null}
      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
        <div>
          <small>E-mail</small>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      ) : null}
      {contact.address ? (
        <div>
          <small>Endereço</small>
          {t(contact.address)}
        </div>
      ) : null}
      {instagram ? (
        <div>
          <small>Redes sociais</small>
          <a href={instagram} {...external}>
            Instagram ↗
          </a>
        </div>
      ) : null}
      {contact.pix ? (
        <div className="pix">
          <small>Doe por Pix</small>
          <code>{t(contact.pix)}</code>
          <span className="small" style={{color: 'rgba(255,255,255,.7)'}}>
            {t(contact.pix_name)}
          </span>
          <br />
          <button
            className="btn btn-gold"
            type="button"
            style={{marginTop: 10}}
            onClick={copy}
          >
            Copiar chave Pix
          </button>
        </div>
      ) : null}
    </div>
  );
}
export function ContactForm() {
  const {
    model: {copy, wa},
    notify,
  } = useInstitutional();
  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget,
          values = new FormData(form),
          name = t(values.get('name')).trim(),
          contact = t(values.get('contact')).trim(),
          message = t(values.get('message')).trim();
        for (const field of ['name', 'contact', 'message'])
          if (!t(values.get(field)).trim()) {
            const input = form.elements.namedItem(field) as HTMLInputElement;
            input.focus();
            input.setCustomValidity('Preencha este campo');
            input.reportValidity();
            input.setCustomValidity('');
            return;
          }
        const href = wa(
          `Olá! Aqui é ${name}.\nAssunto: ${values.get('subject')}\nContato: ${contact}\n\n${message}`,
        );
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
        else
          notify(
            'WhatsApp ainda não configurado. Use os outros canais de contato.',
          );
      }}
      noValidate
    >
      <label>
        {copy.institutional_main_form_name}
        <input name="name" autoComplete="name" required maxLength={120} />
      </label>
      <label>
        {copy.institutional_main_form_contact}
        <input name="contact" autoComplete="email" required maxLength={180} />
      </label>
      <label className="full">
        {copy.institutional_main_form_subject}
        <select name="subject">
          {[
            copy.institutional_main_subject_donation,
            copy.institutional_main_subject_volunteer,
            copy.institutional_main_subject_referral,
            copy.institutional_main_subject_partnership,
            copy.institutional_main_subject_press,
            copy.institutional_main_subject_other,
          ].map((subject, i) => (
            <option key={i}>{subject}</option>
          ))}
        </select>
      </label>
      <label className="full">
        {copy.institutional_main_form_message}
        <textarea name="message" required maxLength={3000} />
      </label>
      <button className="btn btn-dark full" type="submit">
        {copy.institutional_main_form_submit}
      </button>
      <p className="small hint">{copy.institutional_main_form_hint}</p>
    </form>
  );
}
