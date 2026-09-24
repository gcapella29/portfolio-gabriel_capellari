import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { classifyHost, isPublicAssetPath } from '@/core/host-routing';

const protectedPrefixes = ['/owner', '/projects', '/dashboard', '/setup'];
const tenantPlatformPrefixes = ['/login', '/entry', '/dashboard', '/setup', '/projects', '/preview', '/auth', '/invite'];

type MiddlewareCookieOptions = Parameters<NextResponse['cookies']['set']>[2];
type MiddlewareCookieToSet = {
  name: string;
  value: string;
  options?: MiddlewareCookieOptions;
};

function matchesPrefix(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = classifyHost(request.headers.get('host') || '');
  const isTenantRoute = path === '/tenant' || path.startsWith('/tenant/');
  const isApiRoute = path === '/api' || path.startsWith('/api/');
  const isTenantPlatformRoute = matchesPrefix(path, tenantPlatformPrefixes);

  // Tenant domains render the public site by default, but explicit client-admin routes
  // stay on the same hostname. This lets /login -> /entry -> /dashboard work without
  // losing the Supabase session cookie created on the tenant domain.
  if (
    host.kind !== 'platform' &&
    !isPublicAssetPath(path) &&
    !isTenantRoute &&
    !isApiRoute &&
    !isTenantPlatformRoute
  ) {
    const target = request.nextUrl.clone();
    target.pathname = '/tenant';
    target.search = '';
    target.searchParams.set('host', host.host);
    return NextResponse.rewrite(target);
  }

  // Public tenant rendering and public API endpoints must not fall through to platform auth handling.
  if (host.kind !== 'platform' && (isTenantRoute || isApiRoute)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items: MiddlewareCookieToSet[]) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const protectedRoute = matchesPrefix(path, protectedPrefixes);

  if (protectedRoute && !data.user) {
    const target = request.nextUrl.clone();
    target.pathname = '/login';
    target.searchParams.set('next', path + request.nextUrl.search);
    return NextResponse.redirect(target);
  }

  if (path === '/login' && data.user) {
    const target = request.nextUrl.clone();
    target.pathname = '/entry';
    target.search = '';
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)'],
};
