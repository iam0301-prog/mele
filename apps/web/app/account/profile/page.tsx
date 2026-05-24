'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import { findBirthLocationPreset, getBirthLocationPresets, presetTimezoneName, type BirthLocationPreset } from '@/components/BirthInputs';

interface Profile {
  display_name: string | null;
  bio: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_timezone: string | null;
  gender: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    bio: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    birth_lat: null,
    birth_lon: null,
    birth_timezone: 'Asia/Taipei',
    gender: '未填',
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/account/login?return=/account/profile');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile((current) => ({ ...current, ...data }));
      setLoading(false);
    })();
  }, [router]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile });
    setSaving(false);
    if (error) return toast(error.message, 'error');
    toast('個人資料已儲存。', 'success');
  };

  const applyBirthPreset = (preset: BirthLocationPreset) => {
    setProfile((current) => ({
      ...current,
      birth_location: preset.label,
      birth_lat: preset.lat,
      birth_lon: preset.lon,
      birth_timezone: presetTimezoneName(preset) ?? current.birth_timezone ?? 'Asia/Taipei',
    }));
  };

  const updateBirthLocation = (value: string) => {
    const preset = findBirthLocationPreset(value);
    setProfile((current) => ({
      ...current,
      birth_location: value,
      birth_lat: preset ? preset.lat : current.birth_lat,
      birth_lon: preset ? preset.lon : current.birth_lon,
      birth_timezone: preset ? presetTimezoneName(preset) ?? current.birth_timezone : current.birth_timezone,
    }));
  };

  if (loading) {
    return <div className="container mx-auto max-w-2xl px-5 py-16 text-center text-white/60">載入中...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-5 py-12">
      <header className="pb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl tracking-widest">個人資料</h1>
        <div className="mele-subtitle">PROFILE</div>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          這些資料會用於自動帶入排盤、每日儀式與老師諮詢前摘要。你可以隨時修改或提出資料刪除請求。
        </p>
      </header>

      <div className="mele-card space-y-5">
        <div>
          <label className="mele-label">顯示名稱</label>
          <input
            value={profile.display_name ?? ''}
            onChange={(event) => setProfile({ ...profile, display_name: event.target.value })}
            className="mele-input"
          />
        </div>

        <div>
          <label className="mele-label">自我介紹</label>
          <textarea
            rows={3}
            value={profile.bio ?? ''}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            className="mele-input"
            placeholder="可簡單寫下你想讓老師理解的狀態。"
          />
        </div>

        <hr className="border-accent-dim" />
        <div className="text-xs tracking-widest text-accent">出生資料</div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mele-label">出生日期</label>
            <input
              type="date"
              value={profile.birth_date ?? ''}
              onChange={(event) => setProfile({ ...profile, birth_date: event.target.value || null })}
              className="mele-input"
            />
          </div>
          <div>
            <label className="mele-label">出生時間</label>
            <input
              type="time"
              value={profile.birth_time ?? ''}
              onChange={(event) => setProfile({ ...profile, birth_time: event.target.value || null })}
              className="mele-input"
            />
          </div>
        </div>

        <div>
          <label className="mele-label">出生地</label>
          <input
            value={profile.birth_location ?? ''}
            onChange={(event) => updateBirthLocation(event.target.value)}
            onBlur={(event) => {
              const preset = findBirthLocationPreset(event.target.value);
              if (preset) applyBirthPreset(preset);
            }}
            placeholder="例如：台北市"
            className="mele-input"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {getBirthLocationPresets().slice(0, 10).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyBirthPreset(preset)}
                className="rounded-full border border-accent-dim px-3 py-1 text-xs text-white/70 transition hover:border-accent hover:text-accent"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/48">
            點選常用城市或輸入相同城市名，系統會自動帶入經緯度與出生地時區；需要更精準時仍可手動修正。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mele-label">緯度</label>
            <input
              type="number"
              step="0.0001"
              value={profile.birth_lat ?? ''}
              onChange={(event) => setProfile({ ...profile, birth_lat: event.target.value ? parseFloat(event.target.value) : null })}
              className="mele-input"
            />
          </div>
          <div>
            <label className="mele-label">經度</label>
            <input
              type="number"
              step="0.0001"
              value={profile.birth_lon ?? ''}
              onChange={(event) => setProfile({ ...profile, birth_lon: event.target.value ? parseFloat(event.target.value) : null })}
              className="mele-input"
            />
          </div>
        </div>

        <div>
          <label className="mele-label">出生地時區</label>
          <input
            value={profile.birth_timezone ?? 'Asia/Taipei'}
            onChange={(event) => setProfile({ ...profile, birth_timezone: event.target.value || null })}
            className="mele-input"
            placeholder="例如：Asia/Taipei"
          />
        </div>

        <div>
          <label className="mele-label">性別</label>
          <select
            value={profile.gender ?? '未填'}
            onChange={(event) => setProfile({ ...profile, gender: event.target.value })}
            className="mele-input"
          >
            <option value="女">女</option>
            <option value="男">男</option>
            <option value="其他">其他</option>
            <option value="未填">不透露</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button type="button" onClick={save} disabled={saving} aria-disabled={saving} className="mele-btn-primary">
            {saving ? '儲存中...' : '儲存資料'}
          </button>
          <Link href="/account/reset-password" className="mele-btn-secondary">更改密碼</Link>
          <Link href="/account/privacy" className="mele-btn-secondary">資料權利</Link>
          <Link href="/account/mybookings" className="mele-btn-secondary">我的諮詢</Link>
          <Link href="/account/charts" className="mele-btn-secondary">我的命盤</Link>
        </div>
      </div>
    </div>
  );
}
