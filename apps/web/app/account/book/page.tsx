'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import { DEFAULT_LOCALE, getLocaleFromPathname, localizePath, type Locale } from '@/lib/i18n/config';

type Gender = 'female' | 'male';

interface Availability {
  day_of_week: number | null;
  start_time: string;
  end_time: string;
}

interface BookedSlot {
  scheduled_at: string;
  duration_minutes: number;
}

interface TeacherLite {
  display_name: string;
  line_url: string | null;
}

interface ServiceLite {
  name: string;
  description: string | null;
  duration_minutes: number;
  price_ntd: number;
}

const FREE_BOOKING_TEST_MODE =
  process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';

type QuestionOption = {
  value: string;
  label: string;
  hint: string;
};

type BookCopy = {
  chartTools: QuestionOption[];
  questionTopics: QuestionOption[];
  painPoints: QuestionOption[];
  sessionGoals: QuestionOption[];
  prefixes: { topic: string; pain: string; goal: string; note: string };
  empty: { topic: string; pain: string; goal: string; note: string; selectedTime: string };
  steps: string[];
  title: string;
  subtitle: string;
  intro: string;
  teacherServiceHint: string;
  freeTest: string;
  serviceReminder: string;
  next: string;
  back: string;
  pickTimeTitle: string;
  pickTimeSubtitle: string;
  pickTimeIntro: string;
  noSlots: string;
  lineAsk: string;
  questionTitle: string;
  questionSubtitle: string;
  questionIntro: string;
  topicQuestion: string;
  painQuestion: string;
  goalQuestion: string;
  noteLabel: string;
  notePlaceholder: string;
  chartOptionalTitle: string;
  chartOptionalBody: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  female: string;
  male: string;
  reviewTitle: string;
  reviewSubtitle: string;
  reviewTeacher: string;
  reviewService: string;
  reviewTime: string;
  reviewTopic: string;
  reviewPain: string;
  reviewGoal: string;
  reviewNote: string;
  reviewChart: string;
  amount: string;
  betaFreeLabel: string;
  freeBadge: string;
  freeReviewNote: string;
  paidReviewNote: string;
  cancelPolicyTitle: string;
  cancelPolicyLines: string[];
  submitting: string;
  confirmFree: string;
  confirmPay: string;
  missingParams: string;
  loading: string;
  validationError: string;
  bookingFailed: string;
  freeCreated: string;
  paidCreated: string;
};

