/**
 * Mele calculation API client.
 *
 * The browser calls `/api/calc/{tool}` and Next.js rewrites it to the Python
 * FastAPI service. This keeps CORS and production API URLs out of client code.
 */

export type CalcTool =
  | 'numerology'
  | 'maya'
  | 'bazi'
  | 'ziwei'
  | 'tarot'
  | 'runes'
  | 'astro'
  | 'humandesign';

export interface CalcResponse {
  tool: CalcTool;
  version: string;
  computed_at: string;
  input: Record<string, unknown>;
  data: Record<string, unknown>;
  render: {
    svg?: string;
    html?: string;
    palette?: string[];
    animations?: Record<string, unknown>[];
    speech?: string;
  };
}

export class CalcError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'CalcError';
  }
}

export type CalcDetailLevel = 'teaser' | 'full';
export type CalcVoice = 'friend' | 'scholar' | 'master';

export interface CalcOptions {
  /** "teaser" (default, customer-facing short) or "full" (teacher backend deep). */
  detail?: CalcDetailLevel;
  /** Narration voice — only honored by numerology in full mode (for now). */
  voice?: CalcVoice;
}

export async function calc(
  tool: CalcTool,
  input: Record<string, unknown>,
  options: CalcOptions = {},
): Promise<CalcResponse> {
  const search = new URLSearchParams();
  if (options.detail) search.set('detail', options.detail);
  if (options.voice) search.set('voice', options.voice);
  const query = search.toString();
  const url = query ? `/api/calc/${tool}?${query}` : `/api/calc/${tool}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail?.error || err.detail || err.message || detail;
    } catch {
      /* ignore JSON parse failures */
    }
    throw new CalcError(detail, response.status);
  }

  return response.json();
}
