(() => {
  if (window.WebAppCapLeadCaptureStarted) return;
  window.WebAppCapLeadCaptureStarted = true;

  const esc = v => String(v ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');

  const validPrivacyUrl = value => {
    const u = String(value || '').trim();
    return u && (u.startsWith('/') || /^https?:\/\//i.test(u)) ? u : '';
  };

  const defaults = {
    enabled: true,
    title: 'Envie uma mensagem',
    intro: 'Preencha seus dados e retornaremos o contato.',
    show_email: true,
    show_phone: true,
    show_message: true,
    require_email: false,
    require_phone: false,
    require_consent: true,
    consent_text: 'Concordo com o uso dos meus dados para retorno deste contato.',
    privacy_url: null,
    submit_label: 'Enviar mensagem',
    success_message: 'Mensagem enviada com sucesso.'
  };

  const ensureStyle = () => {
    if (document.getElementById('webappcapLeadCaptureStyle')) return;
    const style = document.createElement('style');
    style.id = 'webappcapLeadCaptureStyle';
    style.textContent = `
      .webappcap-lead-wrap{grid-column:1/-1;margin-top:1rem;padding:1.25rem;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:rgba(255,255,255,.06)}
      .webappcap-lead-wrap h3{margin:0 0 .35rem;font:700 1.35rem var(--heading,serif)}
      .webappcap-lead-wrap>p{margin:.2rem 0 1rem;opacity:.78}
      .webappcap-lead-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
      .webappcap-lead-field{display:grid;gap:.35rem}.webappcap-lead-field.full{grid-column:1/-1}
      .webappcap-lead-field label{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
      .webappcap-lead-field input,.webappcap-lead-field textarea{width:100%;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.96);color:#171310;padding:.8rem .85rem;font:inherit}
      .webappcap-lead-field textarea{min-height:110px;resize:vertical}
      .webappcap-consent{display:flex;gap:.65rem;align-items:flex-start;margin-top:.85rem;font-size:.78rem;line-height:1.5;color:rgba(255,255,255,.78)}
      .webappcap-consent input{margin-top:.18rem}.webappcap-consent a{color:inherit;text-decoration:underline}
      .webappcap-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
      .webappcap-lead-actions{display:flex;align-items:center;gap:.8rem;margin-top:.85rem;flex-wrap:wrap}
      .webappcap-lead-submit{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:0;border-radius:999px;padding:.8rem 1.05rem;background:var(--accent,#e3bb3d);color:#171310;font-weight:800;cursor:pointer;white-space:nowrap}
      .webappcap-lead-submit[disabled]{opacity:.6;cursor:not-allowed}
      .webappcap-lead-status{font-size:.82rem;min-height:1.2em}.webappcap-lead-status.ok{color:#bff3d3}.webappcap-lead-status.err{color:#ffd0cb}
      .webappcap-preview-note{margin-top:.8rem;font-size:.75rem;opacity:.72}
      @media(max-width:640px){.webappcap-lead-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  };

  const waitForContact = () => new Promise(resolve => {
    const existing = document.getElementById('contato');
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const contact = document.getElementById('contato');
      if (!contact) return;
      observer.disconnect();
      resolve(contact);
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(document.getElementById('contato'));
    }, 6000);
  });

  const loadSettings = async data => {
    let settings = { ...defaults };

    try {
      if (data.isDraft) {
        const result = await data.client
          .from('lead_form_settings')
          .select('enabled,title,intro,show_email,show_phone,show_message,require_email,require_phone,require_consent,consent_text,privacy_url,submit_label,success_message')
          .eq('project_id', data.project.id)
          .maybeSingle();
        if (!result.error && result.data) settings = { ...settings, ...result.data };
      } else {
        const result = await data.client.rpc('webappcap_lead_form_settings', { p_project_id: data.project.id });
        if (!result.error && result.data) settings = { ...settings, ...result.data };
      }
    } catch (error) {
      console.debug('[WebAppCap Lead Form Settings]', error?.message || error);
    }

    return settings;
  };

  const render = async data => {
    if (!data?.project?.id || !data.client) return;

    const contact = await waitForContact();
    if (!contact || contact.querySelector('[data-webappcap-lead-form]')) return;

    const settings = await loadSettings(data);
    if (settings.enabled === false) return;

    ensureStyle();

    const privacy = validPrivacyUrl(settings.privacy_url);
    const isPreview = Boolean(data.isDraft);
    const sessionKey = `webappcap-lead-session:${data.project.id}`;
    let sessionId = null;

    try {
      sessionId = sessionStorage.getItem(sessionKey);
      if (!sessionId) {
        sessionId = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(sessionKey, sessionId);
      }
    } catch {}

    const wrap = document.createElement('div');
    wrap.className = 'webappcap-lead-wrap';
    wrap.dataset.webappcapLeadForm = '1';
    wrap.dataset.mode = isPreview ? 'preview' : 'published';
    wrap.innerHTML = `
      <h3>${esc(settings.title)}</h3>
      ${settings.intro ? `<p>${esc(settings.intro)}</p>` : ''}
      <form novalidate>
        <div class="webappcap-lead-grid">
          <div class="webappcap-lead-field full"><label>Nome</label><input name="name" autocomplete="name" maxlength="120" required></div>
          ${settings.show_email !== false ? `<div class="webappcap-lead-field"><label>E-mail${settings.require_email ? ' *' : ''}</label><input name="email" type="email" autocomplete="email" maxlength="180" ${settings.require_email ? 'required' : ''}></div>` : ''}
          ${settings.show_phone !== false ? `<div class="webappcap-lead-field"><label>Telefone / WhatsApp${settings.require_phone ? ' *' : ''}</label><input name="phone" autocomplete="tel" maxlength="60" ${settings.require_phone ? 'required' : ''}></div>` : ''}
          ${settings.show_message !== false ? `<div class="webappcap-lead-field full"><label>Mensagem</label><textarea name="message" maxlength="3000"></textarea></div>` : ''}
          <div class="webappcap-hp" aria-hidden="true"><label>Empresa<input name="company" tabindex="-1" autocomplete="off"></label></div>
        </div>
        ${settings.require_consent !== false ? `<label class="webappcap-consent"><input type="checkbox" name="consent" value="1"><span>${esc(settings.consent_text)}${privacy ? ` <a href="${esc(privacy)}" target="_blank" rel="noopener">Política de privacidade</a>` : ''}</span></label>` : ''}
        <div class="webappcap-lead-actions">
          <button class="webappcap-lead-submit" type="submit">${esc(settings.submit_label)}</button>
          <span class="webappcap-lead-status" role="status" aria-live="polite"></span>
        </div>
        ${isPreview ? '<div class="webappcap-preview-note">Preview: o formulário é exibido para conferência, mas nenhum lead será enviado.</div>' : ''}
      </form>`;

    const grid = contact.querySelector('.contact-grid');
    (grid || contact).appendChild(wrap);

    const form = wrap.querySelector('form');
    const status = wrap.querySelector('.webappcap-lead-status');
    const button = wrap.querySelector('.webappcap-lead-submit');

    form.addEventListener('submit', async event => {
      event.preventDefault();
      status.className = 'webappcap-lead-status';
      status.textContent = '';

      if (isPreview) {
        status.classList.add('ok');
        status.textContent = 'Preview: nenhum lead foi enviado.';
        return;
      }

      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const message = String(fd.get('message') || '').trim();
      const consent = fd.get('consent') === '1';
      const honeypot = String(fd.get('company') || '').trim();

      if (name.length < 2) { status.classList.add('err'); status.textContent = 'Informe seu nome.'; return; }
      if (settings.require_email && !email) { status.classList.add('err'); status.textContent = 'Informe seu e-mail.'; return; }
      if (settings.require_phone && !phone) { status.classList.add('err'); status.textContent = 'Informe seu telefone.'; return; }
      if (!email && !phone) { status.classList.add('err'); status.textContent = 'Informe e-mail ou telefone.'; return; }
      if (settings.require_consent !== false && !consent) { status.classList.add('err'); status.textContent = 'É necessário aceitar o consentimento para enviar.'; return; }

      button.disabled = true;
      button.textContent = 'Enviando…';

      try {
        const result = await data.client.rpc('webappcap_submit_lead', {
          p_project_id: data.project.id,
          p_name: name,
          p_email: email || null,
          p_phone: phone || null,
          p_message: message || null,
          p_source: 'site_form',
          p_path: location.pathname + location.search,
          p_session_id: sessionId,
          p_consent: consent,
          p_consent_text: settings.consent_text || null,
          p_honeypot: honeypot || null
        });
        if (result.error) throw result.error;

        try {
          const tracking = await data.client.rpc('webappcap_track_event', {
            p_project_id: data.project.id,
            p_event_type: 'contact_click',
            p_event_label: 'lead_form',
            p_path: location.pathname + location.search,
            p_referrer_host: document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return null; } })() : null,
            p_session_id: sessionId
          });
          if (tracking?.error) console.debug('[WebAppCap Leads Analytics]', tracking.error.message);
        } catch (trackingError) {
          console.debug('[WebAppCap Leads Analytics]', trackingError?.message || trackingError);
        }

        form.reset();
        status.classList.add('ok');
        status.textContent = settings.success_message || 'Mensagem enviada com sucesso.';
      } catch (error) {
        console.error('WebAppCap lead submit failed', error);
        status.classList.add('err');
        status.textContent = error?.message || 'Não foi possível enviar agora. Tente novamente.';
      } finally {
        button.disabled = false;
        button.textContent = settings.submit_label || 'Enviar mensagem';
      }
    });
  };

  const start = () => {
    const ready = window.WebAppCapData?.ready;
    if (ready && typeof ready.then === 'function') {
      ready.then(render).catch(error => console.debug('[WebAppCap Lead Form]', error?.message || error));
      return;
    }

    document.addEventListener('webappcap:data-ready', event => {
      render(event.detail).catch(error => console.debug('[WebAppCap Lead Form]', error?.message || error));
    }, { once: true });
  };

  start();
})();
