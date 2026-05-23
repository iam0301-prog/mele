'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  mergeTeacherBriefDraft,
  type TeacherBriefDraft,
  type TeacherConsultationBrief,
  type TeacherSopKey,
} from '@/lib/teacher-consultation-briefs';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

export type TeacherWorkbenchCard = {
  id: string;
  bookingId: string | null;
  scheduledAt: string | null;
  status: string;
  customerLabel: string;
  brief: TeacherConsultationBrief;
  draft?: TeacherBriefDraft | null;
  savedStatus?: string | null;
};

type Props = {
  cards: TeacherWorkbenchCard[];
  demoMode?: boolean;
  locale?: Locale;
};

type WorkbenchCopy = {
  sopLabels: Record<TeacherSopKey, string>;
  ariaEmpty: string;
  ariaMain: string;
  eyebrow: string;
  emptyTitle: string;
  emptyBody: string;
  heroTitle: string;
  heroBody: string;
  sourcesEyebrow: string;
  sourceControlsLabel: string;
  prevSource: string;
  nextSource: string;
  railLabel: string;
  copyButton: string;
  saveButton: string;
  savingButton: string;
  draftStatus: string;
  beginnerAria: string;
  beginnerEyebrow: string;
  beginnerTitle: string;
  oneLinerLabel: string;
  breakdownLabel: string;
  detailAria: string;
  detailEyebrow: string;
  coreDraftLabel: string;
  chartHighlightsLabel: string;
  questionsLabel: string;
  strengthsLabel: string;
  shadowsLabel: string;
  avoidLabel: string;
  sopEyebrow: string;
  sopTitle: string;
  stageScriptLabel: string;
  copyTextLabel: string;
  updatedMessage: string;
  copiedMessage: string;
  copyBlockedMessage: string;
  demoSaveMessage: string;
  saveSuccessMessage: string;
  saveFailedPrefix: string;
};