const BOOK_COPY: Record<Locale, BookCopy> = {
  'zh-TW': {
    chartTools: [
      { value: '', label: '不附加命盤', hint: '' },
      { value: 'bazi', label: '八字', hint: '' },
      { value: 'ziwei', label: '紫微斗數', hint: '' },
      { value: 'numerology', label: '生命靈數', hint: '' },
      { value: 'astro', label: '西洋占星', hint: '' },
      { value: 'humandesign', label: '人類圖', hint: '' },
      { value: 'maya', label: '馬雅曆', hint: '' },
    ],
    questionTopics: [
      { value: 'love', label: '感情 / 關係', hint: '曖昧、伴侶、復合、相處卡關' },
      { value: 'career', label: '工作 / 事業', hint: '轉職、升遷、方向、合作' },
      { value: 'family', label: '家庭 / 親子', hint: '家人互動、親子、責任分配' },
      { value: 'self', label: '自我定位', hint: '個人狀態、天賦、人生選擇' },
      { value: 'year', label: '年度方向', hint: '近期運勢、未來節奏、重要計畫' },
      { value: 'spiritual', label: '直覺與內在整理', hint: '反覆卡點、直覺訊息、內在整理' },
    ],
    painPoints: [
      { value: 'repeat', label: '一直重複同樣狀況', hint: '明明換了人事物，感覺還是很像' },
      { value: 'choice', label: '不知道怎麼選', hint: '兩邊都有理由，遲遲無法下決定' },
      { value: 'relationship', label: '關係拉扯', hint: '在乎對方，但互動讓你消耗' },
      { value: 'energy', label: '能量消耗', hint: '最近很累、提不起勁或很難穩住' },
      { value: 'money', label: '金錢 / 安全感', hint: '收入、花費、價值感或穩定感' },
      { value: 'timing', label: '時機不確定', hint: '不知道現在適不適合開始或放下' },
    ],
    sessionGoals: [
      { value: 'clarity', label: '先看清楚問題', hint: '想知道自己到底卡在哪裡' },
      { value: 'action', label: '帶走可做的方法', hint: '希望諮詢後有一個下一步' },
      { value: 'comfort', label: '被理解與安定', hint: '希望有人陪你把情緒整理好' },
      { value: 'decision', label: '幫助做決定', hint: '需要把選項與風險看清楚' },
    ],
    prefixes: { topic: '想問主題：', pain: '目前卡點：', goal: '這次想帶走：', note: '客人補充：' },
    empty: { topic: '尚未選擇', pain: '尚未選擇', goal: '尚未選擇', note: '尚未補充', selectedTime: '尚未選擇' },
    steps: ['確認服務', '選擇時段', '填寫問題', '確認預約'],
    title: '預約諮詢',
    subtitle: 'BOOK A SESSION',
    intro: '預約會分成四步：確認服務、選擇時段、先讓老師理解你的問題、確認預約。公測期間全程免費體驗，老師會依你的問題與附加命盤準備諮詢。',
    teacherServiceHint: '你即將預約這位老師的服務',
    freeTest: '測試期免費：你可以先完整測試預約流程，不會進入付款頁，也不會產生實際收費。',
    serviceReminder: '建議先確認這項服務是否符合你的問題類型。若需要臨時補充背景，付款後仍可在「我的諮詢」查看與管理。',
    next: '下一步',
    back: '上一步',
    pickTimeTitle: '選擇時段',
    pickTimeSubtitle: 'PICK A TIME',
    pickTimeIntro: '下方只顯示老師近期開放且尚未被預約的時段。正式付款前，系統仍會以資料庫狀態再次確認，避免多人同時搶同一格。',
    noSlots: '老師近期無可預約時段',
    lineAsk: 'LINE 詢問',
    questionTitle: '先讓老師理解你',
    questionSubtitle: 'YOUR QUESTION MAP',
    questionIntro: '先用幾個小選單把問題說清楚。老師端會先看到你的主題、卡點與想帶走的結果，再把命盤解讀放回你的問題裡。',
    topicQuestion: '這次主要想問什麼？',
    painQuestion: '你現在最卡的是什麼？',
    goalQuestion: '這次諮詢最想帶走什麼？',
    noteLabel: '用一句話補充你的狀況 *',
    notePlaceholder: '例如：我想知道要不要換工作，但又怕選錯。或：這段感情一直拉扯，我不知道該不該繼續。',
    chartOptionalTitle: '選填：附加簡易命盤資料，讓老師更快掌握背景',
    chartOptionalBody: '若你願意提供出生資料，老師能更快掌握背景。這些資料會依隱私權政策保存，之後也可在個人檔案更新。',
    birthDate: '出生日期',
    birthTime: '出生時間',
    gender: '生理性別',
    female: '女',
    male: '男',
    reviewTitle: '確認預約',
    reviewSubtitle: 'REVIEW & CONFIRM',
    reviewTeacher: '老師',
    reviewService: '服務',
    reviewTime: '時間',
    reviewTopic: '主題',
    reviewPain: '卡點',
    reviewGoal: '想帶走',
    reviewNote: '補充',
    reviewChart: '附加命盤',
    amount: '公測狀態：',
    betaFreeLabel: '公測期免費體驗',
    freeBadge: '公測期免費',
    freeReviewNote: '公測期間全程免費體驗，確認後會直接建立預約並回到「我的諮詢」。',
    paidReviewNote: '確認後可在「我的諮詢」查看狀態、聯繫老師或取消預約。',
    cancelPolicyTitle: '取消說明',
    cancelPolicyLines: ['公測期間可隨時取消預約，不涉及任何費用。', '正式開放後將另行公告取消與調整規則。'],
    submitting: '建立預約中...',
    confirmFree: '確認預約',
    confirmPay: '確認預約',
    missingParams: '缺少老師或服務參數。請回到諮詢老師入口重新選擇。',
    loading: '正在讀取預約資料...',
    validationError: '請先選擇時段，並填好主題、卡點、想帶走的結果與一句補充',
    bookingFailed: '預約建立失敗，請稍後再試。',
    freeCreated: '公測期免費預約已建立，不會收費。',
    paidCreated: '預約已建立，正在前往確認頁。',
  },
  en: {
    chartTools: [
      { value: '', label: 'No chart attached', hint: '' },
      { value: 'bazi', label: 'Bazi', hint: '' },
      { value: 'ziwei', label: 'Zi Wei Dou Shu', hint: '' },
      { value: 'numerology', label: 'Numerology', hint: '' },
      { value: 'astro', label: 'Astrology', hint: '' },
      { value: 'humandesign', label: 'Human Design', hint: '' },
      { value: 'maya', label: 'Maya Calendar', hint: '' },
    ],
    questionTopics: [
      { value: 'love', label: 'Love / relationships', hint: 'Dating, partner, reunion, relationship blocks' },
      { value: 'career', label: 'Work / career', hint: 'Job change, promotion, direction, collaboration' },
      { value: 'family', label: 'Family / parenting', hint: 'Family dynamics, parenting, responsibility' },
      { value: 'self', label: 'Self-positioning', hint: 'Current state, gifts, life choices' },
      { value: 'year', label: 'Year direction', hint: 'Near future, timing, important plans' },
      { value: 'spiritual', label: 'Intuition and self-reflection', hint: 'Recurring patterns, intuition, inner signals' },
    ],
    painPoints: [
      { value: 'repeat', label: 'The same situation keeps repeating', hint: 'People change, but the feeling is similar' },
      { value: 'choice', label: 'I do not know how to choose', hint: 'Both sides make sense, so the decision stalls' },
      { value: 'relationship', label: 'Relationship pull', hint: 'You care, but the interaction drains you' },
      { value: 'energy', label: 'Energy drain', hint: 'Tired, low drive, or hard to stay steady' },
      { value: 'money', label: 'Money / security', hint: 'Income, spending, value, or stability' },
      { value: 'timing', label: 'Unclear timing', hint: 'Unsure whether to start or let go now' },
    ],
    sessionGoals: [
      { value: 'clarity', label: 'See the problem clearly', hint: 'Understand where you are stuck' },
      { value: 'action', label: 'Leave with a method', hint: 'Have one next step after the session' },
      { value: 'comfort', label: 'Be understood and steadied', hint: 'Sort the emotions with someone present' },
      { value: 'decision', label: 'Support a decision', hint: 'Clarify options and risks' },
    ],
    prefixes: { topic: 'Topic: ', pain: 'Current block: ', goal: 'Takeaway: ', note: 'Client note: ' },
    empty: { topic: 'Not selected', pain: 'Not selected', goal: 'Not selected', note: 'No extra note', selectedTime: 'Not selected' },
    steps: ['Service', 'Time', 'Question', 'Confirm'],
    title: 'Book a session',
    subtitle: 'BOOK A SESSION',
    intro: 'Booking has four steps: confirm the service, choose a time, help the guide understand your question, then confirm. During the open beta all sessions are complimentary. The guide will prepare from your question and attached chart.',
    teacherServiceHint: 'You are booking this guide’s service',
    freeTest: 'Free test mode: you can test the full booking flow without payment or real charges.',
    serviceReminder: 'Confirm this service fits your question. You can still manage details in My Sessions after booking.',
    next: 'Next',
    back: 'Back',
    pickTimeTitle: 'Pick a time',
    pickTimeSubtitle: 'PICK A TIME',
    pickTimeIntro: 'Only open and unbooked slots are shown. Before payment, the database checks the slot again to avoid double booking.',
    noSlots: 'No available slots soon',
    lineAsk: 'Ask on LINE',
    questionTitle: 'Help the guide understand you',
    questionSubtitle: 'YOUR QUESTION MAP',
    questionIntro: 'Use a few small choices to make the question clear. The guide will see your topic, block, and desired takeaway before reading the chart through your real situation.',
    topicQuestion: 'What do you mainly want to ask?',
    painQuestion: 'What feels most stuck now?',
    goalQuestion: 'What do you most want to take away?',
    noteLabel: 'Add one sentence about your situation *',
    notePlaceholder: 'Example: I am thinking about changing jobs but afraid to choose wrong. Or: this relationship keeps pulling me back and forth.',
    chartOptionalTitle: 'Optional: attach simple chart context',
    chartOptionalBody: 'If you share birth data, the guide can prepare faster. The data follows the privacy policy and can be updated later in your profile.',
    birthDate: 'Birth date',
    birthTime: 'Birth time',
    gender: 'Biological sex',
    female: 'Female',
    male: 'Male',
    reviewTitle: 'Review booking',
    reviewSubtitle: 'REVIEW & CONFIRM',
    reviewTeacher: 'Guide',
    reviewService: 'Service',
    reviewTime: 'Time',
    reviewTopic: 'Topic',
    reviewPain: 'Block',
    reviewGoal: 'Takeaway',
    reviewNote: 'Note',
    reviewChart: 'Attached chart',
    amount: 'Beta status:',
    betaFreeLabel: 'Open beta — complimentary',
    freeBadge: 'Open beta',
    freeReviewNote: 'All sessions are complimentary during the open beta. Confirming will create the booking and return to My Sessions.',
    paidReviewNote: 'After confirming, you can check status, contact the guide, or cancel from My Sessions.',
    cancelPolicyTitle: 'Cancellation',
    cancelPolicyLines: ['During open beta, bookings can be cancelled at any time at no cost.', 'Cancellation terms for paid sessions will be announced when billing opens.'],
    submitting: 'Creating booking...',
    confirmFree: 'Confirm booking',
    confirmPay: 'Confirm booking',
    missingParams: 'Missing guide or service. Please return to the guide entry and choose again.',
    loading: 'Loading booking details...',
    validationError: 'Choose a time and complete topic, block, takeaway, and one short note first.',
    bookingFailed: 'Booking failed. Please try again later.',
    freeCreated: 'Beta booking created. No charge was made.',
    paidCreated: 'Booking created. Redirecting to confirmation.',
  },
  vi: {} as BookCopy,
  id: {} as BookCopy,
  ja: {} as BookCopy,
  ko: {} as BookCopy,
};

