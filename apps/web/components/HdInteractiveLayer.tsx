'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CalcResponse } from '@/lib/api';
import {
  HD_CENTER_IDS,
  HD_CENTER_POSITIONS,
  HD_CHANNEL_CIRCUITS,
  HD_VIEWBOX,
  isCuratedChannel,
  normalizeDefinedCenters,
  normalizeDefinedChannels,
  sortedChannelKey,
  type HdCenterId,
  type HdCircuit,
} from '@/lib/human-design-bodygraph';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getToolResultCopy } from '@/lib/i18n/tool-result-copy';

type DetailState =
  | { kind: 'center'; id: HdCenterId }
  | { kind: 'channel'; key: string; gates: [number, number] }
  | null;

const CIRCUIT_LABEL_KEY: Record<HdCircuit, 'circuitIndividual' | 'circuitTribal' | 'circuitCollective'> = {
  individual: 'circuitIndividual',
  tribal: 'circuitTribal',
  collective: 'circuitCollective',
};

function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((acc, [key, value]) => acc.split(`{${key}}`).join(String(value)), template);
}

/**
 * 疊加在真實後端 BodyGraph SVG 上的互動層：
 * - 監聽後端 SVG 內 [data-center] / [data-channel] 節點的點擊，彈出白話詳解卡
 * - 依「常見通道」對照表決定顯示完整白話，否則帶入閘門編號走通用樣板
 * - 提供「看能量圖／對照身體部位」切換的人形對照層（不改動、不覆蓋真實 SVG 本體）
 * - 提供已定義通道清單，點清單項目會反過來高亮圖上的線
 * 完全不涉及命盤計算邏輯，只讀 result.data 既有欄位做呈現。
 */
