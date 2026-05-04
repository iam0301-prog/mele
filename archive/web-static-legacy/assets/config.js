// Mele 前端設定
// 此檔的 publishable key 是設計上「可公開」的（前端必須使用、RLS 才是真正的資料保護層）
// 切勿將 service_role / sb_secret_ key 放進此檔
window.MELE_CONFIG = {
  supabaseUrl: 'https://abahcdwotwqnulsmwvsw.supabase.co',
  supabaseAnonKey: 'sb_publishable_cm8TOvmtWI4A-Mjt1Hyy0w_v9tsWtrG',
  // Python FastAPI 後端 — 本機開發
  // 部署時改成 https://你的-api-domain.com
  apiUrl: 'http://localhost:8000',
};