BOOK_COPY.vi = {
  ...BOOK_COPY.en,
  chartTools: [
    { value: '', label: 'Không đính kèm lá số', hint: '' },
    { value: 'bazi', label: 'Bát tự', hint: '' },
    { value: 'ziwei', label: 'Tử vi Đẩu số', hint: '' },
    { value: 'numerology', label: 'Thần số học', hint: '' },
    { value: 'astro', label: 'Chiêm tinh', hint: '' },
    { value: 'humandesign', label: 'Thiết kế Con người', hint: '' },
    { value: 'maya', label: 'Lịch Maya', hint: '' },
  ],
  questionTopics: [
    { value: 'love', label: 'Tình cảm / quan hệ', hint: 'Tìm hiểu, người yêu, quay lại, điểm kẹt khi tương tác' },
    { value: 'career', label: 'Công việc / sự nghiệp', hint: 'Đổi việc, thăng tiến, hướng đi, hợp tác' },
    { value: 'family', label: 'Gia đình / con cái', hint: 'Tương tác gia đình, nuôi dạy, phân chia trách nhiệm' },
    { value: 'self', label: 'Định vị bản thân', hint: 'Trạng thái cá nhân, năng lực, lựa chọn đời sống' },
    { value: 'year', label: 'Hướng đi năm nay', hint: 'Vận trình gần đây, nhịp tương lai, kế hoạch quan trọng' },
    { value: 'spiritual', label: 'Tự hiểu và trực giác', hint: 'Khuôn mẫu lặp lại, trực giác, tín hiệu nội tâm' },
  ],
  painPoints: [
    { value: 'repeat', label: 'Cùng một tình huống cứ lặp lại', hint: 'Người và việc thay đổi nhưng cảm giác vẫn giống' },
    { value: 'choice', label: 'Không biết nên chọn thế nào', hint: 'Hai bên đều có lý, nên quyết định bị treo' },
    { value: 'relationship', label: 'Quan hệ kéo qua kéo lại', hint: 'Bạn quan tâm nhưng tương tác làm bạn hao năng lượng' },
    { value: 'energy', label: 'Hao năng lượng', hint: 'Mệt, thiếu động lực hoặc khó giữ ổn định' },
    { value: 'money', label: 'Tiền bạc / an toàn', hint: 'Thu nhập, chi tiêu, giá trị hoặc sự ổn định' },
    { value: 'timing', label: 'Chưa rõ thời điểm', hint: 'Không chắc nên bắt đầu hay buông xuống lúc này' },
  ],
  sessionGoals: [
    { value: 'clarity', label: 'Nhìn rõ vấn đề trước', hint: 'Muốn biết mình thật sự kẹt ở đâu' },
    { value: 'action', label: 'Mang về cách làm được', hint: 'Sau buổi tư vấn có một bước tiếp theo' },
    { value: 'comfort', label: 'Được hiểu và ổn định', hint: 'Muốn có người cùng sắp xếp cảm xúc' },
    { value: 'decision', label: 'Hỗ trợ ra quyết định', hint: 'Cần nhìn rõ lựa chọn và rủi ro' },
  ],
  prefixes: { topic: 'Chủ đề muốn hỏi: ', pain: 'Điểm đang kẹt: ', goal: 'Muốn mang về: ', note: 'Ghi chú của khách: ' },
  title: 'Đặt lịch tư vấn',
  intro: 'Quy trình gồm bốn bước: xác nhận dịch vụ, chọn thời gian, giúp guide hiểu câu hỏi của bạn, rồi xác nhận thanh toán.',
  teacherServiceHint: 'Bạn sắp đặt dịch vụ của guide này',
  next: 'Tiếp tục',
  back: 'Quay lại',
  questionTitle: 'Giúp guide hiểu bạn trước',
  questionIntro: 'Dùng vài lựa chọn nhỏ để nói rõ câu hỏi. Guide sẽ thấy chủ đề, điểm kẹt và điều bạn muốn mang về trước khi đọc lá số.',
  topicQuestion: 'Bạn muốn hỏi điều gì?',
  painQuestion: 'Hiện tại điều gì đang kẹt nhất?',
  goalQuestion: 'Bạn muốn mang về điều gì?',
  noteLabel: 'Bổ sung tình huống bằng một câu *',
  notePlaceholder: 'Ví dụ: Tôi muốn đổi việc nhưng sợ chọn sai.',
  steps: ['Dịch vụ', 'Thời gian', 'Câu hỏi', 'Thanh toán'],
  loading: 'Đang tải thông tin đặt lịch...',
  validationError: 'Hãy chọn thời gian và điền chủ đề, điểm kẹt, điều muốn mang về cùng một câu bổ sung.',
};
BOOK_COPY.id = {
  ...BOOK_COPY.en,
  chartTools: [
    { value: '', label: 'Tanpa bagan', hint: '' },
    { value: 'bazi', label: 'Bazi', hint: '' },
    { value: 'ziwei', label: 'Zi Wei Dou Shu', hint: '' },
    { value: 'numerology', label: 'Numerologi', hint: '' },
    { value: 'astro', label: 'Astrologi', hint: '' },
    { value: 'humandesign', label: 'Human Design', hint: '' },
    { value: 'maya', label: 'Kalender Maya', hint: '' },
  ],
  questionTopics: [
    { value: 'love', label: 'Cinta / relasi', hint: 'Pendekatan, pasangan, kembali, hambatan interaksi' },
    { value: 'career', label: 'Kerja / karier', hint: 'Pindah kerja, promosi, arah, kolaborasi' },
    { value: 'family', label: 'Keluarga / anak', hint: 'Dinamika keluarga, parenting, tanggung jawab' },
    { value: 'self', label: 'Posisi diri', hint: 'Kondisi diri, bakat, pilihan hidup' },
    { value: 'year', label: 'Arah tahun ini', hint: 'Ritme dekat, masa depan, rencana penting' },
    { value: 'spiritual', label: 'Intuisi dan refleksi diri', hint: 'Pola berulang, intuisi, sinyal batin' },
  ],
  painPoints: [
    { value: 'repeat', label: 'Situasi yang sama berulang', hint: 'Orang berubah tetapi rasanya mirip' },
    { value: 'choice', label: 'Tidak tahu harus memilih', hint: 'Dua sisi sama-sama masuk akal' },
    { value: 'relationship', label: 'Tarikan relasi', hint: 'Peduli, tetapi interaksi menguras energi' },
    { value: 'energy', label: 'Energi terkuras', hint: 'Lelah, sulit bergerak, atau tidak stabil' },
    { value: 'money', label: 'Uang / rasa aman', hint: 'Pendapatan, pengeluaran, nilai, stabilitas' },
    { value: 'timing', label: 'Waktu belum jelas', hint: 'Belum tahu mulai atau melepas sekarang' },
  ],
  sessionGoals: [
    { value: 'clarity', label: 'Melihat masalah dengan jelas', hint: 'Ingin tahu letak macetnya' },
    { value: 'action', label: 'Membawa pulang cara praktis', hint: 'Ada satu langkah setelah sesi' },
    { value: 'comfort', label: 'Dipahami dan ditenangkan', hint: 'Merapikan emosi bersama seseorang' },
    { value: 'decision', label: 'Membantu keputusan', hint: 'Melihat pilihan dan risiko' },
  ],
  prefixes: { topic: 'Topik yang ingin ditanya: ', pain: 'Bagian yang macet: ', goal: 'Yang ingin dibawa pulang: ', note: 'Catatan klien: ' },
  title: 'Pesan konsultasi',
  questionTitle: 'Bantu guide memahami Anda',
  topicQuestion: 'Apa yang ingin Anda tanyakan?',
  painQuestion: 'Apa yang paling terasa macet?',
  goalQuestion: 'Apa yang ingin Anda bawa pulang?',
  noteLabel: 'Tambahkan satu kalimat tentang situasi Anda *',
  notePlaceholder: 'Contoh: Saya ingin pindah kerja tetapi takut salah memilih.',
  steps: ['Layanan', 'Waktu', 'Pertanyaan', 'Bayar'],
  next: 'Lanjut',
  back: 'Kembali',
  loading: 'Memuat detail booking...',
  validationError: 'Pilih waktu dan lengkapi topik, hambatan, tujuan, serta satu catatan pendek.',
};
BOOK_COPY.ja = {
  ...BOOK_COPY.en,
  chartTools: [
    { value: '', label: '命盤を添付しない', hint: '' },
    { value: 'bazi', label: '四柱推命', hint: '' },
    { value: 'ziwei', label: '紫微斗数', hint: '' },
    { value: 'numerology', label: '数秘術', hint: '' },
    { value: 'astro', label: '占星術', hint: '' },
    { value: 'humandesign', label: 'ヒューマンデザイン', hint: '' },
    { value: 'maya', label: 'マヤ暦', hint: '' },
  ],
  questionTopics: [
    { value: 'love', label: '恋愛 / 関係性', hint: '曖昧な関係、パートナー、復縁、関係の停滞' },
    { value: 'career', label: '仕事 / キャリア', hint: '転職、昇進、方向性、協力関係' },
    { value: 'family', label: '家族 / 子育て', hint: '家族関係、親子、責任分担' },
    { value: 'self', label: '自己定位', hint: '状態、才能、人生の選択' },
    { value: 'year', label: '今年の方向性', hint: '近い流れ、未来のリズム、大切な計画' },
    { value: 'spiritual', label: '直感と自己理解', hint: '繰り返す課題、直感、内面のサイン' },
  ],
  painPoints: [
    { value: 'repeat', label: '同じ状況が繰り返される', hint: '人や出来事は変わっても感覚が似ている' },
    { value: 'choice', label: 'どう選べばいいか分からない', hint: 'どちらにも理由があり決められない' },
    { value: 'relationship', label: '関係の引っ張り合い', hint: '大切だけれど消耗してしまう' },
    { value: 'energy', label: 'エネルギー消耗', hint: '疲れやすい、動けない、安定しにくい' },
    { value: 'money', label: 'お金 / 安心感', hint: '収入、支出、価値感、安定感' },
    { value: 'timing', label: 'タイミングが分からない', hint: '今始めるか手放すか迷っている' },
  ],
  sessionGoals: [
    { value: 'clarity', label: '問題をはっきり見る', hint: 'どこでつまずいているか知りたい' },
    { value: 'action', label: '実践できる方法を持ち帰る', hint: '相談後に一つ次の行動がある' },
    { value: 'comfort', label: '理解されて落ち着く', hint: '感情を一緒に整理したい' },
    { value: 'decision', label: '決断を助ける', hint: '選択肢とリスクを見たい' },
  ],
  prefixes: { topic: '相談テーマ：', pain: '今つまずいている点：', goal: '持ち帰りたいこと：', note: '相談者メモ：' },
  title: '相談を予約',
  questionTitle: 'まず鑑定者に状況を伝える',
  topicQuestion: '今回主に相談したいことは？',
  painQuestion: '今いちばんつまずいている点は？',
  goalQuestion: '今回持ち帰りたいことは？',
  noteLabel: '状況を一文で補足 *',
  notePlaceholder: '例：転職したいけれど選び間違えるのが怖い。',
  steps: ['サービス', '時間', '質問', '支払い'],
  next: '次へ',
  back: '戻る',
  loading: '予約情報を読み込み中...',
  validationError: '時間を選び、テーマ・つまずき・持ち帰りたいこと・一文メモを入力してください。',
};
BOOK_COPY.ko = {
  ...BOOK_COPY.en,
  chartTools: [
    { value: '', label: '차트 첨부 안 함', hint: '' },
    { value: 'bazi', label: '사주', hint: '' },
    { value: 'ziwei', label: '자미두수', hint: '' },
    { value: 'numerology', label: '수비학', hint: '' },
    { value: 'astro', label: '점성술', hint: '' },
    { value: 'humandesign', label: '휴먼 디자인', hint: '' },
    { value: 'maya', label: '마야력', hint: '' },
  ],
  questionTopics: [
    { value: 'love', label: '연애 / 관계', hint: '썸, 파트너, 재회, 관계의 막힘' },
    { value: 'career', label: '일 / 커리어', hint: '이직, 승진, 방향, 협업' },
    { value: 'family', label: '가족 / 자녀', hint: '가족 관계, 양육, 책임 분담' },
    { value: 'self', label: '자기 위치', hint: '현재 상태, 재능, 삶의 선택' },
    { value: 'year', label: '올해 방향', hint: '가까운 흐름, 미래 리듬, 중요한 계획' },
    { value: 'spiritual', label: '직관과 자기 이해', hint: '반복되는 패턴, 직관, 내면 신호' },
  ],
  painPoints: [
    { value: 'repeat', label: '같은 상황이 반복된다', hint: '사람과 일이 바뀌어도 느낌이 비슷하다' },
    { value: 'choice', label: '어떻게 선택할지 모르겠다', hint: '양쪽 모두 이유가 있어 결정을 미룬다' },
    { value: 'relationship', label: '관계의 줄다리기', hint: '소중하지만 상호작용이 지치게 한다' },
    { value: 'energy', label: '에너지 소모', hint: '피곤하고 의욕이 낮거나 안정되기 어렵다' },
    { value: 'money', label: '돈 / 안정감', hint: '수입, 지출, 가치감, 안정' },
    { value: 'timing', label: '시기가 불확실하다', hint: '지금 시작하거나 내려놓아도 되는지 모르겠다' },
  ],
  sessionGoals: [
    { value: 'clarity', label: '문제를 선명하게 보기', hint: '내가 어디서 막혔는지 알고 싶다' },
    { value: 'action', label: '실천 방법 가져가기', hint: '상담 뒤 한 가지 다음 행동이 있다' },
    { value: 'comfort', label: '이해받고 안정되기', hint: '감정을 함께 정리하고 싶다' },
    { value: 'decision', label: '결정에 도움받기', hint: '선택지와 위험을 보고 싶다' },
  ],
  prefixes: { topic: '질문 주제: ', pain: '현재 막힌 지점: ', goal: '가져가고 싶은 것: ', note: '고객 메모: ' },
  title: '상담 예약',
  questionTitle: '상담자가 먼저 당신을 이해하게 하기',
  topicQuestion: '이번에 주로 묻고 싶은 것은?',
  painQuestion: '지금 가장 막힌 지점은?',
  goalQuestion: '이번 상담에서 가져가고 싶은 것은?',
  noteLabel: '상황을 한 문장으로 추가 *',
  notePlaceholder: '예: 이직을 고민하지만 잘못 선택할까 봐 두렵다.',
  steps: ['서비스', '시간', '질문', '결제'],
  next: '다음',
  back: '이전',
  loading: '예약 정보를 불러오는 중...',
  validationError: '시간을 선택하고 주제, 막힌 지점, 가져가고 싶은 것, 짧은 메모를 입력해 주세요.',
};

