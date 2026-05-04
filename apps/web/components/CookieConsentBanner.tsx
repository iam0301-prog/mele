'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mele_cookie_consent_v1';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'accepted');
    } catch {
      setVisible(false);
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // localStorage may be blocked; hiding the banner is still the least disruptive choice.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <section className="cookie-consent" aria-label="Cookie 與資料使用提示">
      <div>
        <strong>Cookie 與資料使用提示</strong>
        <p>
          MELE 會使用必要的本機儲存與服務資料維持登入、每日儀式、偏好設定與安全稽核。
          若未來加入分析或行銷追蹤，會在隱私權政策中更新並提供選擇。
        </p>
      </div>
      <div className="cookie-consent__actions">
        <Link href="/legal/privacy">查看隱私權政策</Link>
        <button type="button" onClick={accept}>我知道了</button>
      </div>
    </section>
  );
}
