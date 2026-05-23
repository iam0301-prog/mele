/**
 * OAuth callback handler (LINE / Google / Email magic link)
 * 接收 Supabase 的 ?code=xxx，換成 session 後 redirect 回原頁。
 */
import { NextResponse, type NextRequest } from 'next/server';
import { buildLocalizedAuthFailureUrl, sanitizeAuthNextPath } from '@/lib/auth-callback-redirects';
import { createClient } from '@/lib/supabase/server';

function isMissingPkceVerifier(error: { message?: string } | null) {
  return (error?.message ?? '').toLowerCase().includes('code verifier');
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/';
  const next = sanitizeAuthNextPath(nextParam);
  const providerError = searchParams.get('error_description') || searchParams.get('error');

  if (providerError) {
    return NextResponse.redirect(
      buildLocalizedAuthFailureUrl({ origin, next, error: 'auth_callback_failed', message: providerError }),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (isMissingPkceVerifier(error)) {
      return NextResponse.redirect(
        buildLocalizedAuthFailureUrl({ origin, next, error: 'email_confirmed_login_required' }),
      );
    }
  }

  // 失敗回登入頁，並保留原本想去的會員頁，讓使用者重新登入後能回到正確流程。
  return NextResponse.redirect(buildLocalizedAuthFailureUrl({ origin, next, error: 'auth_failed' }));
}
