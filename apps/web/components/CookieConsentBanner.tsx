'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';

const STORAGE_KEY = 'mele_cookie_consent_v1';
const copyByLocale: Record<Locale, { label: string; title: string; body: string; privacy: string; accept: string }> = {
  'zh-TW': {
    label: 'Cookie 與資料使用提示',
    title: 'Cookie 與資料使用提示',
    body: 'MELE 會使用必要的本機儲存與服務資料來維持登入、每日儀式、偏好設定與安全稽核。若未來加入分析或行銷追蹤，會在隱私權政策中更新並提供選擇。',
    privacy: '查看隱私權政策',
    accept: '我知道了',
  },
  en: {
    label: 'Cookie and data notice',
    title: 'Cookie and Data Notice',
    body: 'MELE uses necessary local storage and service data to keep sign-in, daily rituals, preferences, and security checks working. If analytics or marketing tracking is added later, choices will be explained in the privacy policy.',
    privacy: 'View privacy policy',
    accept: 'Got it',
  },
  vi: {
    label: 'Thông báo cookie và dữ liệu',
    title: 'Thông báo cookie và dữ liệu',
    body: 'MELE sử dụng lưu trữ cục bộ và dữ liệu dịch vụ cần thiết để duy trì đăng nhập, nghi thức hằng ngày, tùy chọn và kiểm tra bảo mật. Nếu sau này có phân tích hoặc tiếp thị, lựa chọn sẽ được cập nhật trong chính sách quyền riêng tư.',
    privacy: 'Xem chính sách quyền riêng tư',
    accept: 'Tôi hiểu',
  },
  id: {
    label: 'Pemberitahuan cookie dan data',
    title: 'Pemberitahuan Cookie dan Data',
    body: 'MELE menggunakan penyimpanan lokal dan data layanan yang diperlukan untuk menjaga login, ritual harian, preferensi, dan pemeriksaan keamanan. Jika analitik atau pelacakan pemasaran ditambahkan nanti, pilihannya akan dijelaskan di kebijakan privasi.',
    privacy: 'Lihat kebijakan privasi',
    accept: 'Mengerti',
  },
  ja: {
    label: 'Cookie とデータ利用のお知らせ',
    title: 'Cookie とデータ利用のお知らせ',
    body: 'MELE はログイン、毎日のリチュアル、設定、安全確認を維持するために必要なローカル保存とサービスデータを使用します。今後、分析やマーケティング計測を追加する場合は、プライバシーポリシーで選択肢を案内します。',
    privacy: 'プライバシーポリシーを見る',
    accept: '了解しました',
  },
  ko: {
    label: '쿠키 및 데이터 사용 안내',
    title: '쿠키 및 데이터 사용 안내',
    body: 'MELE는 로그인, 데일리 리추얼, 설정, 보안 확인을 유지하기 위해 필요한 로컬 저장소와 서비스 데이터를 사용합니다. 향후 분석 또는 마케팅 추적이 추가되면 개인정보 처리방침에서 선택지를 안내합니다.',
    privacy: '개인정보 처리방침 보기',
    accept: '확인',
  },
};

export function CookieConsentBanner() {
  const locale = useCurrentLocale();
  const copy = copyByLocale[locale] ?? copyByLocale['zh-TW'];
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
    <section className="cookie-consent" aria-label={copy.label}>
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.body}</p>
      </div>
      <div className="cookie-consent__actions">
        <Link href={localizePath('/legal/privacy', locale)}>{copy.privacy}</Link>
        <button type="button" onClick={accept}>{copy.accept}</button>
      </div>
    </section>
  );
}
