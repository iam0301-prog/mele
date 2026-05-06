import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ToastProvider } from '@/components/ToastProvider';
import AstroPage from '@/app/tools/astro/page';

vi.mock('@/components/ToolResultSection', () => ({
  ToolResultSection: () => <div data-testid="tool-result" />,
}));

vi.mock('@/lib/use-profile', () => ({
  useProfile: () => ({
    loaded: true,
    isAuthed: true,
    hasData: true,
    display_name: 'Test member',
    birth_date: '1990-07-01',
    birth_time: '12:00:00',
    birth_location: 'Los Angeles',
    birth_lat: 34.0522,
    birth_lon: -118.2437,
    birth_timezone: 'America/Los_Angeles',
    gender: null,
  }),
  normalizeTime: (value: string | null) => (value ? value.slice(0, 5) : ''),
}));

function renderPage() {
  return render(
    <ToastProvider>
      <AstroPage />
    </ToastProvider>,
  );
}

describe('<AstroPage /> timezone handling', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits the birthplace timezone offset from the saved profile', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        tool: 'astro',
        version: 'v1',
        computed_at: '2026-05-06',
        input: {},
        data: { planets: {}, houses: [] },
        render: { svg: '<svg />' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('UTC-7')).toBeInTheDocument();
    });

    const form = container.querySelector('form');
    if (!form) throw new Error('form not found');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/calc/astro',
        expect.objectContaining({
          body: expect.any(String),
          method: 'POST',
        }),
      );
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.timezone).toBe(-7);
    expect(body.latitude).toBe(34.0522);
    expect(body.longitude).toBe(-118.2437);
  });
});
