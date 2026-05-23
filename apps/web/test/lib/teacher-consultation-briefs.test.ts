import { describe, expect, it } from 'vitest';
import {
  buildDailyConsultationBrief,
  buildTeacherConsultationBrief,
  mergeTeacherBriefDraft,
  type TeacherConsultationBrief,
} from '@/lib/teacher-consultation-briefs';
import type { CalcResponse, CalcTool } from '@/lib/api';

function response(tool: CalcTool, data: Record<string, unknown>, input: Record<string, unknown> = {}): CalcResponse {
  return {
    tool,
    version: 'test',
    computed_at: '2026-05-09T10:00:00Z',
    input,
    data,
    render: {},
  };
}

const samples: Array<[CalcTool, Record<string, unknown>]> = [
  ['bazi', { dayMaster: '丁火', dayMasterWuxing: '火', pillars: ['丙子', '庚寅', '丁酉', '甲辰'], wuxing: { wood: 2, fire: 2, earth: 1, metal: 2, water: 1 } }],
  ['ziwei', { mingGong: '午宮', shenGong: '夫妻宮', mainStars: ['紫微', '天府'], fiveElementsClass: '木三局' }],
  ['astro', { sun: '雙魚座', moon: '獅子座', ascendant: '天秤座', midheaven: '巨蟹座' }],
  ['humandesign', { type: '顯示生產者', authority: '情緒權威', profile: '6/2', strategy: '等待回應，然後告知', activatedGates: [{ gate: 37, line: 6, source: '人格太陽' }, { gate: 40, line: 2, source: '人格地球' }, { gate: 23, line: 4, source: '設計水星' }], definedChannels: [[37, 40]], gates: ['37', '40', '23'], channels: ['37-40'] }],
  ['maya', { kin: 52, tone: '宇宙', seal: '黃人', guide: '黃戰士', analog: '藍手', antipode: '白風', occult: '紅月' }],
  ['numerology', { lifePath: 4, birthDay: 15, lifePathArchetype: '建築師' }],
  ['tarot', { cards: [{ spread_position: '現在', position: 'upright', card: { name_zh: '女祭司', upright: { text: '傾聽直覺與沉默訊息' }, keywords: ['直覺', '等待'] } }] }],
  ['runes', { meta: { material: 'crystal' }, runes: [{ spread_position: '提醒', position: 'reversed', rune: { zh: 'Fehu', reversed: { text: '資源需要重新整理' }, keywords: ['資源', '價值'] } }] }],
];

function expectCompleteBrief(brief: TeacherConsultationBrief) {
  expect(brief.title).toBeTruthy();
  expect(brief.sourceLabel).toMatch(/八字|紫微|占星|人類圖|瑪雅|生命靈數|塔羅|盧恩|每日/);
  expect(brief.clientIntent).toBeTruthy();
  expect(brief.plainOneLiner).toMatch(/不是|今天|這張牌|這枚符文|這顆石面/);
  expect(brief.beginnerCards.length).toBeGreaterThanOrEqual(4);
  expect(brief.beginnerCards[0]?.label).toBe('先了解客人');
  expect(brief.beginnerCards[1]?.label).toBe('一句話翻譯');
  expect(brief.beginnerCards[2]?.label).toBe('生活畫面');
  expect(brief.beginnerCards[3]?.body).toContain('卡住');
  expect(brief.conversationBreakdown.length).toBeGreaterThanOrEqual(5);
  expect(brief.conversationBreakdown[0]).toContain('第一層');
  expect(brief.conversationBreakdown[1]).toContain('生活畫面');
  expect(brief.coreSummary).toBeTruthy();
  expect(brief.strengths.length).toBeGreaterThanOrEqual(2);
  expect(brief.shadows.length).toBeGreaterThanOrEqual(2);
  expect(brief.questions.length).toBeGreaterThanOrEqual(3);
  expect(brief.avoidSayings.length).toBeGreaterThanOrEqual(2);
  expect(brief.sopStages.map((stage) => stage.key)).toEqual(['opening', 'gift', 'shadow', 'action', 'closing']);
  expect(Array.isArray(brief.detailSections)).toBe(true);
  brief.sopStages.forEach((stage) => {
    expect(stage.script).toMatch(/你可以|我們|今天|觀察|先/);
    expect(stage.questions.length).toBeGreaterThan(0);
    expect(stage.notes).toBeTruthy();
  });
  expect(brief.copyText).toContain('客人來意');
  expect(brief.copyText).toContain('完全白話導讀');
  expect(brief.copyText).toContain('一句話切入');
  expect(brief.copyText).toContain('拆解再拆解');
  expect(brief.copyText).toContain('諮詢 SOP');
}

