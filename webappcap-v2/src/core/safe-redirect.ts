const FALLBACK_PATH = '/entry';

export function safeInternalPath(value: unknown, fallback = FALLBACK_PATH) {
  const candidate = String(value || '').trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return fallback;
  }

  try {
    const base = new URL('https://webappcap.invalid');
    const target = new URL(candidate, base);
    if (target.origin !== base.origin) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
