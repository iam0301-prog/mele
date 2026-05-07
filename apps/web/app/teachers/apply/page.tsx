'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProvidedLocale } from '@/lib/i18n/LocaleProvider';
import { localizePath, type Locale } from '@/lib/i18n/config';
import { getTeacherCopy, type TeacherCopy } from '@/lib/i18n/teacher-copy';
import { createClient } from '@/lib/supabase/client';
import { readClientTestUser } from '@/lib/test-auth';
import { useToast } from '@/components/ToastProvider';
import type { TeacherApplication } from '@/types/db';

function TeacherApplyChecklist({
  hasAccount,
  specialtiesCount,
  hasIntro,
  hasDocs,
  hasVideo,
  hasContact,
  copy,
  locale,
}: {
  hasAccount: boolean;
  specialtiesCount: number;
  hasIntro: boolean;
  hasDocs: boolean;
  hasVideo: boolean;
  hasContact: boolean;
  copy: TeacherCopy['apply']['checklist'];
  locale: Locale;
}) {
  const items = [
    { ...copy.items[0], done: hasAccount },
    { ...copy.items[1], done: specialtiesCount > 0 && hasIntro },
    { ...copy.items[2], done: hasDocs || hasVideo },
    { ...copy.items[3], done: hasContact },
  ];
  const completeCount = items.filter((item) => item.done).length;

  return (
    <section className="teacher-readiness" aria-label={copy.aria}>
      <div className="teacher-readiness__header">
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
      <div className="teacher-readiness__progress" aria-label={copy.progress(completeCount, items.length)}>
        <i style={{ width: `${completeCount / items.length * 100}%` }} />
      </div>
      <div className="teacher-readiness__grid">
        {items.map((item) => (
          <article key={item.title} className={`teacher-readiness__item${item.done ? ' is-complete' : ''}`}>
            <strong>{item.done ? copy.ok : copy.todo}</strong>
            <h3>{item.title}</h3>
            <p>{item.done ? item.doneBody : item.todoBody}</p>
          </article>
        ))}
      </div>
      <div className="teacher-readiness__actions">
        <Link href={localizePath('/teacher-portal', locale)}>{copy.portal}</Link>
        <Link href={localizePath('/teachers', locale)}>{copy.directory}</Link>
      </div>
    </section>
  );
}

