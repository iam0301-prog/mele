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