const structuredCustomerQuestion = [
  '想問主題：工作 / 事業',
  '目前卡點：不知道怎麼選',
  '這次想帶走：可以執行的方法',
  '客人補充：我想知道要不要換工作，但又怕選錯。',
].join('\n');

describe('teacher consultation briefs', () => {
  it.each(samples)('builds a complete teacher brief for %s', (tool, data) => {
    const brief = buildTeacherConsultationBrief({
      result: response(tool, data, { question: '我想知道近期關係與工作方向' }),
      customerQuestion: structuredCustomerQuestion,
    });

    expectCompleteBrief(brief);
    expect(brief.clientIntent).toContain('工作 / 事業');
    expect(brief.coreSummary).toContain('不知道怎麼選');
    expect(brief.questions.join('\n')).toContain('換工作');
  });

  it('builds daily tarot, rune, and stone prompts as consultation openers', () => {
    const tarot = buildDailyConsultationBrief({
      kind: 'daily_tarot',
      result: response('tarot', samples.find(([tool]) => tool === 'tarot')?.[1] ?? {}),
      date: '2026-05-09',
    });
    const rune = buildDailyConsultationBrief({
      kind: 'daily_runes',
      result: response('runes', samples.find(([tool]) => tool === 'runes')?.[1] ?? {}),
      date: '2026-05-09',
    });
    const stone = buildDailyConsultationBrief({
      kind: 'daily_stone',
      result: response('runes', { meta: { material: 'stone' }, runes: [{ rune: { zh: 'Ansuz', upright: { text: '把話說清楚' } }, position: 'upright' }] }),
      date: '2026-05-09',
    });

    [tarot, rune, stone].forEach((brief) => {
      expectCompleteBrief(brief);
      expect(brief.coreSummary).toContain('今日');
      expect(brief.tags).toContain('諮詢開場素材');
    });
  });

  it('falls back to useful questions when chart data is incomplete', () => {
    const brief = buildTeacherConsultationBrief({
      result: response('bazi', {}),
      customerQuestion: '',
    });

    expectCompleteBrief(brief);
    expect(brief.clientIntent).toContain('尚未填寫');
    expect(brief.copyText).not.toMatch(/[�]/);
  });

  it('adds Human Design gate open and unopened impact notes for teacher prep', () => {
    const brief = buildTeacherConsultationBrief({
      result: response('humandesign', samples.find(([tool]) => tool === 'humandesign')?.[1] ?? {}),
      customerQuestion: '我想知道為什麼自己容易被別人的節奏帶走。',
    });

    expect(brief.detailSections.length).toBeGreaterThanOrEqual(2);
    expect(brief.detailSections[0]?.title).toContain('已開、未開');
    expect(brief.detailSections[0]?.items.some((item) => item.title.includes('第 37 閘門'))).toBe(true);
    expect(brief.detailSections[0]?.items.some((item) => item.body.includes('兩個開關都接上'))).toBe(true);
    expect(brief.copyText).toContain('懸掛閘門');
    expect(brief.copyText).toContain('先翻成人話');
    expect(brief.copyText).toContain('不是少了這個能力');
  });

  it('merges teacher drafts without mutating the generated brief', () => {
    const generated = buildTeacherConsultationBrief({
      result: response('maya', samples.find(([tool]) => tool === 'maya')?.[1] ?? {}),
      customerQuestion: '我想理解自己的年度方向',
    });

    const merged = mergeTeacherBriefDraft(generated, {
      plainOneLiner: '你不是沒有答案，只是還沒找到自己聽得懂的說法。',
      coreSummary: '老師調整後的白話摘要',
      sopStages: {
        opening: { script: '我會先用比較生活化的方式陪你看這張圖。' },
      },
    });

    expect(merged.plainOneLiner).toBe('你不是沒有答案，只是還沒找到自己聽得懂的說法。');
    expect(merged.coreSummary).toBe('老師調整後的白話摘要');
    expect(merged.sopStages[0]?.script).toBe('我會先用比較生活化的方式陪你看這張圖。');
    expect(generated.coreSummary).not.toBe(merged.coreSummary);
    expect(generated.sopStages[0]?.script).not.toBe(merged.sopStages[0]?.script);
  });
});