export default function ApplyPage() {
  const locale = useProvidedLocale();
  const copy = getTeacherCopy(locale);
  const toast = useToast();
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [existing, setExisting] = useState<TeacherApplication | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPwd, setAuthPwd] = useState('');
  const [authing, setAuthing] = useState(false);

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
    let mounted = true;
    (async () => {
      const testUser = readClientTestUser();
      if (testUser) {
        if (!mounted) return;
        setUser({ id: testUser.id, email: testUser.email });
        setEmailField(testUser.email);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user: u }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (u) {
          if (!mounted) return;
          setUser({ id: u.id, email: u.email ?? null });
          setEmailField(u.email ?? '');
          const { data: app, error: appError } = await supabase
            .from('teacher_applications')
            .select('*')
            .eq('user_id', u.id)
            .order('submitted_at', { ascending: false })
            .limit(1);
          if (appError) throw appError;
          if (mounted && app && app.length) setExisting(app[0] as TeacherApplication);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : copy.apply.authLoadFailed;
        toast(message, 'error');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [copy.apply.authLoadFailed, toast]);

  const auth = async (mode: 'signin' | 'signup') => {
    if (authing) return;
    setAuthing(true);
    try {
      const supabase = createClient();
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPwd });
        if (error) return toast(error.message, 'error');
        window.location.assign(localizePath('/teachers/apply', locale));
      } else {
        if (authPwd.length < 6) return toast(copy.apply.passwordTooShort, 'error');
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPwd,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(localizePath('/teachers/apply', locale))}`,
          },
        });
        if (error) return toast(error.message, 'error');
        toast(copy.apply.signupSuccess);
        setAuthMode('signin');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.apply.authUnexpectedError;
      toast(message, 'error');
    } finally {
      setAuthing(false);
    }
  };

  const submit = async () => {
    if (!user) return;
    if (!specs.length) return toast(copy.apply.requiredSpecialty, 'error');
    if (!legalName || !displayName || !emailField || !phone || !introShort) return toast(copy.apply.requiredFields, 'error');
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
    toast(copy.apply.submittedSuccess);
    setTimeout(() => location.reload(), 1500);
  };

  // 未登入畫面
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-5 py-16">
        <header className="text-center pb-8">
          <h1 className="font-serif text-3xl tracking-widest mb-2">{copy.apply.unauthTitle}</h1>
          <div className="mele-subtitle">{copy.apply.authSubtitle}</div>
          <p className="mt-4 text-white/70 text-sm">{copy.apply.unauthBody}</p>
        </header>
        <TeacherApplyChecklist
          hasAccount={false}
          specialtiesCount={0}
          hasIntro={false}
          hasDocs={false}
          hasVideo={false}
          hasContact={false}
          copy={copy.apply.checklist}
          locale={locale}
        />
        <div className="mele-card space-y-4">
          <div className="flex border-b border-accent-dim mb-2">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAuthMode(m)}
                className={`flex-1 py-3 text-sm tracking-widest ${authMode === m ? 'text-accent border-b-2 border-accent' : 'text-white/60'}`}
              >
                {m === 'signin' ? copy.apply.signIn : copy.apply.signUp}
              </button>
            ))}
          </div>
          <input type="email" placeholder={copy.apply.email} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="mele-input" />
          <input type="password" placeholder={copy.apply.password} minLength={6} value={authPwd} onChange={(e) => setAuthPwd(e.target.value)} className="mele-input" />
          <button onClick={() => auth(authMode!)} disabled={authing} className="mele-btn-primary w-full">
            {authing ? copy.apply.authing : authMode === 'signin' ? copy.apply.signIn : copy.apply.signUp}
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
          <h1 className="font-serif text-3xl tracking-widest mb-2">{copy.apply.existingTitle}</h1>
          <div className="mele-subtitle">{copy.apply.existingSubtitle}</div>
        </header>
        <div className="mele-card text-center py-10">
          <div className="font-serif text-3xl text-accent mb-3">{copy.apply.statusLabels[existing.status] ?? existing.status}</div>
          <div className="text-white/70 mb-5">{copy.apply.submittedAt} {new Date(existing.submitted_at).toLocaleDateString(locale)}</div>
          <TeacherApplyChecklist
            hasAccount
            specialtiesCount={existing.specialties?.length ?? 0}
            hasIntro={Boolean(existing.intro_short)}
            hasDocs={Boolean(existing.id_doc_front_url || existing.id_doc_back_url)}
            hasVideo={Boolean(existing.intro_video_url)}
            hasContact={Boolean(existing.line_url || existing.instagram || existing.facebook || existing.threads || existing.youtube)}
            copy={copy.apply.checklist}
            locale={locale}
          />
          {existing.reviewer_notes && (
            <div className="text-left bg-black/30 p-4 rounded-lg text-sm">
              <strong className="text-accent">{copy.apply.reviewerNotes}</strong>
              <br />
              {existing.reviewer_notes}
            </div>
          )}
          <Link href={localizePath('/', locale)} className="mele-btn-secondary mt-6 inline-block">{copy.apply.home}</Link>
        </div>
      </div>
    );
  }

  // 表單
  return (
    <div className="container mx-auto max-w-3xl px-5 py-12">
      <header className="text-center pb-6">
        <h1 className="font-serif text-3xl tracking-widest mb-2">{copy.apply.formTitle}</h1>
        <div className="mele-subtitle">{copy.apply.formSubtitle}</div>
        <p className="mt-4 text-white/70 text-sm leading-loose">
          {copy.apply.formBody}
        </p>
      </header>

      <TeacherApplyChecklist
        hasAccount
        specialtiesCount={specs.length}
        hasIntro={Boolean(introShort.trim())}
        hasDocs={Boolean(idFront || idBack)}
        hasVideo={Boolean(introVideoUrl.trim())}
        hasContact={Boolean(lineUrl.trim() || instagram.trim() || facebook.trim() || threads.trim() || youtube.trim() || website.trim())}
        copy={copy.apply.checklist}
        locale={locale}
      />

      <div className="mele-card space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="mele-label">{copy.apply.legalName}</label><input value={legalName} onChange={(e) => setLegalName(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">{copy.apply.displayName}</label><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={copy.apply.displayPlaceholder} className="mele-input" /></div>
          <div><label className="mele-label">{copy.apply.email} *</label><input type="email" value={emailField} onChange={(e) => setEmailField(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">{copy.apply.phone}</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="mele-input" /></div>
        </div>

        <div>
          <label className="mele-label">{copy.apply.specialtyLabel}</label>
          <div className="flex flex-wrap gap-2">
            {copy.specialties.filter((item) => item.value !== '全部').map((s) => {
              const checked = specs.includes(s.value);
              return (
                <label key={s.value} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition ${
                  checked ? 'bg-accent text-primary border-accent' : 'border-accent-dim hover:border-accent'
                }`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setSpecs(checked ? specs.filter((x) => x !== s.value) : [...specs, s.value])}
                    className="hidden"
                  />
                  {s.label}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mele-label">{copy.apply.introShort}</label>
          <input maxLength={30} value={introShort} onChange={(e) => setIntroShort(e.target.value)} className="mele-input" />
        </div>
        <div>
          <label className="mele-label">{copy.apply.introLong}</label>
          <textarea rows={5} value={introLong} onChange={(e) => setIntroLong(e.target.value)} className="mele-input" placeholder={copy.apply.introLongPlaceholder} />
        </div>
        <div>
          <label className="mele-label">{copy.apply.quote}</label>
          <input value={quote} onChange={(e) => setQuote(e.target.value)} placeholder={copy.apply.quotePlaceholder} className="mele-input" />
        </div>

        <hr className="border-accent-dim" />
        <div className="text-accent text-xs tracking-widest">{copy.apply.docsKicker}</div>

        <div><label className="mele-label">{copy.apply.idFront}</label><input type="file" accept="image/*" onChange={(e) => setIdFront(e.target.files?.[0] ?? null)} className="mele-input" /></div>
        <div><label className="mele-label">{copy.apply.idBack}</label><input type="file" accept="image/*" onChange={(e) => setIdBack(e.target.files?.[0] ?? null)} className="mele-input" /></div>
        <div><label className="mele-label">{copy.apply.videoUrl}</label><input type="url" value={introVideoUrl} onChange={(e) => setIntroVideoUrl(e.target.value)} placeholder={copy.apply.videoPlaceholder} className="mele-input" /></div>

        <hr className="border-accent-dim" />
        <div className="text-accent text-xs tracking-widest">{copy.apply.socialsKicker}</div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="mele-label">{copy.apply.lineUrl}</label><input type="url" value={lineUrl} onChange={(e) => setLineUrl(e.target.value)} placeholder="https://lin.ee/..." className="mele-input" /></div>
          <div><label className="mele-label">Instagram</label><input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">Threads</label><input type="url" value={threads} onChange={(e) => setThreads(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">Facebook</label><input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">YouTube</label><input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="mele-input" /></div>
          <div><label className="mele-label">{copy.apply.website}</label><input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mele-input" /></div>
        </div>

        <div className="bg-accent/[0.08] border border-accent-dim rounded-lg p-4 text-sm leading-loose">
          <strong className="text-accent">{copy.apply.submitNoticeTitle}</strong>
          {copy.apply.submitNoticeItems.map((item) => (
            <span key={item}><br />• {item}</span>
          ))}
        </div>

        <button onClick={submit} disabled={submitting} className="mele-btn-primary w-full">
          {submitting ? copy.apply.submitting : copy.apply.submit}
        </button>
      </div>
    </div>
  );
}
