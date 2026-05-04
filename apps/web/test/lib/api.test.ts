import { afterEach, describe, expect, it, vi } from 'vitest';
import { calc, CalcError } from '@/lib/api';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(response: Partial<Response> & { jsonValue?: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: vi.fn().mockResolvedValue(response.jsonValue ?? {}),
    ...response,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('lib/api calc()', () => {
  it('POSTs JSON to /api/calc/{tool} and returns the parsed body', async () => {
    const fetchMock = mockFetch({
      ok: true,
      jsonValue: { tool: 'numerology', version: 'v1', computed_at: '2026-05-04', input: {}, data: {}, render: {} },
    });

    const res = await calc('numerology', { year: 1990, month: 6, day: 15 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/calc/numerology');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ year: 1990, month: 6, day: 15 });
    expect(res.tool).toBe('numerology');
  });

  it('throws CalcError with detail.error on non-2xx response', async () => {
    mockFetch({
      ok: false,
      status: 422,
      jsonValue: { detail: { error: 'invalid_input' } },
    });

    await expect(calc('bazi', {})).rejects.toMatchObject({
      message: 'invalid_input',
      status: 422,
      name: 'CalcError',
    });
  });

  it('falls back to HTTP status when JSON parse fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('bad json')),
    }));

    const err = await calc('astro', {}).catch((e) => e);
    expect(err).toBeInstanceOf(CalcError);
    expect(err.message).toBe('HTTP 500');
    expect(err.status).toBe(500);
  });

  it('handles detail as plain string', async () => {
    mockFetch({ ok: false, status: 400, jsonValue: { detail: 'bad request shape' } });
    await expect(calc('tarot', {})).rejects.toMatchObject({ message: 'bad request shape', status: 400 });
  });

  it('handles message field as fallback', async () => {
    mockFetch({ ok: false, status: 503, jsonValue: { message: 'service unavailable' } });
    await expect(calc('runes', {})).rejects.toMatchObject({ message: 'service unavailable', status: 503 });
  });

  it('CalcError preserves stack and instanceof', async () => {
    mockFetch({ ok: false, status: 418, jsonValue: { detail: 'teapot' } });
    try {
      await calc('maya', {});
    } catch (err) {
      expect(err).toBeInstanceOf(CalcError);
      expect(err).toBeInstanceOf(Error);
      expect((err as CalcError).status).toBe(418);
    }
  });
});
