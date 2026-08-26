(() => {
  if (window.WebAppCapLeadCaptureStarted) return;
  window.WebAppCapLeadCaptureStarted = true;

  const data = window.WebAppCapData?.data;
  if (!data || data.isDraft || !data.project?.is_published || !data.client) return;

  const contact = document.getElementById('contato');
  if (!contact || contact.querySelector('[data-webappcap-lead-form]')) return;

  const esc = v => String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const sessionKey = `webappcap-lead-session:${data.project.id}`;
  let sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId) {
    sessionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    sessionStorage.setItem(sessionKey, sessionId);
  }

  const style = document.createElement('style');
  style.textContent = `
    .webappcap-lead-wrap{margin-top:2rem;padding:1.25rem;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:rgba(255,255,255,.06)}
    .webappcap-lead-wrap h3{margin:0 0 .35rem;font:700 1.35rem var(--heading,serif)}
    .webappcap-lead-wrap p{margin:.2rem 0 1rem;opacity:.78}
    .webappcap-lead-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    .webappcap-lead-field{display:grid;gap:.35rem}.webappcap-lead-field.full{grid-column:1/-1}
    .webappcap-lead-field label{font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
    .webappcap-lead-field input,.webappcap-lead-field textarea{width:100%;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.96);color:#171310;padding:.8rem .85rem;font:inherit}
    .webappcap-lead-field textarea{min-height:110px;resize:vertical}
    .webappcap-lead-actions{display:flex;align-items:center;gap:.8rem;margin-top:.85rem;flex-wrap:wrap}
    .webappcap-lead-submit{border:0;border-radius:999px;padding:.8rem 1.05rem;background:var(--accent,#e3bb3d);color:#171310;font-weight:800;cursor:pointer}
    .webappcap-lead-submit[disabled]{opacity:.6;cursor:wait}
    .webappcap-lead-status{font-size:.82rem;min-height:1.2em}.webappcap-lead-status.ok{color:#bff3d3}.webappcap-lead-status.err{color:#ffd0cb}
    @media(max-width:640px){.webappcap-lead-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.className = 'webappcap-lead-wrap';
  wrap.dataset.webappcapLeadForm = '1';
  wrap.innerHTML = `
    <h3>Envie uma mensagem</h3>
    <p>Preencha seus dados e retornaremos o contato.</p>
    <form novalidate>
      <div class="webappcap-lead-grid">
        <div class="webappcap-lead-field full"><label>Nome</label><input name="name" autocomplete="name" maxlength="120" required></div>
        <div class="webappcap-lead-field"><label>E-mail</label><input name="email" type="email" autocomplete="email" maxlength="180"></div>
        <div class="webappcap-lead-field"><label>Telefone / WhatsApp</label><input name="phone" autocomplete="tel" maxlength="60"></div>
        <div class="webappcap-lead-field full"><label>Mensagem</label><textarea name="message" maxlength="3000"></textarea></div>
      </div>
      <div class="webappcap-lead-actions">
        <button class="webappcap-lead-submit" type="submit">Enviar mensagem</button>
        <span class="webappcap-lead-status" role="status" aria-live="polite"></span>
      </div>
    </form>`;

  const grid = contact.querySelector('.contact-grid');
  (grid || contact).appendChild(wrap);

  const form = wrap.querySelector('form');
  const status = wrap.querySelector('.webappcap-lead-status');
  const button = wrap.querySelector('button');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'webappcap-lead-status';
    status.textContent = '';

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const message = String(fd.get('message') || '').trim();

    if (name.length < 2) {
      status.classList.add('err');
      status.textContent = 'Informe seu nome.';
      return;
    }
    if (!email && !phone) {
      status.classList.add('err');
      status.textContent = 'Informe e-mail ou telefone.';
      return;
    }

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
        p_session_id: sessionId
      });
      if (result.error) throw result.error;

      data.client.rpc('webappcap_track_event', {
        p_project_id: data.project.id,
        p_event_type: 'contact_click',
        p_event_label: 'lead_form',
        p_path: location.pathname + location.search,
        p_referrer_host: document.referrer ? (()=>{try{return new URL(document.referrer).hostname}catch{return null}})() : null,
        p_session_id: sessionId
      }).catch(()=>{});

      form.reset();
      status.classList.add('ok');
      status.textContent = 'Mensagem enviada com sucesso.';
    } catch (error) {
      console.error('WebAppCap lead submit failed', error);
      status.classList.add('err');
      status.textContent = error?.message || 'Não foi possível enviar agora. Tente novamente.';
    } finally {
      button.disabled = false;
      button.textContent = 'Enviar mensagem';
    }
  });
})();
