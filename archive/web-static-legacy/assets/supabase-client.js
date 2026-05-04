// Supabase client (browser ES module)
// 使用前先設定 .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// 開發時可手動填入下方常數（請勿提交到 git）

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 從 window.MELE_CONFIG 讀取（可由 config.js 設定）
const cfg = window.MELE_CONFIG || {};
const SUPABASE_URL = cfg.supabaseUrl || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = cfg.supabaseAnonKey || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/** 取得當前登入用戶 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** 是否管理員 */
export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  return !!data;
}

/** 是否上架老師 */
export async function isActiveTeacher() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from('teachers')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  return !!data;
}

/** Toast 訊息 */
export function toast(message, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type === 'error' ? 'error' : ''}`;
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