export function HdInteractiveLayer({ result, locale = DEFAULT_LOCALE, svgHostRef }: {
  result?: CalcResponse | null;
  locale?: Locale;
  svgHostRef: React.RefObject<HTMLDivElement | null>;
}) {
  const t = getToolResultCopy(locale).hdPlanar;
  const [showBody, setShowBody] = useState(false);
  const [detail, setDetail] = useState<DetailState>(null);
  const highlightedRef = useRef<Element | null>(null);

  const definedCenters = useMemo(() => new Set(normalizeDefinedCenters(result?.data?.definedCenters)), [result]);
  const definedChannels = useMemo(() => normalizeDefinedChannels(result?.data?.definedChannels), [result]);

  const channelRows = useMemo(
    () =>
      definedChannels.map(([g1, g2]) => {
        const key = sortedChannelKey(g1, g2);
        const curated = isCuratedChannel(key) ? t.channels[key] : undefined;
        const circuit = HD_CHANNEL_CIRCUITS[key];
        return {
          key,
          gates: [g1, g2] as [number, number],
          circuit,
          name: curated?.name ?? fillTemplate(t.channelGenericName, { gate1: g1, gate2: g2 }),
          trait: curated?.trait ?? fillTemplate(t.channelGenericTrait, { gate1: g1, gate2: g2 }),
          daily: curated?.daily ?? fillTemplate(t.channelGenericDaily, { gate1: g1, gate2: g2 }),
        };
      }),
    [definedChannels, t],
  );

  const clearHighlight = () => {
    if (highlightedRef.current) {
      highlightedRef.current.classList.remove('hd-channel--focused');
      highlightedRef.current = null;
    }
  };

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const focusChannelOnGraph = (gates: [number, number]) => {
    const host = svgHostRef.current;
    if (!host) return;
    clearHighlight();
    const a = `${gates[0]}-${gates[1]}`;
    const b = `${gates[1]}-${gates[0]}`;
    const el = host.querySelector(`[data-channel="${a}"], [data-channel="${b}"]`);
    if (el) {
      el.classList.add('hd-channel--focused');
      highlightedRef.current = el;
      if ('scrollIntoView' in el) {
        (el as Element).scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }
    }
  };

  // 監聽真實後端 SVG 內的中心/通道節點點擊（dangerouslySetInnerHTML 內容不在 React 樹裡，需用事件委派）
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return undefined;

    const activateFromTarget = (target: Element) => {
      const centerEl = target.closest('[data-center]');
      if (centerEl) {
        const id = centerEl.getAttribute('data-center') as HdCenterId | null;
        if (id && (HD_CENTER_IDS as string[]).includes(id)) {
          clearHighlight();
          setDetail({ kind: 'center', id });
        }
        return;
      }
      const channelEl = target.closest('[data-channel]');
      if (channelEl) {
        const raw = channelEl.getAttribute('data-channel') || '';
        const [g1, g2] = raw.split('-').map(Number);
        if (Number.isFinite(g1) && Number.isFinite(g2)) {
          clearHighlight();
          channelEl.classList.add('hd-channel--focused');
          highlightedRef.current = channelEl;
          setDetail({ kind: 'channel', key: sortedChannelKey(g1, g2), gates: [g1, g2] });
        }
      }
    };

    const handleClick = (event: Event) => {
      const target = event.target as Element | null;
      if (!target) return;
      activateFromTarget(target);
    };

    // role="button" 承諾鍵盤可操作，Enter/Space 要能觸發跟滑鼠點擊一樣的行為
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target as Element | null;
      if (!target || !(target.hasAttribute('data-center') || target.hasAttribute('data-channel'))) return;
      event.preventDefault();
      activateFromTarget(target);
    };

    host.addEventListener('click', handleClick);
    host.addEventListener('keydown', handleKeydown);
    host.querySelectorAll('[data-center], [data-channel]').forEach((el) => {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
    });
    return () => {
      host.removeEventListener('click', handleClick);
      host.removeEventListener('keydown', handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const closeDetail = () => {
    clearHighlight();
    setDetail(null);
  };

  // 詳解卡開啟時允許 Esc 關閉，滿足 role="dialog" 的鍵盤操作預期
  useEffect(() => {
    if (!detail) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  const centerDetail = detail?.kind === 'center' ? t.centers[detail.id] : null;
  const centerIsDefined = detail?.kind === 'center' ? definedCenters.has(detail.id) : false;
  const channelDetail = detail?.kind === 'channel' ? channelRows.find((row) => row.key === detail.key) : null;

  return (
    <div className="hd-interactive">
      <div className="hd-interactive__toggle" role="tablist" aria-label={t.bodyToggleGraph}>
        <button type="button" className={showBody ? '' : 'is-active'} onClick={() => setShowBody(false)}>
          {t.bodyToggleGraph}
        </button>
        <button type="button" className={showBody ? 'is-active' : ''} onClick={() => setShowBody(true)}>
          {t.bodyToggleBody}
        </button>
      </div>

      {showBody && (
        <svg
          className="hd-body-overlay"
          viewBox={`0 0 ${HD_VIEWBOX.width} ${HD_VIEWBOX.height}`}
          aria-hidden="true"
        >
          <path
            className="hd-body-overlay__silhouette"
            d="M360 40 C336 40 318 60 318 84 C318 104 330 118 342 125 C305 142 284 172 280 216 L262 372 C259 394 269 408 289 408 L300 408 L289 592 C286 624 289 690 300 758 M360 40 C384 40 402 60 402 84 C402 104 390 118 378 125 C415 142 436 172 440 216 L458 372 C461 394 451 408 431 408 L420 408 L431 592 C434 624 431 690 420 758 M318 216 L272 336 M402 216 L448 336"
          />
          {HD_CENTER_IDS.map((id) => {
            const pos = HD_CENTER_POSITIONS[id];
            const info = t.centers[id];
            const isRight = pos.x > HD_VIEWBOX.width / 2;
            const isLeft = pos.x < HD_VIEWBOX.width / 2 - 20;
            return (
              <g key={id} className={definedCenters.has(id) ? 'hd-body-dot hd-body-dot--defined' : 'hd-body-dot'}>
                <circle cx={pos.x} cy={pos.y} r={7} />
                <text
                  x={isRight ? pos.x + 18 : isLeft ? pos.x - 18 : pos.x}
                  y={pos.y + 4}
                  textAnchor={isRight ? 'start' : isLeft ? 'end' : 'middle'}
                >
                  {info.bodyPart}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {channelRows.length > 0 ? (
        <div className="hd-channel-list" aria-label={t.channelsTitle}>
          <div className="hd-channel-list__head">
            <strong>{t.channelsTitle}</strong>
            <p>{t.channelsHint}</p>
          </div>
          <ul>
            {channelRows.map((row) => (
              <li key={row.key}>
                <button
                  type="button"
                  className={detail?.kind === 'channel' && detail.key === row.key ? 'is-active' : ''}
                  onClick={() => {
                    setDetail({ kind: 'channel', key: row.key, gates: row.gates });
                    focusChannelOnGraph(row.gates);
                  }}
                >
                  <span className={`hd-channel-list__dot hd-channel-list__dot--${row.circuit ?? 'collective'}`} />
                  <span className="hd-channel-list__name">{row.name}</span>
                  <span className="hd-channel-list__gates">
                    {t.gateLabel} {row.gates[0]}-{row.gates[1]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="hd-channel-list__disclaimer">{t.circuitDisclaimer}</p>
        </div>
      ) : (
        <p className="hd-channel-list__empty">{t.channelsEmpty}</p>
      )}

      {detail && (
        <>
          <div className="hd-detail-scrim" onClick={closeDetail} />
          <div className="hd-detail-card" role="dialog" aria-modal="true">
            <button type="button" className="hd-detail-card__close" onClick={closeDetail} aria-label={t.closeLabel}>
              ×
            </button>
            {centerDetail && (
              <>
                <p className="hd-detail-card__eyebrow">{centerDetail.label}</p>
                <h3>{t.bodyPartLabel}：{centerDetail.bodyPart}</h3>
                <p className="hd-detail-card__state">{centerIsDefined ? t.stateDefined : t.stateUndefined}</p>
                <p className="hd-detail-card__body">{centerDetail.meaning}</p>
                <div className="hd-detail-card__tip">
                  <b>{t.dailyLabel}：</b>
                  {centerIsDefined ? centerDetail.definedTip : centerDetail.undefinedTip}
                </div>
              </>
            )}
            {channelDetail && (
              <>
                <p className="hd-detail-card__eyebrow">
                  {t.gateLabel} {channelDetail.gates[0]} · {channelDetail.gates[1]}
                </p>
                <h3>{channelDetail.name}</h3>
                {channelDetail.circuit && (
                  <p className="hd-detail-card__state">
                    {t.circuitLabel}：{t[CIRCUIT_LABEL_KEY[channelDetail.circuit]]}
                  </p>
                )}
                <p className="hd-detail-card__body">{channelDetail.trait}</p>
                <div className="hd-detail-card__tip">
                  <b>{t.dailyLabel}：</b>
                  {channelDetail.daily}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
