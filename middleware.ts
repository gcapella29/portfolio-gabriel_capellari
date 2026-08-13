import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPABASE_URL = "https://ownoyzpjiqbzgaeaoyzl.supabase.co"
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q1UwNCcinl7S6KN-oCU1rA_99_17BXw"
const DEFAULT_VERCEL_HOST = "portfolio-gabriel-capellari.vercel.app"

const STATIC_FILE = /\.[a-zA-Z0-9]{1,8}$/

function normalizeHost(value: string | null) {
  return (value || '').split(':')[0].trim().toLowerCase()
}

async function resolveProjectByDomain(host: string) {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
  }

  // 1. Exact custom domain wins.
  const exactUrl =
    `${SUPABASE_URL}/rest/v1/projects?select=slug&is_published=eq.true&custom_domain=eq.${encodeURIComponent(host)}&limit=1`

  const exact = await fetch(exactUrl, {
    headers,
    cache: 'no-store',
  })

  if (exact.ok) {
    const rows = await exact.json()
    if (rows?.[0]?.slug) return rows[0].slug as string
  }

  // 2. If this is not a Vercel hostname, try the first label as a
  //    wildcard-subdomain alias stored in projects.subdomain.
  if (!host.endsWith('.vercel.app')) {
    const firstLabel = host.split('.')[0]

    if (firstLabel && firstLabel !== 'www') {
      const subUrl =
        `${SUPABASE_URL}/rest/v1/projects?select=slug&is_published=eq.true&subdomain=eq.${encodeURIComponent(firstLabel)}&limit=1`

      const sub = await fetch(subUrl, {
        headers,
        cache: 'no-store',
      })

      if (sub.ok) {
        const rows = await sub.json()
        if (rows?.[0]?.slug) return rows[0].slug as string
      }
    }
  }

  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = normalizeHost(request.headers.get('host'))

  // Admin, API, preview and real static files are never tenant-rewritten.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname === '/preview.html' ||
    pathname === '/site.html' ||
    pathname === '/favicon.ico' ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Clean project URL:
  // /p/mariana-personal -> internally serves /site.html
  const cleanMatch = pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i)
  if (cleanMatch) {
    const slug = cleanMatch[1]
    const destination = request.nextUrl.clone()
    destination.pathname = '/site.html'

    const response = NextResponse.rewrite(destination)
    response.cookies.set('vitrine_project', slug, {
      path: '/',
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60,
    })
    return response
  }

  // Keep the main Vercel deployment homepage as Gabriel's default site.
  if (!host || host === DEFAULT_VERCEL_HOST || host.endsWith('-gabriel-capellari.vercel.app')) {
    return NextResponse.next()
  }

  // Root of a tenant custom domain / wildcard subdomain.
  if (pathname === '/' || pathname === '/index.html') {
    try {
      const slug = await resolveProjectByDomain(host)

      if (slug) {
        const destination = request.nextUrl.clone()
        destination.pathname = '/site.html'

        const response = NextResponse.rewrite(destination)
        response.cookies.set('vitrine_project', slug, {
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: 60 * 60,
        })
        return response
      }
    } catch (error) {
      console.error('Vitrine domain resolver failed', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
