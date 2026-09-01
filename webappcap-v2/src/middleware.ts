import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const protectedPrefixes = ['/owner','/projects','/dashboard','/setup'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items) {
        items.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({ request });
        items.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      }
    }
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const protectedRoute = protectedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
