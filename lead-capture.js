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
      .webappcap-lead-wrap{grid-column:1/-1;margin-top:2rem;padding:clamp(1.4rem,3vw,2.25rem);border:1px solid rgba(243,238,226,.16);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.035));box-shadow:0 18px 50px rgba(0,0,0,.12)}
      .webappcap-lead-wrap h3{margin:0 0 .45rem;font:600 clamp(1.55rem,3vw,2.15rem)/1.08 var(--heading,'Fraunces',serif);letter-spacing:-.02em}
      .webappcap-lead-wrap>p{max-width:62ch;margin:.2rem 0 1.5rem;color:rgba(255,255,255,.66);font-size:.94rem;line-height:1.65}
      .webappcap-lead-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
      .webappcap-lead-field{display:grid;gap:.48rem}.webappcap-lead-field.full{grid-column:1/-1}
      .webappcap-lead-field label{font:600 .66rem/1.2 var(--mono,'IBM Plex Mono',monospace);letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.72)}
      .webappcap-lead-field input,.webappcap-lead-field textarea{width:100%;border:1px solid rgba(243,238,226,.24);border-radius:14px;background:rgba(247,244,236,.98);color:#171310;padding:.9rem 1rem;font:500 .92rem/1.4 var(--body,'Inter',sans-serif);outline:none;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
      .webappcap-lead-field input:focus,.webappcap-lead-field textarea:focus{border-color:var(--accent,#e3bb3d);box-shadow:0 0 0 3px rgba(227,187,61,.18)}
      .webappcap-lead-field textarea{min-height:132px;resize:vertical}
      .webappcap-consent{display:flex;gap:.7rem;align-items:flex-start;margin-top:1rem;padding:.9rem 1rem;border:1px solid rgba(243,238,226,.12);border-radius:14px;background:rgba(0,0,0,.08);font-size:.78rem;line-height:1.55;color:rgba(255,255,255,.72);cursor:pointer}
      .webappcap-consent input{width:17px;height:17px;flex:0 0 auto;margin-top:.08rem;accent-color:var(--accent,#e3bb3d)}
      .webappcap-consent a{color:var(--accent,#e3bb3d);text-decoration:underline;text-underline-offset:2px}
      .webappcap-hp{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
      .webappcap-lead-actions{display:flex;align-items:center;gap:.9rem;margin-top:1.1rem;flex-wrap:wrap}
      .webappcap-lead-submit{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border:0;border-radius:999px;padding:.85rem 1.25rem;background:var(--accent,#e3bb3d);color:var(--primary,#082720);font:700 .7rem/1 var(--mono,'IBM Plex Mono',monospace);letter-spacing:.015em;cursor:pointer;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.14);transition:transform .2s ease,filter .2s ease,box-shadow .2s ease}
      .webappcap-lead-submit:hover{transform:translateY(-1px);filter:brightness(1.04);box-shadow:0 10px 28px rgba(0,0,0,.18)}
      .webappcap-lead-submit[disabled]{opacity:.6;cursor:not-allowed;transform:none}
      .webappcap-lead-status{font:500 .76rem/1.45 var(--mono,'IBM Plex Mono',monospace);min-height:1.2em}.webappcap-lead-status.ok{color:#bff3d3}.webappcap-lead-status.err{color:#ffd0cb}
      .webappcap-preview-note{margin-top:1rem;padding-top:.9rem;border-top:1px solid rgba(243,238,226,.1);font:500 .67rem/1.5 var(--mono,'IBM Plex Mono',monospace);color:rgba(255,255,255,.52)}
      @media(max-width:640px){.webappcap-lead-wrap{padding:1.2rem;border-radius:18px}.webappcap-lead-grid{grid-template-columns:1fr;gap:.85rem}.webappcap-lead-field.full{grid-column:auto}.webappcap-lead-actions{align-items:stretch;flex-direction:column}.webappcap-lead-submit{width:100%}}
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
