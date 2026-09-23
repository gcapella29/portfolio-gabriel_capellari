import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname; }
  catch { return ''; }
})();

// Headers de segurança aplicados a todas as páginas.
// - nosniff: impede o navegador de "adivinhar" o tipo de um arquivo.
// - Referrer-Policy: envia menos informação de origem para sites externos.
// - Permissions-Policy: desliga recursos do aparelho que o site não usa.
// - X-Frame-Options + frame-ancestors: impede que OUTRO site coloque o seu
//   dentro de uma moldura (clickjacking). 'self' mantém o preview do editor
//   funcionando, desde que ele abra no mesmo endereço do painel.
// - base-uri / object-src: fecham brechas de injeção sem limitar scripts,
//   imagens ou o embed do Instagram.
// O HSTS (forçar https) já é enviado pela Vercel, por isso não está aqui.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'"
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: supabaseHost ? { remotePatterns: [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }] } : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb'
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
