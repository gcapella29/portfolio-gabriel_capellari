const SUPABASE_URL = "https://ownoyzpjiqbzgaeaoyzl.supabase.co";
const SUPABASE_KEY = "sb_publishable_q1UwNCcinl7S6KN-oCU1rA_99_17BXw";

function esc(value = '') {
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function hostFrom(request) {
  const forwarded = request.headers.get('x-forwarded-host');
  const host = forwarded || request.headers.get('host') || new URL(request.url).host;
  return host.split(':')[0].toLowerCase();
}

function absoluteUrl(value, host) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${host}/${String(value).replace(/^\/+/, '')}`;
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

async function resolveProject(host, forcedSlug) {
  if (!forcedSlug && (host === 'webappcap.com.br' || host === 'www.webappcap.com.br')) {
    forcedSlug = 'gabriel-capellari';
  }

  if (forcedSlug) {
    const rows = await supabaseGet(
      `projects?select=id,slug,name,custom_domain,subdomain&slug=eq.${encodeURIComponent(forcedSlug)}&is_published=eq.true&limit=1`
    );
    return rows?.[0] || null;
  }

  let rows = await supabaseGet(
    `projects?select=id,slug,name,custom_domain,subdomain&custom_domain=eq.${encodeURIComponent(host)}&is_published=eq.true&limit=1`
  );
  if (rows?.[0]) return rows[0];

  const first = host.split('.')[0];
  if (first && first !== 'www' && first !== 'webappcap') {
    rows = await supabaseGet(
      `projects?select=id,slug,name,custom_domain,subdomain&subdomain=eq.${encodeURIComponent(first)}&is_published=eq.true&limit=1`
    );
    if (rows?.[0]) return rows[0];
  }

  return null;
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const host = hostFrom(request);
      const forcedSlug = url.searchParams.get('project');

      const project = await resolveProject(host, forcedSlug);

      if (!project) {
        return new Response(`<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8">
<title>WebAppCap</title>
<meta property="og:title" content="WebAppCap">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(`https://${host}/`)}">
<meta name="twitter:card" content="summary">
</head><body></body></html>`, {
          status: 200,
          headers: {'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60'}
        });
      }

      const rows = await supabaseGet(
        `site_content?select=section_key,content&project_id=eq.${project.id}&section_key=in.(seo,media,hero,about)`
      );

      const byKey = new Map((rows || []).map(r => [r.section_key, r.content || {}]));
      const seo = byKey.get('seo') || {};
      const media = byKey.get('media') || {};
      const hero = byKey.get('hero') || {};
      const about = byKey.get('about') || {};

      const title =
        seo.title_pt ||
        seo.title_en ||
        project.name ||
        'Site profissional';

      const description =
        seo.description_pt ||
        seo.description_en ||
        about.paragraph1_pt ||
        about.paragraph1_en ||
        hero.role_pt ||
        hero.role_en ||
        `${project.name} — site profissional`;

      let image = seo.og_image_url || '';
      if (image && /og-gabriel-capellari/i.test(image)) image = '';

      image =
        image ||
        media.hero_url ||
        media.about_url ||
        media.contact_url ||
        '';

      image = absoluteUrl(image, host);

      const canonical = forcedSlug
        ? `https://${host}/p/${project.slug}`
        : `https://${host}/`;

      const imageTags = image ? `
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:secure_url" content="${esc(image)}">
<meta name="twitter:image" content="${esc(image)}">` : '';

      const html = `<!doctype html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">

<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="${esc(project.name || 'WebAppCap')}">
${imageTags}

<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
</head>
<body>
<a href="${esc(canonical)}">${esc(project.name || title)}</a>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'content-type':'text/html; charset=utf-8',
          'cache-control':'public, s-maxage=300, stale-while-revalidate=600'
        }
      });
    } catch (error) {
      console.error(error);
      return new Response('<!doctype html><html><head><title>WebAppCap</title></head><body></body></html>', {
        status: 200,
        headers: {'content-type':'text/html; charset=utf-8'}
      });
    }
  }
};
