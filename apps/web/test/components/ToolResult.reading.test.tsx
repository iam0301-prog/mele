import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToolResult } from '@/components/ToolResult';
import type { CalcResponse } from '@/lib/api';

Element.prototype.scrollIntoView = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

const base = (tool: CalcResponse['tool'], data: Record<string, unknown>): CalcResponse => ({
  tool,
  version: 'test',
  computed_at: '2026-05-25T00:00:00Z',
  input: {},
  data,
  render: {
    svg: '<svg data-testid="backend-svg"></svg>',
    html: '<p>backend technical detail</p>',
    speech: 'backend speech',
  },
});

describe('ToolResult real reading surface', () => {
  it('does not show beginner lessons, raw technical details, or backend SVG for Maya', () => {
    const result = base('maya', {
      kin: 143,
      label: '宇宙 藍夜',
      tone: '宇宙',
      seal: '藍夜',
      sealNum: 3,
      toneNum: 13,
      starroot: {
        dreamspell: { label: 'Cosmic Blue Night' },
        longCount: { starrootLabel: '12.19.2.17.1' },
      },
      oracle: {
        self: { kin: 143, tone: { name: '宇宙' }, seal: { zh: '藍夜' } },
        guide: { kin: 247, tone: { name: '宇宙' }, seal: { zh: '藍手' } },
        analog: { kin: 156, tone: { name: '宇宙' }, seal: { zh: '黃戰士' } },
        antipode: { kin: 13, tone: { name: '宇宙' }, seal: { zh: '紅天行者' } },
        occult: { kin: 118, tone: { name: '磁性' }, seal: { zh: '白鏡' } },
      },
    });

    const { container } = render(<ToolResult result={result} />);

    expect(screen.getByText(/先給會員的命中感/)).toBeInTheDocument();
    expect(screen.queryByText(/MEMBER STARTER/)).not.toBeInTheDocument();
    expect(screen.queryByText(/READING MAP/)).not.toBeInTheDocument();
    expect(screen.queryByText(/查看完整技術明細/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Starroot|sealNum|12\.19\.2\.17\.1|Cosmic Blue Night/)).not.toBeInTheDocument();
    expect(container.querySelector('.mele-svg-wrap')).toBeNull();
  });

  it('renders a live Human Design BodyGraph from result data and keeps every gate explanation', async () => {
    const result = base('humandesign', {
      type: 'Generator',
      authority: 'Emotional',
      profile: '2/4',
      strategy: '回應再行動',
      definedCenters: ['Root', 'Sacral', 'SolarPlexus'],
      definedChannels: [[9, 52], [30, 41]],
      activatedGates: [1, 9, 30, 41, 52],
      designBodies: {
        sun: { gate: 30, line: 1 },
        earth: { gate: 41, line: 4 },
      },
      personalityBodies: {
        sun: { gate: 9, line: 5 },
        earth: { gate: 52, line: 2 },
      },
    });

    const { container } = render(<ToolResult result={result} locale="zh-TW" />);

    expect(screen.getByRole('heading', { name: '你的閘門與通道' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '你的人類圖，現在可以直接看懂' })).toBeInTheDocument();
    expect(container.querySelector('.hd-live__graph')).toBeInTheDocument();
    expect(container.querySelectorAll('.hd-live__center')).toHaveLength(9);
    expect(container.querySelectorAll('.hd-live__channel-defined')).toHaveLength(2);
    expect(container.querySelectorAll('.hd-live__channel-base')).toHaveLength(0);
    expect(container.querySelectorAll('.hd-live__channel-partial')).toHaveLength(0);
    expect(container.querySelectorAll('.hd-live__gate')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: '36 條通道總表' })).toBeInTheDocument();
    expect(container.querySelectorAll('.hd-channel-card')).toHaveLength(36);
    expect(container.querySelectorAll('.hd-channel-card.is-defined')).toHaveLength(2);
    expect(container.querySelectorAll('.hd-channel-card.is-undefined')).toHaveLength(34);
    expect(container.querySelectorAll('.hd-channel-card__states > div:first-child span')).toHaveLength(36);
    expect(container.querySelectorAll('.hd-channel-card__states > div:last-child span')).toHaveLength(36);
    expect(container.querySelector('.hd-live img')).toBeNull();
    expect(screen.getByRole('button', { name: '太陽，閘門 30，第 1 爻' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '在圖上定位 9—52 專注通道' }));
    expect(screen.getByText('9 ↔ 52')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '在圖上定位 64—47 抽象通道' }));
    expect(container.querySelectorAll('.hd-live__channel-preview')).toHaveLength(1);
    expect(screen.getAllByText('理解不必隨時出現；與人討論或隔一段時間後，反而更容易想通。')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: '已開啟 2' }));
    expect(container.querySelectorAll('.hd-channel-card')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: '單一重點' }));
    expect(container.querySelectorAll('.hd-live__channel-base')).toHaveLength(0);
    expect(container.querySelectorAll('.hd-live__gate')).toHaveLength(2);
    expect(container.querySelectorAll('.human-design-signals__channel')).toHaveLength(2);
    expect(container.querySelectorAll('.human-design-signals__gate')).toHaveLength(5);
    expect(screen.getByLabelText('完整通道 9-52')).toBeInTheDocument();
    expect(screen.getByText('閘門 52')).toBeInTheDocument();
    expect(container.querySelector('.mele-svg-wrap')).toBeNull();
  });

  it('gives tarot cards position-specific reading text instead of repeating the same body', async () => {
    const result = base('tarot', {
      cards: [
        { spread_position: '過去', position: 'upright', meaning: '這張牌提醒你先穩住內在。', card: { id: 1, name_zh: '魔術師', upright: { text: '這張牌提醒你先穩住內在。' } } },
        { spread_position: '現在', position: 'upright', meaning: '這張牌提醒你先穩住內在。', card: { id: 2, name_zh: '女祭司', upright: { text: '這張牌提醒你先穩住內在。' } } },
        { spread_position: '下一步', position: 'reversed', meaning: '這張牌提醒你先穩住內在。', card: { id: 3, name_zh: '皇后', reversed: { text: '這張牌提醒你先穩住內在。' } } },
      ],
    });

    render(<ToolResult result={result} />);
    expect(decodeURIComponent(screen.getByRole('img', { name: '魔術師，過去，正位' }).getAttribute('src') ?? '')).toContain('/tarot/cards/ocean_poseidon/1.webp');
    expect(screen.getByRole('img', { name: '女祭司，現在，正位' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '皇后，下一步，逆位' })).toHaveClass('is-reversed');
    const buttons = screen.getAllByRole('button', { name: /展開解讀|收起解讀/ });
    const bodies: string[] = [];
    for (const button of buttons.slice(0, 3)) {
      await userEvent.click(button);
      bodies.push(button.closest('article')?.textContent || '');
      await userEvent.click(button);
    }

    expect(new Set(bodies).size).toBe(3);
    expect(bodies[0]).toMatch(/過去/);
    expect(bodies[1]).toMatch(/現在/);
    expect(bodies[2]).toMatch(/下一步/);
  });
});