const WORKBENCH_COPY: Record<Locale, WorkbenchCopy> = {
  'zh-TW': {
    sopLabels: { opening: '開場', gift: '天賦', shadow: '陰影', action: '行動', closing: '收尾' },
    ariaEmpty: '解盤工作台',
    ariaMain: '全功能老師解盤工作台',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: '解盤工作台',
    emptyBody: '目前沒有可整理的預約命盤。當客人預約並附上問題或命盤後，這裡會自動生成老師備課摘要。',
    heroTitle: '全功能解盤工作台',
    heroBody: '把客人的問題、命盤重點、白話解讀與五段式諮詢流程放在同一個介面。這份內容只給老師備課使用，可以先改語氣再帶進正式諮詢。',
    sourcesEyebrow: 'ORACLE SOURCES',
    sourceControlsLabel: '切換命盤來源',
    prevSource: '上一個命盤來源',
    nextSource: '下一個命盤來源',
    railLabel: '命盤來源輪播',
    copyButton: '複製備課文字',
    saveButton: '儲存草稿',
    savingButton: '儲存中',
    draftStatus: '草稿狀態',
    beginnerAria: '完全白話導讀',
    beginnerEyebrow: '給沒學過的人也聽得懂',
    beginnerTitle: '完全白話導讀',
    oneLinerLabel: '老師可直接說',
    breakdownLabel: '拆解再拆解',
    detailAria: '深度解盤素材',
    detailEyebrow: '老師深度備課',
    coreDraftLabel: '老師說法草稿',
    chartHighlightsLabel: '盤面重點',
    questionsLabel: '適合問的問題',
    strengthsLabel: '天賦與優勢',
    shadowsLabel: '卡點與陰影',
    avoidLabel: '諮詢中要避免的說法',
    sopEyebrow: '老師現場可以照這個順序走',
    sopTitle: '五段式諮詢 SOP（照順序講）',
    stageScriptLabel: '老師可以直接這樣說',
    copyTextLabel: '可複製文字版',
    updatedMessage: '已更新草稿，記得儲存。',
    copiedMessage: '已複製備課文字，可以貼到你的諮詢筆記再微調。',
    copyBlockedMessage: '瀏覽器暫時不允許自動複製，請直接選取下方文字。',
    demoSaveMessage: '展示模式不會寫入資料庫；正式預約會啟用儲存。',
    saveSuccessMessage: '已儲存老師草稿，客人不會看到這份備課筆記。',
    saveFailedPrefix: '儲存失敗',
  },
  en: {
    sopLabels: { opening: 'Opening', gift: 'Gift', shadow: 'Shadow', action: 'Action', closing: 'Closing' },
    ariaEmpty: 'Guide workspace',
    ariaMain: 'Full guide consultation workspace',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: 'Guide workspace',
    emptyBody: 'No booked chart is ready yet. When a member books and leaves a question or chart, the prep brief will appear here.',
    heroTitle: 'Full guide workspace',
    heroBody: 'Client question, chart signals, beginner-friendly explanation, and the five-step consultation flow stay on one page. This is private prep for the guide and can be edited before the live session.',
    sourcesEyebrow: 'ORACLE SOURCES',
    sourceControlsLabel: 'Switch chart source',
    prevSource: 'Previous chart source',
    nextSource: 'Next chart source',
    railLabel: 'Chart source carousel',
    copyButton: 'Copy prep text',
    saveButton: 'Save draft',
    savingButton: 'Saving',
    draftStatus: 'Draft status',
    beginnerAria: 'Beginner-friendly guide',
    beginnerEyebrow: 'Clear enough for a first-time client',
    beginnerTitle: 'Beginner-friendly guide',
    oneLinerLabel: 'Guide can say this',
    breakdownLabel: 'Layer-by-layer breakdown',
    detailAria: 'Deep reading material',
    detailEyebrow: 'Guide deep prep',
    coreDraftLabel: 'Guide script draft',
    chartHighlightsLabel: 'Chart signals',
    questionsLabel: 'Useful questions',
    strengthsLabel: 'Gifts and strengths',
    shadowsLabel: 'Blocks and shadows',
    avoidLabel: 'Avoid saying',
    sopEyebrow: 'Use this order during the session',
    sopTitle: 'Five-step consultation SOP',
    stageScriptLabel: 'Suggested guide wording',
    copyTextLabel: 'Copy-ready text',
    updatedMessage: 'Draft updated. Remember to save.',
    copiedMessage: 'Prep text copied. Paste it into your consultation notes and adjust the tone.',
    copyBlockedMessage: 'The browser blocked automatic copy. Select the text below manually.',
    demoSaveMessage: 'Demo mode does not write to the database. Real bookings can save drafts.',
    saveSuccessMessage: 'Guide draft saved. The member will not see this prep note.',
    saveFailedPrefix: 'Save failed',
  },
  vi: {
    sopLabels: { opening: 'Mở đầu', gift: 'Điểm mạnh', shadow: 'Điểm kẹt', action: 'Hành động', closing: 'Kết thúc' },
    ariaEmpty: 'Không gian chuẩn bị tư vấn',
    ariaMain: 'Không gian giải đọc đầy đủ cho guide',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: 'Không gian chuẩn bị tư vấn',
    emptyBody: 'Chưa có lá số đặt lịch để chuẩn bị. Khi khách đặt lịch và để lại câu hỏi hoặc lá số, bản tóm tắt sẽ xuất hiện ở đây.',
    heroTitle: 'Không gian giải đọc đầy đủ',
    heroBody: 'Câu hỏi của khách, tín hiệu lá số, diễn giải dễ hiểu và quy trình tư vấn năm bước được đặt chung một trang. Nội dung này chỉ dành cho guide chuẩn bị và có thể sửa giọng trước buổi tư vấn.',
    sourcesEyebrow: 'NGUỒN GIẢI ĐỌC',
    sourceControlsLabel: 'Đổi nguồn lá số',
    prevSource: 'Nguồn trước',
    nextSource: 'Nguồn tiếp theo',
    railLabel: 'Vòng chọn nguồn lá số',
    copyButton: 'Sao chép ghi chú',
    saveButton: 'Lưu nháp',
    savingButton: 'Đang lưu',
    draftStatus: 'Trạng thái nháp',
    beginnerAria: 'Diễn giải cho người mới',
    beginnerEyebrow: 'Người chưa học cũng hiểu được',
    beginnerTitle: 'Diễn giải cho người mới',
    oneLinerLabel: 'Guide có thể nói',
    breakdownLabel: 'Tách từng lớp',
    detailAria: 'Tư liệu giải đọc sâu',
    detailEyebrow: 'Guide chuẩn bị sâu',
    coreDraftLabel: 'Bản nháp lời nói',
    chartHighlightsLabel: 'Tín hiệu lá số',
    questionsLabel: 'Câu hỏi nên dùng',
    strengthsLabel: 'Năng lực và điểm mạnh',
    shadowsLabel: 'Điểm kẹt và bóng tối',
    avoidLabel: 'Câu nên tránh',
    sopEyebrow: 'Có thể đi theo thứ tự này',
    sopTitle: 'Quy trình tư vấn năm bước',
    stageScriptLabel: 'Câu guide có thể nói',
    copyTextLabel: 'Bản chữ có thể sao chép',
    updatedMessage: 'Đã cập nhật nháp, nhớ lưu lại.',
    copiedMessage: 'Đã sao chép ghi chú chuẩn bị.',
    copyBlockedMessage: 'Trình duyệt tạm chặn sao chép tự động. Hãy chọn phần chữ bên dưới.',
    demoSaveMessage: 'Chế độ demo không ghi vào database; lịch thật sẽ bật lưu nháp.',
    saveSuccessMessage: 'Đã lưu nháp của guide. Khách sẽ không thấy ghi chú này.',
    saveFailedPrefix: 'Lưu thất bại',
  },
  id: {
    sopLabels: { opening: 'Pembuka', gift: 'Kekuatan', shadow: 'Hambatan', action: 'Aksi', closing: 'Penutup' },
    ariaEmpty: 'Ruang kerja guide',
    ariaMain: 'Ruang kerja konsultasi lengkap',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: 'Ruang kerja guide',
    emptyBody: 'Belum ada bagan booking untuk disiapkan. Saat klien memesan dan meninggalkan pertanyaan atau bagan, ringkasan persiapan akan muncul di sini.',
    heroTitle: 'Ruang kerja konsultasi lengkap',
    heroBody: 'Pertanyaan klien, sinyal bagan, penjelasan ramah pemula, dan alur konsultasi lima langkah berada dalam satu halaman. Ini hanya untuk persiapan guide dan bisa diedit sebelum sesi.',
    sourcesEyebrow: 'SUMBER ORACLE',
    sourceControlsLabel: 'Ganti sumber bagan',
    prevSource: 'Sumber sebelumnya',
    nextSource: 'Sumber berikutnya',
    railLabel: 'Carousel sumber bagan',
    copyButton: 'Salin catatan',
    saveButton: 'Simpan draft',
    savingButton: 'Menyimpan',
    draftStatus: 'Status draft',
    beginnerAria: 'Panduan ramah pemula',
    beginnerEyebrow: 'Jelas untuk klien baru',
    beginnerTitle: 'Panduan ramah pemula',
    oneLinerLabel: 'Guide bisa mengatakan',
    breakdownLabel: 'Uraian bertahap',
    detailAria: 'Materi bacaan mendalam',
    detailEyebrow: 'Persiapan mendalam',
    coreDraftLabel: 'Draft naskah guide',
    chartHighlightsLabel: 'Sinyal bagan',
    questionsLabel: 'Pertanyaan berguna',
    strengthsLabel: 'Bakat dan kekuatan',
    shadowsLabel: 'Hambatan dan bayangan',
    avoidLabel: 'Hindari mengatakan',
    sopEyebrow: 'Gunakan urutan ini saat sesi',
    sopTitle: 'SOP konsultasi lima langkah',
    stageScriptLabel: 'Kalimat yang bisa dipakai guide',
    copyTextLabel: 'Teks siap salin',
    updatedMessage: 'Draft diperbarui. Jangan lupa simpan.',
    copiedMessage: 'Catatan persiapan tersalin.',
    copyBlockedMessage: 'Browser memblokir salin otomatis. Pilih teks di bawah secara manual.',
    demoSaveMessage: 'Mode demo tidak menulis ke database. Booking asli dapat menyimpan draft.',
    saveSuccessMessage: 'Draft guide tersimpan. Klien tidak akan melihat catatan ini.',
    saveFailedPrefix: 'Gagal menyimpan',
  },
  ja: {
    sopLabels: { opening: '導入', gift: '才能', shadow: '影', action: '行動', closing: '締め' },
    ariaEmpty: '鑑定準備ワークスペース',
    ariaMain: '全機能鑑定ワークスペース',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: '鑑定準備ワークスペース',
    emptyBody: '準備できる予約命盤はまだありません。相談者が予約して質問や命盤を添えると、ここに準備メモが生成されます。',
    heroTitle: '全機能鑑定ワークスペース',
    heroBody: '相談者の質問、盤面サイン、初心者向け説明、五段階の相談フローを一つの画面にまとめます。この内容は鑑定者の準備用で、実際の相談前に語り口を編集できます。',
    sourcesEyebrow: 'ORACLE SOURCES',
    sourceControlsLabel: '命盤ソースを切り替え',
    prevSource: '前の命盤ソース',
    nextSource: '次の命盤ソース',
    railLabel: '命盤ソースのカルーセル',
    copyButton: '準備文をコピー',
    saveButton: '下書き保存',
    savingButton: '保存中',
    draftStatus: '下書き状態',
    beginnerAria: '初心者向け導読',
    beginnerEyebrow: '初めての人にも伝わる',
    beginnerTitle: '初心者向け導読',
    oneLinerLabel: '鑑定者がそのまま言える',
    breakdownLabel: '段階的に分解',
    detailAria: '深掘り素材',
    detailEyebrow: '鑑定者の深掘り準備',
    coreDraftLabel: '話し方の下書き',
    chartHighlightsLabel: '盤面の要点',
    questionsLabel: '使いやすい質問',
    strengthsLabel: '才能と強み',
    shadowsLabel: 'つまずきと影',
    avoidLabel: '避けたい言い方',
    sopEyebrow: 'この順番で進められる',
    sopTitle: '五段階相談 SOP',
    stageScriptLabel: 'そのまま使える言い方',
    copyTextLabel: 'コピー用テキスト',
    updatedMessage: '下書きを更新しました。保存してください。',
    copiedMessage: '準備文をコピーしました。',
    copyBlockedMessage: 'ブラウザが自動コピーをブロックしました。下の文字を選択してください。',
    demoSaveMessage: 'デモモードではデータベースに保存しません。本番予約では保存できます。',
    saveSuccessMessage: '鑑定者用の下書きを保存しました。相談者には表示されません。',
    saveFailedPrefix: '保存失敗',
  },
  ko: {
    sopLabels: { opening: '시작', gift: '재능', shadow: '그림자', action: '행동', closing: '마무리' },
    ariaEmpty: '상담 준비 작업대',
    ariaMain: '전체 상담 준비 작업대',
    eyebrow: 'CONSULTATION ATELIER',
    emptyTitle: '상담 준비 작업대',
    emptyBody: '아직 정리할 예약 차트가 없습니다. 고객이 예약하고 질문이나 차트를 남기면 이곳에 준비 요약이 생성됩니다.',
    heroTitle: '전체 상담 준비 작업대',
    heroBody: '고객 질문, 차트 신호, 초보자도 이해하는 설명, 5단계 상담 흐름을 한 화면에 모읍니다. 이 내용은 상담자 준비용이며 실제 상담 전에 말투를 수정할 수 있습니다.',
    sourcesEyebrow: 'ORACLE SOURCES',
    sourceControlsLabel: '차트 출처 전환',
    prevSource: '이전 차트 출처',
    nextSource: '다음 차트 출처',
    railLabel: '차트 출처 캐러셀',
    copyButton: '준비 글 복사',
    saveButton: '초안 저장',
    savingButton: '저장 중',
    draftStatus: '초안 상태',
    beginnerAria: '초보자용 안내',
    beginnerEyebrow: '처음 듣는 사람도 이해하게',
    beginnerTitle: '초보자용 안내',
    oneLinerLabel: '상담자가 바로 말할 수 있는 문장',
    breakdownLabel: '단계별로 풀기',
    detailAria: '심화 해석 자료',
    detailEyebrow: '상담자 심화 준비',
    coreDraftLabel: '상담자 말하기 초안',
    chartHighlightsLabel: '차트 핵심',
    questionsLabel: '좋은 질문',
    strengthsLabel: '재능과 강점',
    shadowsLabel: '막힘과 그림자',
    avoidLabel: '피해야 할 말',
    sopEyebrow: '이 순서대로 진행',
    sopTitle: '5단계 상담 SOP',
    stageScriptLabel: '바로 쓸 수 있는 표현',
    copyTextLabel: '복사용 텍스트',
    updatedMessage: '초안을 업데이트했습니다. 저장해 주세요.',
    copiedMessage: '준비 글을 복사했습니다.',
    copyBlockedMessage: '브라우저가 자동 복사를 막았습니다. 아래 텍스트를 직접 선택하세요.',
    demoSaveMessage: '데모 모드는 데이터베이스에 저장하지 않습니다. 실제 예약에서 초안 저장이 활성화됩니다.',
    saveSuccessMessage: '상담자 초안을 저장했습니다. 고객에게는 보이지 않습니다.',
    saveFailedPrefix: '저장 실패',
  },
};

