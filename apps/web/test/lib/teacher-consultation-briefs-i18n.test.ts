import { describe, expect, it } from 'vitest';
import {
  buildDailyConsultationBrief,
  buildTeacherConsultationBrief,
} from '@/lib/teacher-consultation-briefs';
import type { CalcResponse } from '@/lib/api';
import type { Locale } from '@/lib/i18n/config';

function humanDesignResponse(): CalcResponse {
  return {
    tool: 'humandesign',
    version: 'test',
    computed_at: '2026-05-09T10:00:00Z',
    input: { question: 'Why do I lose my rhythm around other people?' },
    data: {
      type: 'Manifesting Generator',
      authority: 'Emotional Authority',
      profile: '6/2',
      strategy: 'Wait to respond, then inform',
      activatedGates: [
        { gate: 37, line: 6, source: 'Personality Sun' },
        { gate: 40, line: 2, source: 'Personality Earth' },
        { gate: 23, line: 4, source: 'Design Mercury' },
      ],
      definedChannels: [[37, 40]],
      gates: ['37', '40', '23'],
      channels: ['37-40'],
    },
    render: {},
  };
}

const localeExpectations: Array<{
  locale: Exclude<Locale, 'zh-TW'>;
  sourceLabel: string;
  understandLabel: string;
  guideTitle: string;
  question: string;
}> = [
  {
    locale: 'en',
    sourceLabel: 'Human Design',
    understandLabel: 'Understand the client first',
    guideTitle: 'Guide prep desk',
    question: 'Topic: Relationship\nCurrent block: I follow other people too quickly\nTakeaway: A small decision practice\nClient note: I say yes before I feel ready',
  },
  {
    locale: 'vi',
    sourceLabel: 'Thiết kế Con người',
    understandLabel: 'Hiểu khách trước',
    guideTitle: 'Bàn chuẩn bị của guide',
    question: 'Chủ đề muốn hỏi: Quan hệ\nĐiểm đang kẹt: Tôi chạy theo nhịp người khác quá nhanh\nMuốn mang về: Một cách luyện quyết định nhỏ\nGhi chú của khách: Tôi nói đồng ý trước khi thật sự sẵn sàng',
  },
  {
    locale: 'id',
    sourceLabel: 'Human Design',
    understandLabel: 'Pahami klien dulu',
    guideTitle: 'Meja persiapan guide',
    question: 'Topik yang ingin ditanya: Relasi\nBagian yang macet: Saya terlalu cepat mengikuti ritme orang lain\nYang ingin dibawa pulang: Latihan keputusan kecil\nCatatan klien: Saya bilang ya sebelum siap',
  },
  {
    locale: 'ja',
    sourceLabel: 'ヒューマンデザイン',
    understandLabel: 'まず相談者を理解する',
    guideTitle: '鑑定準備デスク',
    question: '相談テーマ：人間関係\n今つまずいている点：相手のペースに流されやすい\n持ち帰りたいこと：小さな決断練習\n相談者メモ：準備できる前に返事をしてしまう',
  },
  {
    locale: 'ko',
    sourceLabel: '휴먼 디자인',
    understandLabel: '먼저 고객 이해하기',
    guideTitle: '상담 준비 데스크',
    question: '질문 주제: 관계\n현재 막힌 지점: 다른 사람의 속도에 너무 빨리 맞춘다\n가져가고 싶은 것: 작은 결정 연습\n고객 메모: 준비되기 전에 먼저 예라고 말한다',
  },
];

describe('teacher consultation brief i18n', () => {
  it.each(localeExpectations)('builds detailed teacher briefs in $locale', ({ locale, sourceLabel, understandLabel, guideTitle, question }) => {
    const brief = buildTeacherConsultationBrief({
      result: humanDesignResponse(),
      customerQuestion: question,
      locale,
    });

    expect(brief.sourceLabel).toBe(sourceLabel);
    expect(brief.title).toContain(sourceLabel);
    expect(brief.beginnerCards[0]?.label).toBe(understandLabel);
    expect(brief.beginnerCards.length).toBeGreaterThanOrEqual(5);
    expect(brief.detailSections[0]?.title).toContain(sourceLabel);
    expect(brief.sopStages.map((stage) => stage.key)).toEqual(['opening', 'gift', 'shadow', 'action', 'closing']);
    expect(brief.copyText).toContain(guideTitle);
    expect(brief.copyText).not.toContain('老師解盤工作台');
    expect(brief.copyText).not.toContain('完全白話導讀');
  });

  it('builds localized daily openers without falling back to Traditional Chinese section titles', () => {
    const brief = buildDailyConsultationBrief({
      kind: 'daily_tarot',
      result: {
        tool: 'tarot',
        version: 'test',
        computed_at: '2026-05-09T10:00:00Z',
        input: {},
        data: {
          cards: [{
            spread_position: 'Today',
            position: 'upright',
            card: {
              name_en: 'The Star',
              upright: { text: 'Let hope come back before choosing the next step.' },
              keywords: ['hope', 'repair', 'direction'],
            },
          }],
        },
        render: {},
      },
      date: '2026-05-09',
      locale: 'en',
    });

    expect(brief.sourceLabel).toBe('Daily tarot card');
    expect(brief.title).toContain('Daily tarot card opener');
    expect(brief.tags).toContain('Daily state');
    expect(brief.copyText).toContain('Guide prep desk');
    expect(brief.copyText).not.toContain('今日狀態觀察');
  });
});
