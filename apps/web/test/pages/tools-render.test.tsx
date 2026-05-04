import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/components/ToastProvider';

// 統一 stub 重渲染元件 / hook
vi.mock('@/components/ToolResultSection', () => ({
  ToolResultSection: () => <div data-testid="tool-result" />,
}));
vi.mock('@/lib/use-profile', () => ({
  useProfile: () => ({
    loaded: true, isAuthed: false, hasData: false,
    display_name: null, birth_date: null, birth_time: null,
    birth_location: null, birth_lat: null, birth_lon: null,
    birth_timezone: null, gender: null,
  }),
  normalizeTime: (v: string | null) => (v ? v.slice(0, 5) : ''),
}));

import NumerologyPage from '@/app/tools/numerology/page';
import MayaPage from '@/app/tools/maya/page';
import BaziPage from '@/app/tools/bazi/page';
import TarotPage from '@/app/tools/tarot/page';
import RunesPage from '@/app/tools/runes/page';
import AstroPage from '@/app/tools/astro/page';
import ZiweiPage from '@/app/tools/ziwei/page';
import HumanDesignPage from '@/app/tools/humandesign/page';

const cases: Array<[string, () => JSX.Element, RegExp]> = [
  ['生命靈數', NumerologyPage, /生命靈數/],
  ['馬雅', MayaPage, /馬雅/],
  ['八字', BaziPage, /八字/],
  ['塔羅', TarotPage, /塔羅/],
  ['盧恩', RunesPage, /盧恩|符文/],
  ['占星', AstroPage, /占星|星盤/],
  ['紫微', ZiweiPage, /紫微/],
  ['人類圖', HumanDesignPage, /人類圖/],
];

describe('all 8 tool pages render without throwing', () => {
  it.each(cases)('renders %s page', (_name, Page, titleMatcher) => {
    render(
      <ToastProvider>
        <Page />
      </ToastProvider>,
    );
    expect(screen.getAllByText(titleMatcher).length).toBeGreaterThan(0);
  });
});