function getWorkbenchCopy(locale: Locale = DEFAULT_LOCALE) {
  return WORKBENCH_COPY[locale] ?? WORKBENCH_COPY[DEFAULT_LOCALE];
}

function linesToText(lines: string[]) {
  return lines.join('\n');
}

function textToLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatScheduledAt(value: string) {
  return value
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
    .replace(/Z$/, ' UTC')
    .slice(0, 16);
}

export function TeacherBriefWorkbench({ cards, demoMode = false, locale = DEFAULT_LOCALE }: Props) {
  const copy = getWorkbenchCopy(locale);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState(cards[0]?.id ?? '');
  const [drafts, setDrafts] = useState<Record<string, TeacherBriefDraft>>(() =>
    Object.fromEntries(cards.map((card) => [card.id, card.draft ?? {}])),
  );
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const activeCard = cards.find((card) => card.id === activeId) ?? cards[0];
  const draft = useMemo(
    () => activeCard ? drafts[activeCard.id] ?? {} : {},
    [activeCard, drafts],
  );
  const merged = useMemo(
    () => activeCard ? mergeTeacherBriefDraft(activeCard.brief, draft) : null,
    [activeCard, draft],
  );
  const activeIndex = Math.max(cards.findIndex((card) => card.id === activeCard?.id), 0);

  function centerRailCard(index: number) {
    window.requestAnimationFrame(() => {
      const target = railRef.current?.querySelectorAll<HTMLButtonElement>('button')[index];
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  function selectCard(id: string, index: number) {
    setActiveId(id);
    setMessage('');
    centerRailCard(index);
  }

  function stepCard(direction: -1 | 1) {
    if (!cards.length) return;
    const nextIndex = (activeIndex + direction + cards.length) % cards.length;
    selectCard(cards[nextIndex].id, nextIndex);
  }

  function patchDraft(patch: TeacherBriefDraft) {
    if (!activeCard) return;
    setDrafts((current) => ({
      ...current,
      [activeCard.id]: {
        ...current[activeCard.id],
        ...patch,
      },
    }));
    setMessage(copy.updatedMessage);
  }

  function patchList(field: 'conversationBreakdown' | 'chartHighlights' | 'strengths' | 'shadows' | 'questions' | 'avoidSayings', value: string) {
    patchDraft({ [field]: textToLines(value) } as TeacherBriefDraft);
  }

  function patchStage(key: TeacherSopKey, script: string) {
    if (!activeCard) return;
    const currentDraft = drafts[activeCard.id] ?? {};
    patchDraft({
      sopStages: {
        ...currentDraft.sopStages,
        [key]: {
          ...currentDraft.sopStages?.[key],
          script,
        },
      },
    });
  }

  async function copyBrief() {
    if (!merged) return;
    try {
      await navigator.clipboard.writeText(merged.copyText);
      setMessage(copy.copiedMessage);
    } catch {
      setMessage(copy.copyBlockedMessage);
    }
  }

  function saveDraft() {
    if (!activeCard || !merged) return;
    if (demoMode || !activeCard.bookingId) {
      setMessage(copy.demoSaveMessage);
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc('save_teacher_consultation_brief', {
        p_booking_id: activeCard.bookingId,
        p_generated_brief: activeCard.brief,
        p_teacher_overrides: drafts[activeCard.id] ?? {},
        p_status: 'draft',
      });

      setMessage(error ? `${copy.saveFailedPrefix}：${error.message}` : copy.saveSuccessMessage);
    });
  }

  if (!cards.length || !merged || !activeCard) {
    return (
      <section className="teacher-workbench" aria-label={copy.ariaEmpty}>
        <div className="teacher-workbench__hero">
          <span>{copy.eyebrow}</span>
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyBody}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="teacher-workbench" aria-label={copy.ariaMain}>
      <div className="teacher-workbench__hero">
        <span>{copy.eyebrow}</span>
        <h2>{copy.heroTitle}</h2>
        <p>{copy.heroBody}</p>
      </div>

      <div className="teacher-workbench__layout">
        <div className="teacher-workbench__source-panel">
          <div className="teacher-workbench__source-head">
            <span>{copy.sourcesEyebrow}</span>
            <div className="teacher-workbench__source-controls" aria-label={copy.sourceControlsLabel}>
              <button type="button" onClick={() => stepCard(-1)} aria-label={copy.prevSource}>
                ‹
              </button>
              <strong>
                {String(activeIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
              </strong>
              <button type="button" onClick={() => stepCard(1)} aria-label={copy.nextSource}>
                ›
              </button>
            </div>
          </div>

          <aside ref={railRef} className="teacher-workbench__rail" aria-label={copy.railLabel}>
            {cards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                className={card.id === activeCard.id ? 'is-active' : ''}
                onClick={() => selectCard(card.id, index)}
              >
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{card.brief.sourceLabel}</span>
                <small>{card.customerLabel}</small>
              </button>
            ))}
          </aside>

          <div className="teacher-workbench__source-dots" aria-hidden="true">
            {cards.map((card, index) => (
              <span key={card.id} className={index === activeIndex ? 'is-active' : ''} />
            ))}
          </div>
        </div>

        <div className="teacher-workbench__main">
          <div className="teacher-workbench__summary">
            <div>
              <span>{activeCard.brief.sourceLabel}</span>
              <h3>{merged.title}</h3>
              <p>{merged.clientIntent}</p>
            </div>
            <div className="teacher-workbench__actions">
              <button type="button" onClick={copyBrief}>{copy.copyButton}</button>
              <button type="button" onClick={saveDraft} disabled={isPending}>
                {isPending ? copy.savingButton : copy.saveButton}
              </button>
            </div>
          </div>

          {message && <p className="teacher-workbench__message">{message}</p>}

          <div className="teacher-workbench__tags">
            {merged.tags.map((tag) => <span key={tag}>{tag}</span>)}
            {activeCard.savedStatus && <span>{copy.draftStatus}：{activeCard.savedStatus}</span>}
            {activeCard.scheduledAt && <span>{formatScheduledAt(activeCard.scheduledAt)}</span>}
          </div>

          <div className="teacher-workbench__beginner-map" aria-label={copy.beginnerAria}>
            <div className="teacher-workbench__section-title">
              <span>{copy.beginnerEyebrow}</span>
              <h3>{copy.beginnerTitle}</h3>
            </div>
            <div className="teacher-workbench__beginner-cards">
              {merged.beginnerCards.map((card) => (
                <article key={`${card.label}-${card.title}`}>
                  <span>{card.label}</span>
                  <strong>{card.title}</strong>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>

          <label className="teacher-workbench__one-liner">
            <span>{copy.oneLinerLabel}</span>
            <textarea
              suppressHydrationWarning
              value={merged.plainOneLiner}
              onChange={(event) => patchDraft({ plainOneLiner: event.target.value })}
              rows={2}
            />
          </label>

          <label className="teacher-workbench__field teacher-workbench__field--breakdown">
            <span>{copy.breakdownLabel}</span>
            <textarea
              suppressHydrationWarning
              value={linesToText(merged.conversationBreakdown)}
              onChange={(event) => patchList('conversationBreakdown', event.target.value)}
              rows={6}
            />
          </label>

          {merged.detailSections.length > 0 && (
            <div className="teacher-workbench__detail-sections" aria-label={copy.detailAria}>
              {merged.detailSections.map((section) => (
                <section key={section.title} className="teacher-workbench__detail-section">
                  <div className="teacher-workbench__section-title">
                    <span>{copy.detailEyebrow}</span>
                    <h3>{section.title}</h3>
                  </div>
                  <p>{section.intro}</p>
                  <div className="teacher-workbench__detail-grid">
                    {section.items.map((item) => (
                      <article key={`${section.title}-${item.title}-${item.label}`}>
                        <span>{item.label}</span>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        {item.meta && <small>{item.meta}</small>}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <label className="teacher-workbench__field">
            <span>{copy.coreDraftLabel}</span>
            <textarea
              suppressHydrationWarning
              value={merged.coreSummary}
              onChange={(event) => patchDraft({ coreSummary: event.target.value })}
              rows={4}
            />
          </label>

          <div className="teacher-workbench__grid">
            <label className="teacher-workbench__field">
              <span>{copy.chartHighlightsLabel}</span>
              <textarea
                suppressHydrationWarning
                value={linesToText(merged.chartHighlights)}
                onChange={(event) => patchList('chartHighlights', event.target.value)}
                rows={6}
              />
            </label>
            <label className="teacher-workbench__field">
              <span>{copy.questionsLabel}</span>
              <textarea
                suppressHydrationWarning
                value={linesToText(merged.questions)}
                onChange={(event) => patchList('questions', event.target.value)}
                rows={6}
              />
            </label>
          </div>

          <div className="teacher-workbench__grid">
            <label className="teacher-workbench__field teacher-workbench__field--warm">
              <span>{copy.strengthsLabel}</span>
              <textarea
                suppressHydrationWarning
                value={linesToText(merged.strengths)}
                onChange={(event) => patchList('strengths', event.target.value)}
                rows={7}
              />
            </label>
            <label className="teacher-workbench__field teacher-workbench__field--cool">
              <span>{copy.shadowsLabel}</span>
              <textarea
                suppressHydrationWarning
                value={linesToText(merged.shadows)}
                onChange={(event) => patchList('shadows', event.target.value)}
                rows={7}
              />
            </label>
          </div>

          <label className="teacher-workbench__field">
            <span>{copy.avoidLabel}</span>
            <textarea
              suppressHydrationWarning
              value={linesToText(merged.avoidSayings)}
              onChange={(event) => patchList('avoidSayings', event.target.value)}
              rows={4}
            />
          </label>

          <div className="teacher-workbench__sop">
            <div className="teacher-workbench__section-title">
              <span>{copy.sopEyebrow}</span>
              <h3>{copy.sopTitle}</h3>
            </div>
            {merged.sopStages.map((stage) => (
              <article key={stage.key} className="teacher-workbench__stage">
                <div>
                  <span>{copy.sopLabels[stage.key]}</span>
                  <h4>{stage.title}</h4>
                  <p>{stage.intent}</p>
                </div>
                <label>
                  <span>{copy.stageScriptLabel}</span>
                  <textarea
                    suppressHydrationWarning
                    value={stage.script}
                    onChange={(event) => patchStage(stage.key, event.target.value)}
                    rows={4}
                  />
                </label>
                <ul>
                  {stage.questions.map((question) => <li key={question}>{question}</li>)}
                </ul>
                <small>{stage.notes}</small>
              </article>
            ))}
          </div>

          <label className="teacher-workbench__copy">
            <span>{copy.copyTextLabel}</span>
            <textarea suppressHydrationWarning value={merged.copyText} readOnly rows={14} />
          </label>
        </div>
      </div>
    </section>
  );
}
