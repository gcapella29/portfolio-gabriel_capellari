import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { safeInternalPath } from '@/core/safe-redirect';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = safeInternalPath(request.nextUrl.searchParams.get('next'));
  if (code) {
    const sb = await createSupabaseServerClient();
    await sb.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, request.url));
}