Object.assign(BOOK_COPY.vi, {
  pickTimeTitle: 'Chọn thời gian',
  pickTimeIntro: 'Chỉ hiển thị khung giờ guide đang mở và chưa có người đặt. Trước khi thanh toán, hệ thống sẽ kiểm tra lại trong database để tránh trùng lịch.',
  noSlots: 'Guide chưa có thời gian trống gần đây',
  lineAsk: 'Hỏi qua LINE',
  chartOptionalTitle: 'Không bắt buộc: đính kèm thông tin lá số đơn giản',
  chartOptionalBody: 'Nếu bạn đồng ý chia sẻ ngày giờ sinh, guide có thể chuẩn bị nhanh hơn. Dữ liệu được lưu theo chính sách quyền riêng tư.',
  birthDate: 'Ngày sinh',
  birthTime: 'Giờ sinh',
  gender: 'Giới tính sinh học',
  female: 'Nữ',
  male: 'Nam',
  reviewTitle: 'Xác nhận đặt lịch',
  reviewTeacher: 'Guide',
  reviewService: 'Dịch vụ',
  reviewTime: 'Thời gian',
  reviewTopic: 'Chủ đề',
  reviewPain: 'Điểm kẹt',
  reviewGoal: 'Muốn mang về',
  reviewNote: 'Ghi chú',
  reviewChart: 'Lá số đính kèm',
  amount: 'Trạng thái beta:',
  betaFreeLabel: 'Thử nghiệm mở — miễn phí',
  freeBadge: 'Thử nghiệm mở',
  freeReviewNote: 'Trong giai đoạn thử nghiệm, tất cả buổi tư vấn đều miễn phí. Xác nhận sẽ tạo lịch và quay về trang tư vấn của tôi.',
  paidReviewNote: 'Sau khi xác nhận, bạn có thể xem trạng thái, liên hệ guide hoặc hủy lịch trong trang tư vấn của tôi.',
  cancelPolicyTitle: 'Hủy lịch',
  cancelPolicyLines: ['Trong giai đoạn thử nghiệm, có thể hủy lịch bất cứ lúc nào, không phát sinh chi phí.', 'Điều khoản hủy cho buổi tính phí sẽ thông báo khi mở thanh toán.'],
  submitting: 'Đang tạo lịch...',
  confirmFree: 'Xác nhận đặt lịch',
  confirmPay: 'Xác nhận đặt lịch',
  missingParams: 'Thiếu guide hoặc dịch vụ. Vui lòng quay lại lối vào tư vấn và chọn lại.',
  bookingFailed: 'Tạo lịch thất bại. Vui lòng thử lại sau.',
  freeCreated: 'Đã tạo lịch beta miễn phí, không thu phí.',
  paidCreated: 'Đã tạo lịch, đang chuyển đến trang xác nhận.',
});
Object.assign(BOOK_COPY.id, {
  pickTimeTitle: 'Pilih waktu',
  pickTimeIntro: 'Hanya slot yang dibuka guide dan belum dipesan yang ditampilkan. Sebelum pembayaran, sistem akan memeriksa database lagi untuk mencegah jadwal ganda.',
  noSlots: 'Belum ada slot tersedia dalam waktu dekat',
  lineAsk: 'Tanya lewat LINE',
  chartOptionalTitle: 'Opsional: lampirkan konteks bagan sederhana',
  chartOptionalBody: 'Jika Anda membagikan data lahir, guide dapat menyiapkan sesi lebih cepat. Data mengikuti kebijakan privasi.',
  birthDate: 'Tanggal lahir',
  birthTime: 'Jam lahir',
  gender: 'Jenis kelamin biologis',
  female: 'Perempuan',
  male: 'Laki-laki',
  reviewTitle: 'Tinjau booking',
  reviewTeacher: 'Guide',
  reviewService: 'Layanan',
  reviewTime: 'Waktu',
  reviewTopic: 'Topik',
  reviewPain: 'Hambatan',
  reviewGoal: 'Tujuan',
  reviewNote: 'Catatan',
  reviewChart: 'Bagan terlampir',
  amount: 'Status beta:',
  betaFreeLabel: 'Beta terbuka — gratis',
  freeBadge: 'Beta terbuka',
  freeReviewNote: 'Selama beta terbuka, semua sesi gratis. Konfirmasi akan membuat booking dan kembali ke halaman konsultasi saya.',
  paidReviewNote: 'Setelah konfirmasi, Anda dapat melihat status, menghubungi guide, atau membatalkan dari halaman konsultasi saya.',
  cancelPolicyTitle: 'Pembatalan',
  cancelPolicyLines: ['Selama beta terbuka, booking dapat dibatalkan kapan saja tanpa biaya.', 'Ketentuan pembatalan untuk sesi berbayar akan diumumkan saat tagihan dibuka.'],
  submitting: 'Membuat booking...',
  confirmFree: 'Konfirmasi booking',
  confirmPay: 'Konfirmasi booking',
  missingParams: 'Guide atau layanan belum lengkap. Silakan kembali dan pilih ulang.',
  bookingFailed: 'Booking gagal. Coba lagi nanti.',
  freeCreated: 'Booking beta gratis dibuat. Tidak ada biaya.',
  paidCreated: 'Booking dibuat. Mengarahkan ke halaman konfirmasi.',
});
Object.assign(BOOK_COPY.ja, {
  pickTimeTitle: '時間を選ぶ',
  pickTimeIntro: '鑑定者が開放していて、まだ予約されていない時間だけを表示します。支払い前にデータベースで再確認します。',
  noSlots: '近日中の予約可能時間はありません',
  lineAsk: 'LINEで質問',
  chartOptionalTitle: '任意：簡単な命盤情報を添付',
  chartOptionalBody: '出生情報を共有すると、鑑定者がより早く準備できます。データはプライバシーポリシーに従って保存されます。',
  birthDate: '生年月日',
  birthTime: '出生時間',
  gender: '生物学的性別',
  female: '女性',
  male: '男性',
  reviewTitle: '予約確認',
  reviewTeacher: '鑑定者',
  reviewService: 'サービス',
  reviewTime: '時間',
  reviewTopic: 'テーマ',
  reviewPain: 'つまずき',
  reviewGoal: '持ち帰りたいこと',
  reviewNote: 'メモ',
  reviewChart: '添付命盤',
  amount: 'ベータ状況：',
  betaFreeLabel: 'オープンベータ — 無料',
  freeBadge: 'オープンベータ',
  freeReviewNote: 'オープンベータ期間中はすべてのセッションが無料です。確定すると予約が作成され「自分の相談」に戻ります。',
  paidReviewNote: '確定後は「自分の相談」から状態確認、連絡、キャンセルができます。',
  cancelPolicyTitle: 'キャンセルについて',
  cancelPolicyLines: ['オープンベータ期間中はいつでも無料でキャンセルできます。', '有料セッションのキャンセル規定は課金開始時に案内します。'],
  submitting: '予約を作成中...',
  confirmFree: '予約を確定',
  confirmPay: '予約を確定',
  missingParams: '鑑定者またはサービスが不足しています。入口に戻って選び直してください。',
  bookingFailed: '予約作成に失敗しました。後でもう一度お試しください。',
  freeCreated: 'ベータ予約を作成しました。請求はありません。',
  paidCreated: '予約を作成しました。確認ページへ移動します。',
});
Object.assign(BOOK_COPY.ko, {
  pickTimeTitle: '시간 선택',
  pickTimeIntro: '상담자가 열어 둔 예약 가능한 시간만 표시됩니다. 결제 전 데이터베이스에서 한 번 더 확인해 중복 예약을 막습니다.',
  noSlots: '가까운 시일 내 예약 가능한 시간이 없습니다',
  lineAsk: 'LINE 문의',
  chartOptionalTitle: '선택: 간단한 차트 정보 첨부',
  chartOptionalBody: '출생 정보를 공유하면 상담자가 더 빠르게 준비할 수 있습니다. 데이터는 개인정보 처리방침에 따라 저장됩니다.',
  birthDate: '생년월일',
  birthTime: '출생 시간',
  gender: '생물학적 성별',
  female: '여성',
  male: '남성',
  reviewTitle: '예약 확인',
  reviewTeacher: '상담자',
  reviewService: '서비스',
  reviewTime: '시간',
  reviewTopic: '주제',
  reviewPain: '막힌 지점',
  reviewGoal: '가져가고 싶은 것',
  reviewNote: '메모',
  reviewChart: '첨부 차트',
  amount: '베타 상태:',
  betaFreeLabel: '오픈 베타 — 무료',
  freeBadge: '오픈 베타',
  freeReviewNote: '오픈 베타 기간 중 모든 세션은 무료입니다. 확정하면 예약이 생성되고 내 상담으로 돌아갑니다.',
  paidReviewNote: '확정 후 내 상담에서 상태 확인, 상담자 연락, 취소를 할 수 있습니다.',
  cancelPolicyTitle: '취소 안내',
  cancelPolicyLines: ['오픈 베타 기간 중에는 언제든지 무료로 취소할 수 있습니다.', '유료 세션 취소 규정은 결제 시작 시 별도 안내드립니다.'],
  submitting: '예약 생성 중...',
  confirmFree: '예약 확정',
  confirmPay: '예약 확정',
  missingParams: '상담자 또는 서비스 정보가 부족합니다. 상담 입구로 돌아가 다시 선택해 주세요.',
  bookingFailed: '예약 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  freeCreated: '베타 예약이 생성되었습니다. 결제는 없습니다.',
  paidCreated: '예약이 생성되었습니다. 확인 페이지로 이동합니다.',
});

