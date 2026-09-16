import type { NextConfig } from 'next';

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname; }
  catch { return ''; }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: supabaseHost ? { remotePatterns: [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }] } : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb'
    }
  }
};

export default nextConfig;
