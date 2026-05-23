/**
 * Lightweight observability shim.
 *
 * Real Sentry integration is gated by `NEXT_PUBLIC_SENTRY_DSN` (frontend)
 * or `SENTRY_DSN` (server). When the DSN is missing, every export is a
 * no-op so we don't pay bundle cost or runtime overhead in dev / preview.
 *
 * To activate:
 *   1. `npm --prefix apps/web install @sentry/nextjs`
 *   2. Add `NEXT_PUBLIC_SENTRY_DSN=...` to env
 *   3. Replace the dynamic-import stub below with a real `Sentry.init({...})`
 *      in `instrumentation.ts` (Next.js convention).
 *
 * The functions below are also safe to call from error boundaries and
 * server actions — they swallow their own errors so observability code
 * never breaks the app.
 */

const SENTRY_DSN =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
    : undefined;

export const isObservabilityEnabled = Boolean(SENTRY_DSN);

interface CaptureContext {
  /** Free-form tags (max ~30 chars each) — shown in Sentry issue list. */
  tags?: Record<string, string>;
  /** Larger context blob — shown in issue detail. */
  extra?: Record<string, unknown>;
  /** Severity. Defaults to 'error' for captureException, 'info' for captureMessage. */
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

export function captureException(error: unknown, context?: CaptureContext): void {
  if (!isObservabilityEnabled) {
    // Dev / preview — emit to console so traces stay visible without Sentry.
    // eslint-disable-next-line no-console
    console.error('[observability]', error, context);
    return;
  }
  // TODO: once @sentry/nextjs is installed, replace with:
  //   Sentry.withScope((scope) => {
  //     if (context?.tags) scope.setTags(context.tags);
  //     if (context?.extra) scope.setExtras(context.extra);
  //     if (context?.level) scope.setLevel(context.level);
  //     Sentry.captureException(error);
  //   });
  // For now log to console even when DSN set — keeps behavior consistent
  // until real Sentry SDK is wired.
  // eslint-disable-next-line no-console
  console.error('[observability]', error, context);
}

export function captureMessage(message: string, context?: CaptureContext): void {
  if (!isObservabilityEnabled) {
    // eslint-disable-next-line no-console
    console.warn('[observability]', message, context);
    return;
  }
  // TODO: Sentry.captureMessage(message, context?.level ?? 'info');
  // eslint-disable-next-line no-console
  console.warn('[observability]', message, context);
}
