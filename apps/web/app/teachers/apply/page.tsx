'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type { TeacherApplication } from '@/types/db';

const SPECIALTIES = ['八字', '紫微斗數', '塔羅', '盧恩', '占星', '人類圖', '靈數', '瑪雅', '易經', '風水', '姓名學', '催眠'];

const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ 待審核',
  reviewing: '👀 審核中',
  revision: '📝 需補件',
  rejected: '✗ 已拒絕',
  interview: '🎤 試講中',
  contracted: '✓ 已簽約',
  active: '★ 已上架',
};

function TeacherApplyChecklist({
  hasAccount,
  specialtiesCount,
  hasIntro,
  hasDocs,
  hasVideo,
  hasContact,
}: {
  hasAccount: boolean;
  specialtiesCount: number;
  hasIntro: boolean;
  hasDocs: boolean;
  hasVideo: boolean;
  hasContact: boolean;
}) {
  const items = [
    { title: '登入會員帳號', body: '申請會綁定你的 MELE 帳號，方便後續查看審核進度。', done: hasAccount },
    { title: '專長與短自介', body: '至少選一個專長，並用 30 字內說清楚你適合幫誰解決什麼問題。', done: specialtiesCount > 0 && hasIntro },
    { title: '證件與自介影片', body: '證件用於平台審核；自介影片可先用連結補上，讓審核更快判斷風格。', done: hasDocs || hasVideo },
    { title: '可聯絡管道', body: 'LINE 或社群連結能讓平台在補件、試講與上架前快速聯繫你。', done: hasContact },
  ];
  const completeCount = items.filter((item) => item.done).length;

  return (
    <section className="teacher-readiness" aria-label="申請前自我檢查">
      <div className="teacher-readiness__header">
        <span>申請前自我檢查</span>
        <h2>老師申請流程更清楚</h2>
        <p>送出前先看這四項；送出後可以到老師後台看狀態，不用猜審核進度。</p>
      </div>
      <div className="teacher-readiness__progress" aria-label={`完成 ${completeCount} / ${items.length}`}>
        <i style={{ width: `${completeCount / items.length * 100}%` }} />
      </div>
      <div className="teacher-readiness__grid">
        {items.map((item) => (
          <article key={item.title} className={`teacher-readiness__item${item.done ? ' is-complete' : ''}`}>
            <strong>{item.done ? 'OK' : '待補'}</strong>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div className="teacher-readiness__actions">
        <Link href="/teacher-portal">查看老師後台</Link>
        <Link href="/teachers">先看目前老師頁</Link>
      </div>
    </section>
  );
}

export default function ApplyPage() {
  const toast = useToast();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [existing, setExisting] = useState<TeacherApplication | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPwd, setAuthPwd] = useState('');

  // Form state
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [emailField, setEmailField] = useState('');
  const [phone, setPhone] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [introShort, setIntroShort] = useState('');
  const [introLong, setIntroLong] = useState('');
  const [quote, setQuote] = useState('');
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [lineUrl, setLineUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [threads, setThreads] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        setUser({ id: u.id, email: u.email ?? null });
        setEmailField(u.email ?? '');
        const { data: app } = await supabase
          .from('teacher_applications')
          .select('*')
          .eq('user_id', u.id)
          .order('submitted_at', { ascending: false })
          .limit(1);
        if (app && app.length) setExisting(app[0] as TeacherApplication);
      }
    })();
  }, []);

  const auth = async (mode: 'signin' | 'signup') => {
    const supabase = createClient();
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPwd });
      if (error) return toast(error.message, 'error');
      router.refresh();
      location.reload();
    } else {
      if (authPwd.length < 6) return toast('密碼至少 6 字', 'error');
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPwd,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/teachers/apply')}`,
        },
      });
      if (error) return toast(error.message, 'error');
      toast('註冊成功 ✦ 請查收 Email');
      setTimeout(() => location.reload(), 1500);
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!specs.length) return toast('請選至少一個專長', 'error');
    if (!legalName || !displayName || !emailField || !phone || !introShort) return toast('請填寫必填欄位', 'error');
    setSubmitting(true);

    const supabase = createClient();
    const upload = async (f: File | null) => {
      if (!f) return null;
      const path = `${user.id}/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from('teacher-docs').upload(path, f);
      if (error) { toast(`上傳失敗：${error.message}`, 'error'); return null; }
      const { data } = supabase.storage.from('teacher-docs').getPublicUrl(path);
      return data.publicUrl;
    };

    const [idFrontUrl, idBackUrl] = await Promise.all([upload(idFront), upload(idBack)]);

    const { error } = await supabase.rpc('submit_teacher_application', {
      p_legal_name: legalName,
      p_display_name: displayName,
      p_email: emailField,
      p_phone: phone,
      p_specialties: specs,
      p_intro_short: introShort,
      p_intro_long: introLong,
      p_quote: quote,
      p_id_doc_front_url: idFrontUrl,
      p_id_doc_back_url: idBackUrl,
      p_intro_video_url: introVideoUrl,
      p_line_url: lineUrl,
      p_instagram: instagram,
      p_facebook: facebook,
      p_threads: threads,
      p_youtube: youtube,
      p_website: website,
    });
    setSubmitting(false);
    if (error) return toast(error.message, 'error');
    toast('申請已送出 ✦');
    setTimeout(() => location.reload(), 1500);
  };

  // 未登入畫面
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-5 py-16">
        <header className="text-center pb-8">
          <h1 className="font-serif text-3xl tracking-widest mb-2">老師申請</h1>
          <div className="mele-subtitle">SIGN IN / SIGN UP</div>
          <p className="mt-4 text-white/70 text-sm">先建立帳號才能送出申請</p>
        </header>
        <TeacherApplyChecklist
          hasAccount={false}
          specialtiesCount={0}
          hasIntro={false}
          hasDocs={false}
          hasVideo={false}
          hasContact={false}
        />
        <div className="mele-card space-y-4">
          <div className="flex border-b border-accent-dim mb-2">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAuthMode(m)}
                className={`flex-1 py-3 text-sm tracking-widest ${authMode === m ? 'text-accent border-b-2 border-accent' : 'text-white/60'}`}
              >
                {m === 'signin' ? '登入' : '建立帳號'}
              </button>
            ))}
          </div>
          <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="mele-input" />
          <input type="password" placeholder="密碼（至少 6 字）" minLength={6} value={authPwd} onChange={(e) => setAuthPwd(e.target.value)} className="mele-input" />
          <button onClick={() => auth(authMode!)} className="mele-btn-primary w-full">
            {authMode === 'signin' ? '登入' : '建立新帳號'}
          </button>
        </div>
      </div>
    );
  }

  // 已有申請畫面
  if (existing) {
    return (
      <div className="container mx-auto max-w-2xl px-5 py-16">
        <header className="text-center pb-8">
          <h1 className="font-serif text-3xl tracking-widest mb-2">你的申請</h1>
          <div className="mele-subtitle">YOUR APPLICATION</div>
        </header>
        <div className="mele-card text-center py-10">
          <div className="font-serif text-3xl text-accent mb-3">{STATUS_LABEL[existing.status]}</div>
          <div className="text-white/70 mb-5">送出於 {new Date(existing.submitted_at).toLocaleDateString('zh-TW')}</div>
          <TeacherApplyChecklist
            hasAccount
            specialtiesCount={existing.specialties?.length ?? 0}
            hasIntro={Boolean(existing.intro_short)}
            hasDocs={Boolean(existing.id_doc_front_url || existing.id_doc_back_url)}
            hasVideo={Boolean(existing.intro_video_url)}
            hasContact={Boolean(existing.line_url || existing.instagram || existing.facebook || existing.threads || existing.youtube)}
          />
          {existing.reviewer_notes && (
            <div className="text-left bg-black/30 p-4 rounded-lg text-sm">
              <strong className="text-accent">審核回覆</strong>
              <br />
              {existing.reviewer_notes}
            </div>
          )}
          <Link href="/" className="mele-btn-secondary mt-6 inline-block">回首頁</Link>
        </div>
      </div>
    );
  }

  // 表單
  return (
    <div className="container mx-auto max-w-3xl px-5 py-12">
      <header className="text-center pb-6">
        <h1 className="font-serif text-3xl tracking-widest mb-2">老師申請表</h1>
        <div className="mele-subtitle">APPLICATION FORM</div>
        <p className="mt-4 text-white/70 text-sm leading-loose">
          審核流程：申請 → 初審 → 試講 → 簽約 → 上架。約 7-14 天。
        </p>
      </header>

      <TeacherApplyChecklist
        hasAccount
        specialtiesCount={specs.length}
        hasIntro={Boolean(introShort.trim())}
        hasDocs={Boolean(idFront || idBack)}
        hasVideo={Boolean(introVideoUrl.trim())}
        hasContact={Boolean(lineUrl.trim() || instagram.trim() || facebook.trim() || threads.trim() || youtube.trim() || website.trim())}
      />

      <div className="mele-card space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="mele-label">真實姓名 *</label><input value={legalName} onChange={(e) => setLegalName(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">對外顯示名 *</label><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例：星辰老師" className="mele-input" /></div>
          <div><label className="mele-label">Email *</label><input type="email" value={emailField} onChange={(e) => setEmailField(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">聯絡電話 *</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="mele-input" /></div>
        </div>

        <div>
          <label className="mele-label">專長領域 *（可複選）</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => {
              const checked = specs.includes(s);
              return (
                <label key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition ${
                  checked ? 'bg-accent text-primary border-accent' : 'border-accent-dim hover:border-accent'
                }`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setSpecs(checked ? specs.filter((x) => x !== s) : [...specs, s])}
                    className="hidden"
                  />
                  {s}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mele-label">30 字內自介 *</label>
          <input maxLength={30} value={introShort} onChange={(e) => setIntroShort(e.target.value)} className="mele-input" />
        </div>
        <div>
          <label className="mele-label">長版介紹</label>
          <textarea rows={5} value={introLong} onChange={(e) => setIntroLong(e.target.value)} className="mele-input" placeholder="為什麼想成為命理老師、你的特色、可以幫助什麼樣的人..." />
        </div>
        <div>
          <label className="mele-label">一句格言</label>
          <input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="例：宇宙從不為難準備好的靈魂" className="mele-input" />
        </div>

        <hr className="border-accent-dim" />
        <div className="text-accent text-xs tracking-widest">證件 / 影片</div>

        <div><label className="mele-label">證件正面（身分證 / 護照）</label><input type="file" accept="image/*" onChange={(e) => setIdFront(e.target.files?.[0] ?? null)} className="mele-input" /></div>
        <div><label className="mele-label">證件背面</label><input type="file" accept="image/*" onChange={(e) => setIdBack(e.target.files?.[0] ?? null)} className="mele-input" /></div>
        <div><label className="mele-label">3 分鐘自介影片連結</label><input type="url" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} placeholder="https://youtu.be/..." className="mele-input" /></div>

        <hr className="border-accent-dim" />
        <div className="text-accent text-xs tracking-widest">社群連結（讓客戶找到你）</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="mele-label">LINE 加好友連結</label><input type="url" value={lineUrl} onChange={(e) => setLineUrl(e.target.value)} placeholder="https://lin.ee/..." className="mele-input" /></div>
          <div><label className="mele-label">Instagram</label><input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">Threads</label><input type="url" value={threads} onChange={(e) => setThreads(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">Facebook</label><input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">YouTube</label><input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">個人網站</label><input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mele-input" /></div>
        </div>

        <div className="bg-accent/[0.08] border border-accent-dim rounded-lg p-4 text-sm leading-loose">
          <strong className="text-accent">送出前請確認</strong>
          <br />• 7-14 天審核（含試講）
          <br />• 審核期間我們會通過 Email 與你聯繫
          <br />• 上架後可在後台自助管理時段、價格、服務項目
          <br />• 平台抽成預設 10%，會在簽約時最終確認
        </div>

        <button onClick={submit} disabled={submitting} className="mele-btn-primary w-full">
          {submitting ? '送出中…' : '送出申請'}
        </button>
      </div>
    </div>
  );
}
