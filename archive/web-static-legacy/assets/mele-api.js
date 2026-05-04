/**
 * Mele Calc API client
 * 對接 Python FastAPI 後端，回傳統一格式的 SVG + 結構化資料
 */

const API_BASE = (window.MELE_CONFIG?.apiUrl) || 'http://localhost:8000';

/**
 * 通用呼叫
 * @param {string} tool - numerology / maya / bazi / ziwei / tarot / runes / astro / humandesign
 * @param {object} input - 對應 tool 的參數
 * @returns {Promise<{tool, version, computed_at, input, data, render: {svg, html, palette, animations, speech}}>}
 */
export async function calc(tool, input) {
  const r = await fetch(`${API_BASE}/api/v1/calc/${tool}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail?.error || err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

/**
 * 把 API 回傳直接渲染進一個 container，含 reveal 動畫
 */
export function mountResult(containerEl, response, opts = {}) {
  const { speech = false, onComplete } = opts;
  containerEl.innerHTML = '';
  containerEl.style.opacity = '0';
  containerEl.style.transition = 'opacity 0.6s ease-out';

  const wrapper = document.createElement('div');
  wrapper.className = 'mele-result';
  // 視覺（SVG）+ 解讀文字（html）兩段一起顯示
  const svgPart = response.render.svg || '';
  const htmlPart = response.render.html || '';
  wrapper.innerHTML = svgPart + htmlPart;
  containerEl.appendChild(wrapper);

  // 朗讀
  if (speech && response.render.speech && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(response.render.speech);
    u.lang = 'zh-TW';
    u.rate = 1.0;
    setTimeout(() => speechSynthesis.speak(u), 800);
  }

  requestAnimationFrame(() => {
    containerEl.style.opacity = '1';
    if (onComplete) setTimeout(onComplete, 600);
  });
}

/**
 * 載入過場 (給呼叫期間用)
 */
export function showLoading(containerEl, label = '正在排盤…') {
  containerEl.innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,0.7)">
      <div style="font-size:32px;color:var(--accent);animation: meleSpin 1.4s linear infinite;display:inline-block">◆</div>
      <div style="margin-top:14px;letter-spacing:3px;font-size:13px">${label}</div>
    </div>
    <style>@keyframes meleSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style>
  `;
}

/**
 * 顯示錯誤
 */
export function showError(containerEl, message) {
  containerEl.innerHTML = `
    <div style="text-align:center;padding:40px 20px;color:#ff8a8a;border:1px solid #B8001F;border-radius:10px;background:rgba(184,0,31,0.05)">
      <div style="font-size:24px;margin-bottom:8px">⚠</div>
      <div style="font-size:13px">${message}</div>
      <div style="font-size:11px;margin-top:10px;color:rgba(255,255,255,0.5)">
        Python API 是否啟動？ 預設網址：${API_BASE}
      </div>
    </div>
  `;
}

/**
 * 紀錄排盤結果到 Supabase chart_records（保留原邏輯）
 */
export async function recordChart(supabase, user, tool, input, data) {
  if (!user) return;
  await supabase.from('chart_records').insert({
    user_id: user.id, tool, input_data: input, output_data: data,
  });
}
