(() => {
  if (window.WebAppCapFitnessReelsEditor) return;
  window.WebAppCapFitnessReelsEditor = true;

  const MAX_REELS = 3;
  const host = () => document.getElementById('editorHost');
  const locale = () => document.querySelector('.locale-tab.active')?.dataset.locale || 'pt';
  const isFitnessProject = () => !!document.querySelector('#nav [data-key="fitness_videos"]');
  const esc = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

  function isVideosEditor() {
    return document.querySelector('#nav [data-key="fitness_videos"].active') &&
      document.getElementById('editorTitle')?.textContent.trim() === 'Vídeos';
  }

  function markDirty() {
    const field = host()?.querySelector('[data-field]');
    if (field) field.dispatchEvent(new Event('input', { bubbles: true }));
    window.WebAppCapUX?.markDirty?.(true);
  }

  function normalizeItems(content) {
    if (!Array.isArray(content.items)) content.items = [];
    content.items = content.items.slice(0, MAX_REELS).map(item => {
      if (typeof item === 'string') return { url: item };
      return item && typeof item === 'object' ? item : {};
    });
    return content.items;
  }

  function renderRows(root, content) {
    const items = normalizeItems(content);
    const lang = locale();
    const list = root.querySelector('[data-reels-list]');
    const add = root.querySelector('[data-reel-add]');
    add.disabled = items.length >= MAX_REELS;
    add.textContent = items.length >= MAX_REELS ? 'Limite de 3 Reels' : '+ Adicionar Reel';

    list.innerHTML = items.map((item, index) => {
      const title = item[`title_${lang}`] ?? item.title_pt ?? item.title ?? '';
      return `<div class="repeat-card" data-reel-index="${index}">
        <div class="repeat-grid">
          <div class="field wide"><label>URL do Reel ${index + 1}</label><input data-reel-url value="${esc(item.url || '')}" placeholder="https://www.instagram.com/reel/..."></div>
          <div class="field wide"><label>Título opcional</label><input data-reel-title value="${esc(title)}" placeholder="Ex.: Treino de força"></div>
        </div>
        <div class="repeat-actions"><button class="btn danger" type="button" data-reel-remove>Remover</button></div>
      </div>`;
    }).join('');

    list.querySelectorAll('[data-reel-index]').forEach(card => {
      const index = Number(card.dataset.reelIndex);
      card.querySelector('[data-reel-url]').oninput = event => {
        items[index].url = event.target.value.trim();
        markDirty();
      };
      card.querySelector('[data-reel-title]').oninput = event => {
        items[index][`title_${locale()}`] = event.target.value;
        markDirty();
      };
      card.querySelector('[data-reel-remove]').onclick = () => {
        items.splice(index, 1);
        markDirty();
        renderRows(root, content);
      };
    });
  }

  function enhanceVideos() {
    if (!isVideosEditor()) return;
    const editor = host();
    const content = editor?.__working;
    if (!editor || !content) return;

    let root = editor.querySelector('[data-fitness-reels-editor]');
    if (!root) {
      root = document.createElement('section');
      root.dataset.fitnessReelsEditor = '1';
      root.style.marginTop = '1.2rem';
      root.innerHTML = `<div class="toolbar">
        <div><strong>Reels em destaque</strong><div class="help" style="margin-top:.25rem">Adicione até 3 links de Reels do Instagram. Eles serão exibidos nesta ordem no site.</div></div>
        <button class="btn ghost" type="button" data-reel-add>+ Adicionar Reel</button>
      </div><div class="repeaters" data-reels-list style="margin-top:.75rem"></div>`;
      editor.appendChild(root);
      root.querySelector('[data-reel-add]').onclick = () => {
        const items = normalizeItems(content);
        if (items.length >= MAX_REELS) return;
        items.push({ url: '', title_pt: '', title_en: '' });
        markDirty();
        renderRows(root, content);
      };
    }
    renderRows(root, content);
  }

  function enhanceStats() {
    if (!isFitnessProject()) return;
    const navButton = document.querySelector('#nav [data-key="stats"]');
    if (navButton) navButton.textContent = 'Números e destaques';
    if (!navButton?.classList.contains('active')) return;

    const title = document.getElementById('editorTitle');
    if (title) title.textContent = 'Números e destaques';

    host()?.querySelectorAll('[data-list-field][data-prop="num"]').forEach(input => {
      const label = input.closest('.field')?.querySelector('label');
      if (label) label.textContent = 'Número / destaque';
      input.placeholder = 'Ex.: 10+, 200+, 100%';
    });
    host()?.querySelectorAll('[data-list-field][data-prop="label"]').forEach(input => {
      const label = input.closest('.field')?.querySelector('label');
      if (label) label.textContent = 'Descrição';
      input.placeholder = 'Ex.: Anos de experiência';
    });
  }

  function alignPreviewButton() {
    if (!isFitnessProject()) return;
    const preview = document.getElementById('previewLink');
    const site = document.getElementById('publishedLink');
    if (!preview || !site || !site.parentElement) return;
    const actions = site.parentElement;
    if (preview.parentElement !== actions || preview.nextElementSibling !== site) {
      actions.insertBefore(preview, site);
    }
  }

  function enhanceAll() {
    enhanceVideos();
    enhanceStats();
    alignPreviewButton();
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('#nav [data-key="fitness_videos"]')) setTimeout(enhanceVideos, 0);
    if (event.target.closest?.('#nav [data-key="stats"]')) setTimeout(enhanceStats, 0);
    if (event.target.closest?.('.locale-tab')) setTimeout(enhanceAll, 0);
  }, true);

  window.addEventListener('load', () => {
    setTimeout(enhanceAll, 0);
    setTimeout(enhanceAll, 350);
  }, { once: true });
})();
