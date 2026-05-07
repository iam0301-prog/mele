/**
 * OAuth callback handler (LINE / Google / Email magic link)
 * 接收 Supabase 的 ?code=xxx，換成 session 後 redirect 回原頁。
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getLocaleFromPathname, localizePath } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';

function localizedLoginUrl(origin: string, next: string, error: string, message?: string) {
  const locale = getLocaleFromPathname(next);
  const url = new URL(localizePath('/account/login', locale), origin);
  url.searchParams.set('error', error);
  if (message) url.searchParams.set('message', message);
  return url;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/';
  const providerError = searchParams.get('error_description') || searchParams.get('error');

  if (providerError) {
    return NextResponse.redirect(
      localizedLoginUrl(origin, next, 'auth_callback_failed', providerError),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 失敗回登入頁
  return NextResponse.redirect(localizedLoginUrl(origin, next, 'auth_failed'));
}