function optionLabel(options: readonly QuestionOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? '';
}

function QuestionOptionGrid({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-xs font-semibold tracking-widest text-accent">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selected
                  ? 'border-accent bg-accent text-primary shadow-[0_0_22px_rgba(232,197,71,0.22)]'
                  : 'border-accent-dim bg-white/[0.035] hover:border-accent hover:bg-white/[0.06]'
              }`}
            >
              <span className={`block text-sm font-semibold ${selected ? 'text-primary' : 'text-white'}`}>{option.label}</span>
              <span className={`mt-1 block text-xs leading-relaxed ${selected ? 'text-primary/70' : 'text-white/55'}`}>{option.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookFormInner() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const toast = useToast();
  const locale = getLocaleFromPathname(pathname ?? '/');
  const copy = BOOK_COPY[locale] ?? BOOK_COPY[DEFAULT_LOCALE];
  const localeTag = locale === 'zh-TW' ? 'zh-TW' : locale;
  const teacherId = search.get('teacher');
  const serviceId = search.get('service');

  const [step, setStep] = useState(1);
  const [teacher, setTeacher] = useState<TeacherLite | null>(null);
  const [service, setService] = useState<ServiceLite | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookedSet, setBookedSet] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [questionTopic, setQuestionTopic] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [sessionGoal, setSessionGoal] = useState('');
  const [question, setQuestion] = useState('');
  const [chartTool, setChartTool] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push(localizePath(`/account/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`, locale));
        return;
      }
      if (!teacherId || !serviceId) return;

      const [teacherResult, serviceResult, availabilityResult, bookingResult] = await Promise.all([
        supabase.from('teachers').select('display_name, line_url').eq('id', teacherId).single(),
        supabase.from('teacher_services').select('name, description, duration_minutes, price_ntd').eq('id', serviceId).single(),
        supabase.from('teacher_availability').select('day_of_week, start_time, end_time').eq('teacher_id', teacherId).eq('is_blocked', false),
        supabase.from('bookings')
          .select('scheduled_at, duration_minutes')
          .eq('teacher_id', teacherId)
          .in('status', ['pending', 'paid', 'confirmed', 'in_progress'])
          .gte('scheduled_at', new Date().toISOString()),
      ]);

      if (cancelled) return;
      if (teacherResult.data) setTeacher(teacherResult.data as TeacherLite);
      if (serviceResult.data) setService(serviceResult.data as ServiceLite);
      if (availabilityResult.data) setAvailability(availabilityResult.data as Availability[]);
      if (bookingResult.data) {
        setBookedSet(new Set((bookingResult.data as BookedSlot[]).map((slot) => new Date(slot.scheduled_at).getTime())));
      }
    }

    load().catch((err: Error) => toast(err.message, 'error'));
    return () => {
      cancelled = true;
    };
  }, [teacherId, serviceId, router, toast, locale]);

  const slots = useMemo(() => {
    if (!service || !availability.length) return [] as { time: Date; disabled: boolean }[];
    const out: { time: Date; disabled: boolean }[] = [];
    const now = new Date();
    for (let d = 1; d <= 14; d += 1) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      const dayOfWeek = day.getDay();
      const windows = availability.filter((item) => item.day_of_week === dayOfWeek);
      for (const window of windows) {
        const [startHour, startMinute] = window.start_time.split(':').map(Number);
        const [endHour, endMinute] = window.end_time.split(':').map(Number);
        const start = new Date(day);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(day);
        end.setHours(endHour, endMinute, 0, 0);
        for (let cursor = new Date(start); cursor.getTime() + service.duration_minutes * 60000 <= end.getTime(); cursor = new Date(cursor.getTime() + 30 * 60000)) {
          out.push({ time: new Date(cursor), disabled: bookedSet.has(cursor.getTime()) });
        }
      }
    }
    return out;
  }, [availability, bookedSet, service]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof slots> = {};
    for (const slot of slots) {
      const key = slot.time.toLocaleDateString(localeTag, { month: 'long', day: 'numeric', weekday: 'short' });
      (groups[key] ??= []).push(slot);
    }
    return groups;
  }, [localeTag, slots]);

  const issueContext = useMemo(() => {
    const topicLabel = optionLabel(copy.questionTopics, questionTopic);
    const painPointLabel = optionLabel(copy.painPoints, painPoint);
    const sessionGoalLabel = optionLabel(copy.sessionGoals, sessionGoal);
    return {
      topic: questionTopic,
      topicLabel,
      painPoint,
      painPointLabel,
      sessionGoal,
      sessionGoalLabel,
      question: question.trim(),
    };
  }, [copy.painPoints, copy.questionTopics, copy.sessionGoals, painPoint, question, questionTopic, sessionGoal]);

  const structuredQuestion = useMemo(() => [
    `${copy.prefixes.topic}${issueContext.topicLabel || copy.empty.topic}`,
    `${copy.prefixes.pain}${issueContext.painPointLabel || copy.empty.pain}`,
    `${copy.prefixes.goal}${issueContext.sessionGoalLabel || copy.empty.goal}`,
    `${copy.prefixes.note}${issueContext.question || copy.empty.note}`,
  ].join('\n'), [copy.empty.goal, copy.empty.note, copy.empty.pain, copy.empty.topic, copy.prefixes.goal, copy.prefixes.note, copy.prefixes.pain, copy.prefixes.topic, issueContext]);

  const submit = async () => {
    if (!selectedSlot || !questionTopic || !painPoint || !sessionGoal || !question.trim() || !teacherId || !serviceId || !service) {
      toast(copy.validationError, 'error');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      router.push(localizePath(`/account/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`, locale));
      return;
    }

    let chartData: Record<string, unknown> | null = null;
    if (chartTool && birthDate) {
      chartData = {
        tool: chartTool,
        birthDate,
        birthTime: birthTime || '12:00',
        gender: chartTool === 'ziwei' ? gender : undefined,
        issueContext,
      };
    }

    const { data: bookingId, error } = await supabase.rpc('create_booking_request', {
      p_teacher_id: teacherId,
      p_service_id: serviceId,
      p_scheduled_at: selectedSlot,
      p_customer_question: structuredQuestion,
      p_chart_tool: chartTool || null,
      p_chart_data: chartData,
      p_free_test_mode: FREE_BOOKING_TEST_MODE,
    });

    setSubmitting(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }

    if (!bookingId) {
      toast(copy.bookingFailed, 'error');
      return;
    }

    if (FREE_BOOKING_TEST_MODE) {
      toast(copy.freeCreated);
      router.push(localizePath('/account/mybookings', locale));
      return;
    }

    // PAYMENT_GATE: 公測期間付款入口停用，所有預約一律導回 mybookings。
    // 待開收費時：移除下兩行，改回 router.push(localizePath(`/account/payment/${bookingId}`, locale))
    toast(copy.paidCreated);
    router.push(localizePath('/account/mybookings', locale));
  };

  if (!teacherId || !serviceId) {
    return (
      <div className="container mx-auto px-5 py-16 text-center text-white/60">
        {copy.missingParams}
      </div>
    );
  }

  if (!teacher || !service) {
    return <div className="container mx-auto px-5 py-16 text-center text-white/60">{copy.loading}</div>;
  }

  return (
    <main className="container mx-auto max-w-2xl px-5 py-8">
      <header className="pb-6 text-center">
        <h1 className="font-serif text-3xl tracking-widest">{copy.title}</h1>
        <div className="mele-subtitle mt-2">{copy.subtitle}</div>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/68">
          {copy.intro}
        </p>
      </header>

      <section className="mele-card">
        <Steps current={step} labels={copy.steps} />

        {step === 1 && (
          <div>
            <div className="mb-5 rounded-xl bg-black/25 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mele-gold font-serif text-xl text-primary">
                  {teacher.display_name.charAt(0)}
                </div>
                <div>
                  <div className="font-serif text-lg text-accent">{teacher.display_name}</div>
                  <div className="text-xs text-white/55">{copy.teacherServiceHint}</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-accent-dim p-5">
              <div className="text-lg">{service.name}</div>
              <div className="mt-1 text-xs text-white/60">{service.duration_minutes} min · {copy.betaFreeLabel}</div>
              {FREE_BOOKING_TEST_MODE && (
                <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-xs leading-relaxed text-success">
                  {copy.freeTest}
                </div>
              )}
              {service.description && <div className="mt-3 text-sm leading-relaxed">{service.description}</div>}
              <div className="mt-4 rounded-lg bg-white/[0.04] p-3 text-xs leading-relaxed text-white/65">
                {copy.serviceReminder}
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="mele-btn-primary mt-6">{copy.next}</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mele-section-title">{copy.pickTimeTitle}</div>
            <div className="mele-section-subtitle">{copy.pickTimeSubtitle}</div>
            <p className="mb-5 text-sm leading-relaxed text-white/68">
              {copy.pickTimeIntro}
            </p>
            {slots.length === 0 ? (
              <div className="py-10 text-center text-white/60">
                <div className="mb-3 text-3xl text-accent opacity-50">MELE</div>
                {copy.noSlots}
                {teacher.line_url && <div className="mt-3"><a href={teacher.line_url} target="_blank" rel="noreferrer" className="mele-btn-secondary">{copy.lineAsk}</a></div>}
              </div>
            ) : (
              <div>
                {Object.entries(groupedSlots).map(([date, list]) => (
                  <div key={date} className="mb-4">
                    <div className="mb-2 text-xs tracking-widest text-accent">{date}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((slot) => {
                        const iso = slot.time.toISOString();
                        const selected = selectedSlot === iso;
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={slot.disabled}
                            onClick={() => setSelectedSlot(iso)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-all ${
                              slot.disabled
                                ? 'cursor-not-allowed border-white/10 opacity-30'
                                : selected
                                  ? 'border-accent bg-accent text-primary font-semibold'
                                  : 'border-accent-dim hover:border-accent'
                            }`}
                          >
                            {slot.time.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="mele-btn-secondary">{copy.back}</button>
              <button type="button" onClick={() => setStep(3)} disabled={!selectedSlot} className="mele-btn-primary">{copy.next}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mele-section-title">{copy.questionTitle}</div>
            <div className="mele-section-subtitle">{copy.questionSubtitle}</div>
            <p className="mb-5 text-sm leading-relaxed text-white/68">
              {copy.questionIntro}
            </p>
            <QuestionOptionGrid
              title={copy.topicQuestion}
              options={copy.questionTopics}
              value={questionTopic}
              onChange={setQuestionTopic}
            />
            <QuestionOptionGrid
              title={copy.painQuestion}
              options={copy.painPoints}
              value={painPoint}
              onChange={setPainPoint}
            />
            <QuestionOptionGrid
              title={copy.goalQuestion}
              options={copy.sessionGoals}
              value={sessionGoal}
              onChange={setSessionGoal}
            />
            <div className="mb-5">
              <label className="mele-label">{copy.noteLabel}</label>
              <textarea
                rows={4}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="mele-input"
                maxLength={500}
                placeholder={copy.notePlaceholder}
              />
              <div className="mt-2 text-right text-[11px] text-white/45">{question.length}/500</div>
            </div>
            <div className="mb-5 rounded-xl border border-accent-dim bg-accent/[0.08] p-4">
              <div className="mb-3 text-xs text-accent">{copy.chartOptionalTitle}</div>
              <p className="mb-4 text-xs leading-relaxed text-white/65">
                {copy.chartOptionalBody}
              </p>
              <select value={chartTool} onChange={(event) => setChartTool(event.target.value)} className="mele-input mb-4">
                {copy.chartTools.map((tool) => <option key={tool.value} value={tool.value}>{tool.label}</option>)}
              </select>
              {chartTool && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mele-label">{copy.birthDate}</label>
                      <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mele-input" />
                    </div>
                    <div>
                      <label className="mele-label">{copy.birthTime}</label>
                      <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className="mele-input" />
                    </div>
                  </div>
                  {chartTool === 'ziwei' && (
                    <div>
                      <label className="mele-label">{copy.gender}</label>
                      <select value={gender} onChange={(event) => setGender(event.target.value as Gender)} className="mele-input">
                        <option value="female">{copy.female}</option>
                        <option value="male">{copy.male}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="mele-btn-secondary">{copy.back}</button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!questionTopic || !painPoint || !sessionGoal || !question.trim()}
                className="mele-btn-primary"
              >
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mele-section-title">{copy.reviewTitle}</div>
            <div className="mele-section-subtitle">{copy.reviewSubtitle}</div>
            <div className="mb-5 rounded-xl bg-black/25 p-5 text-sm leading-loose">
              <div><strong className="text-accent">{copy.reviewTeacher}</strong>　{teacher.display_name}</div>
              <div><strong className="text-accent">{copy.reviewService}</strong>　{service.name}（{service.duration_minutes} min）</div>
              <div><strong className="text-accent">{copy.reviewTime}</strong>　{selectedSlot ? new Date(selectedSlot).toLocaleString(localeTag) : copy.empty.selectedTime}</div>
              <div><strong className="text-accent">{copy.reviewTopic}</strong>　{issueContext.topicLabel || copy.empty.topic}</div>
              <div><strong className="text-accent">{copy.reviewPain}</strong>　{issueContext.painPointLabel || copy.empty.pain}</div>
              <div><strong className="text-accent">{copy.reviewGoal}</strong>　{issueContext.sessionGoalLabel || copy.empty.goal}</div>
              <div><strong className="text-accent">{copy.reviewNote}</strong>　{question || copy.empty.note}</div>
              {chartTool && <div><strong className="text-accent">{copy.reviewChart}</strong>　{copy.chartTools.find((tool) => tool.value === chartTool)?.label}</div>}
              <div className="mt-4 border-t border-accent-dim pt-4 text-lg">
                <strong className="text-accent">{copy.amount}</strong>
                <span className="font-serif text-xl text-success">{copy.betaFreeLabel}</span>
              </div>
            </div>
            <div className="mb-5 rounded-xl border border-accent-dim bg-white/[0.035] p-4 text-xs leading-relaxed text-white/68">
              {FREE_BOOKING_TEST_MODE
                ? copy.freeReviewNote
                : copy.paidReviewNote}
            </div>
            <div className="mb-5 rounded-xl bg-black/30 p-4 text-xs leading-relaxed">
              <strong className="text-accent">{copy.cancelPolicyTitle}</strong><br />
              {copy.cancelPolicyLines.map((line) => <span key={line}>{line}<br /></span>)}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="mele-btn-secondary">{copy.back}</button>
              <button type="button" onClick={submit} disabled={submitting} className="mele-btn-primary">
                {submitting ? copy.submitting : FREE_BOOKING_TEST_MODE ? copy.confirmFree : copy.confirmPay}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Steps({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="relative mb-7 flex justify-between">
      <div className="absolute left-0 right-0 top-3.5 z-0 h-0.5 bg-accent-dim" />
      {labels.map((label, index) => {
        const number = index + 1;
        const done = current > number;
        const active = current === number;
        return (
          <div key={label} className="relative z-10 flex-1 text-center">
            <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs ${
              done
                ? 'border-accent bg-accent text-primary'
                : active
                  ? 'border-accent bg-primary text-accent'
                  : 'border-accent-dim bg-primary text-white/50'
            }`}
            >
              {number}
            </div>
            <div className={`mt-1.5 text-[11px] tracking-wide ${active || done ? 'text-accent' : 'text-white/60'}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-5 py-16 text-center text-white/60">正在讀取預約資料...</div>}>
      <BookFormInner />
    </Suspense>
  );
}
