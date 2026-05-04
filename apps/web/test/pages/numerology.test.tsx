import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ToastProvider } from '@/components/ToastProvider';
import NumerologyPage from '@/app/tools/numerology/page';

// 整段 ToolResultSection 含 dynamic ReadingArStage（會 fetch SVG），先 stub 掉
vi.mock('@/components/ToolResultSection', () => ({
  ToolResultSection: ({ result }: { result: { tool: string } }) => (
    <div data-testid="tool-result">[result for {result.tool}]</div>
  ),
}));

vi.mock('@/lib/use-profile', () => ({
  useProfile: () => ({
    loaded: true,
    isAuthed: false,
    hasData: false,
    display_name: null,
    birth_date: null,
    birth_time: null,
    birth_location: null,
    birth_lat: null,
    birth_lon: null,
    birth_timezone: null,
    gender: null,
  }),
}));

function renderPage() {
  return render(
    <ToastProvider>
      <NumerologyPage />
    </ToastProvider>,
  );
}

describe('<NumerologyPage />', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders title and form', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: '生命靈數' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /開始解讀/ })).toBeInTheDocument();
  });

  it('shows toast error when submitting without a date', () => {
    const { container } = renderPage();
    // 直接觸發 form submit；click 在 jsdom 下會被 HTML5 required 屬性卡住
    const form = container.querySelector('form');
    if (!form) throw new Error('form not found');
    fireEvent.submit(form);
    expect(screen.getByText(/請先選擇出生日期/)).toBeInTheDocument();
  });

  it('submits form and renders ToolResult on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        tool: 'numerology',
        version: 'v1',
        computed_at: '2026-05-04',
        input: { year: 1990, month: 6, day: 15 },
        data: { lifePath: 4 },
        render: { svg: '<svg/>' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderPage();
    const yearSelect = screen.getByRole('combobox', { name: /年/i }) as HTMLSelectElement;
    const monthSelect = screen.getByRole('combobox', { name: /月/i }) as HTMLSelectElement;
    const daySelect = screen.getByRole('combobox', { name: /日/i }) as HTMLSelectElement;

    fireEvent.change(yearSelect, { target: { value: '1990' } });
    fireEvent.change(monthSelect, { target: { value: '6' } });
    fireEvent.change(daySelect, { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /開始解讀/ }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/calc/numerology',
        expect.objectContaining({ method: 'POST' }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('tool-result')).toBeInTheDocument();
    });
  });

  it('renders ToolError when API returns failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: { error: '日期格式錯誤' } }),
    }));

    renderPage();
    fireEvent.change(screen.getByRole('combobox', { name: /年/i }), { target: { value: '1990' } });
    fireEvent.change(screen.getByRole('combobox', { name: /月/i }), { target: { value: '6' } });
    fireEvent.change(screen.getByRole('combobox', { name: /日/i }), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /開始解讀/ }));

    await waitFor(() => {
      expect(screen.getByText('計算失敗')).toBeInTheDocument();
    });
  });
});
