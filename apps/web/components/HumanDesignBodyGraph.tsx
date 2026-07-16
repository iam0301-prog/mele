'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  HD_CENTER_IDS,
  HD_CENTER_POSITIONS,
  HD_CHANNELS,
  HD_CHANNEL_CIRCUITS,
  HD_GATE_TO_CENTER,
  HD_VIEWBOX,
  getHdGatePositions,
  isCuratedChannel,
  normalizeDefinedCenters,
  normalizeDefinedChannels,
  sortedChannelKey,
  type HdCenterId,
} from '@/lib/human-design-bodygraph';
import { HD_CHANNEL_GUIDE } from '@/lib/human-design-channel-guide';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getToolResultCopy } from '@/lib/i18n/tool-result-copy';

type Dict = Record<string, unknown>;
type Selection = { kind: 'center'; id: HdCenterId } | { kind: 'channel'; gates: [number, number] };
type ChannelFilter = 'all' | 'defined' | 'undefined';

const PLANET_ORDER = ['sun', 'earth', 'moon', 'northNode', 'southNode', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const PLANET_LABELS: Record<string, string> = {
  sun: '太陽', earth: '地球', moon: '月亮', northNode: '北交點', southNode: '南交點',
  mercury: '水星', venus: '金星', mars: '火星', jupiter: '木星', saturn: '土星',
  uranus: '天王星', neptune: '海王星', pluto: '冥王星',
};

const CENTER_COLORS: Record<HdCenterId, string> = {
  Head: '#d8c077', Ajna: '#aeb7c2', Throat: '#6ab7c7', G: '#d7b15d', Heart: '#c85b3f',
  Sacral: '#cf8b35', SolarPlexus: '#a86dc0', Spleen: '#729d58', Root: '#b94e4e',
};

const GATE_POSITIONS = getHdGatePositions();

function asDict(value: unknown): Dict {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Dict : {};
}

function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((output, [key, value]) => output.split(`{${key}}`).join(String(value)), template);
}

function centerShape(id: HdCenterId): string {
  const { x, y, size } = HD_CENTER_POSITIONS[id];
  const half = size / 2;
  if (id === 'Head') return `M ${x - half} ${y + half} L ${x + half} ${y + half} L ${x} ${y - half} Z`;
  if (id === 'Ajna') return `M ${x - half} ${y - half} L ${x + half} ${y - half} L ${x} ${y + half} Z`;
  if (id === 'G') return `M ${x} ${y - half} L ${x + half} ${y} L ${x} ${y + half} L ${x - half} ${y} Z`;
  if (id === 'Heart' || id === 'Spleen') return `M ${x - half} ${y} L ${x + half} ${y - half} L ${x + half} ${y + half} Z`;
  if (id === 'SolarPlexus') return `M ${x + half} ${y} L ${x - half} ${y - half} L ${x - half} ${y + half} Z`;
  return `M ${x - half} ${y - half} H ${x + half} V ${y + half} H ${x - half} Z`;
}

function normalizeGate(value: unknown): number | null {
  const gate = Number(value);
  return Number.isInteger(gate) && gate >= 1 && gate <= 64 ? gate : null;
}

function activationRows(value: unknown) {
  const source = asDict(value);
  return PLANET_ORDER.flatMap((planet) => {
    const body = asDict(source[planet]);
    const gate = normalizeGate(body.gate);
    if (!gate) return [];
    const line = Number(body.line);
    return [{
      planet,
      label: PLANET_LABELS[planet] ?? String(body.label ?? planet),
      gate,
      line: Number.isFinite(line) ? line : null,
    }];
  });
}

function ActivationColumn({
  title,
  hint,
  tone,
  rows,
  selectedGate,
  onSelect,
}: {
  title: string;
  hint: string;
  tone: 'design' | 'personality';
  rows: ReturnType<typeof activationRows>;
  selectedGate: number | null;
  onSelect: (gate: number) => void;
}) {
  return (
    <aside className={`hd-live__activation hd-live__activation--${tone}`} aria-label={title}>
      <div className="hd-live__activation-head">
        <span>{tone === 'design' ? 'DESIGN' : 'PERSONALITY'}</span>
        <h3>{title}</h3>
        <p>{hint}</p>
      </div>
      <ol>
        {rows.map((row) => (
          <li key={row.planet}>
            <button
              type="button"
              className={selectedGate === row.gate ? 'is-active' : ''}
              onClick={() => onSelect(row.gate)}
              aria-label={`${row.label}，閘門 ${row.gate}${row.line ? `，第 ${row.line} 爻` : ''}`}
            >
              <span>{row.label}</span>
              <strong>{row.gate}{row.line ? `.${row.line}` : ''}</strong>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ChannelDirectory({
  definedChannelKeys,
  selectedChannelKey,
  filter,
  onFilter,
  onSelect,
}: {
  definedChannelKeys: Set<string>;
  selectedChannelKey: string | null;
  filter: ChannelFilter;
  onFilter: (filter: ChannelFilter) => void;
  onSelect: (gates: [number, number]) => void;
}) {
  const definedCount = definedChannelKeys.size;
  const undefinedCount = HD_CHANNELS.length - definedCount;
  const rows = HD_CHANNELS
    .map((gates) => {
      const key = sortedChannelKey(...gates);
      return { gates, key, guide: HD_CHANNEL_GUIDE[key], isDefined: definedChannelKeys.has(key) };
    })
    .filter((row) => filter === 'all' || (filter === 'defined' ? row.isDefined : !row.isDefined))
    .sort((a, b) => Number(b.isDefined) - Number(a.isDefined));

  return (
    <section className="hd-channel-directory" aria-labelledby="hd-channel-directory-title">
      <header className="hd-channel-directory__header">
        <div>
          <span>36 CHANNELS</span>
          <h3 id="hd-channel-directory-title">36 條通道總表</h3>
          <p>已開啟代表兩端閘門連成穩定通道；未開啟代表這項功能不是固定運作，不等於你沒有能力。</p>
        </div>
        <div className="hd-channel-directory__totals" aria-label="通道開啟統計">
          <span className="is-defined"><strong>{definedCount}</strong> 已開啟</span>
          <span><strong>{undefinedCount}</strong> 未開啟</span>
        </div>
      </header>

      <div className="hd-channel-directory__filters" role="group" aria-label="篩選通道狀態">
        {([
          ['all', `全部 ${HD_CHANNELS.length}`],
          ['defined', `已開啟 ${definedCount}`],
          ['undefined', `未開啟 ${undefinedCount}`],
        ] as [ChannelFilter, string][]).map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={filter === value ? 'is-active' : ''}
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hd-channel-directory__grid" aria-live="polite">
        {rows.map(({ gates: [gate1, gate2], key, guide, isDefined }) => (
          <article
            key={key}
            className={`hd-channel-card${isDefined ? ' is-defined' : ' is-undefined'}${selectedChannelKey === key ? ' is-selected' : ''}`}
            data-channel-status={isDefined ? 'defined' : 'undefined'}
          >
            <div className="hd-channel-card__head">
              <span className="hd-channel-card__status">{isDefined ? '已開啟' : '未開啟'}</span>
              <strong>{gate1} — {gate2}</strong>
            </div>
            <h4>{guide?.name ?? `通道 ${gate1}—${gate2}`}</h4>
            <p className="hd-channel-card__purpose">{guide?.purpose}</p>
            <div className="hd-channel-card__states">
              <div className={isDefined ? 'is-current' : ''}>
                <span>已開啟時</span>
                <p>{guide?.defined}</p>
              </div>
              <div className={!isDefined ? 'is-current' : ''}>
                <span>未開啟時</span>
                <p>{guide?.undefined}</p>
              </div>
            </div>
            <button
              type="button"
              className="hd-channel-card__locate"
              onClick={() => onSelect([gate1, gate2])}
              aria-label={`在圖上定位 ${gate1}—${gate2} ${guide?.name ?? '通道'}`}
            >
              在圖上定位
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HumanDesignBodyGraph({ data, locale = DEFAULT_LOCALE }: { data: Dict; locale?: Locale }) {
  const copy = getToolResultCopy(locale).hdPlanar;
  const isZh = locale === 'zh-TW';
  const definedCenterList = useMemo(() => normalizeDefinedCenters(data.definedCenters), [data.definedCenters]);
  const definedCenters = useMemo(() => new Set(definedCenterList), [definedCenterList]);
  const definedChannels = useMemo(() => normalizeDefinedChannels(data.definedChannels), [data.definedChannels]);
  const definedChannelKeys = useMemo(() => new Set(definedChannels.map(([a, b]) => sortedChannelKey(a, b))), [definedChannels]);
  const activatedGates = useMemo(
    () => new Set((Array.isArray(data.activatedGates) ? data.activatedGates : []).map(normalizeGate).filter((gate): gate is number => gate !== null)),
    [data.activatedGates],
  );
  const designRows = useMemo(() => activationRows(data.designBodies), [data.designBodies]);
  const personalityRows = useMemo(() => activationRows(data.personalityBodies), [data.personalityBodies]);
  const [showStructure, setShowStructure] = useState(true);
  const [showActivations, setShowActivations] = useState(false);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [selection, setSelection] = useState<Selection>(() => (
    definedChannels[0]
      ? { kind: 'channel', gates: definedChannels[0] }
      : { kind: 'center', id: definedCenterList[0] ?? 'G' }
  ));

  const selectGate = (gate: number) => {
    setSelectedGate(gate);
    setSelection({ kind: 'center', id: HD_GATE_TO_CENTER[gate] ?? 'G' });
  };

  const selectedCenter = selection.kind === 'center' ? selection.id : null;
  const selectedChannel = selection.kind === 'channel' ? selection.gates : null;
  const selectedChannelKey = selectedChannel ? sortedChannelKey(...selectedChannel) : null;
  const selectedChannelDefined = selectedChannelKey ? definedChannelKeys.has(selectedChannelKey) : false;
  const selectedChannelGuide = selectedChannelKey ? HD_CHANNEL_GUIDE[selectedChannelKey] : null;
  const channelDetail = selectedChannelKey && isCuratedChannel(selectedChannelKey) ? copy.channels[selectedChannelKey] : null;
  const visibleGates = showStructure
    ? new Set([...activatedGates, ...(selectedChannel ?? [])])
    : new Set(
      selectedChannel
        ? selectedChannel
        : [...activatedGates].filter((gate) => selectedCenter && HD_GATE_TO_CENTER[gate] === selectedCenter),
    );

  return (
    <section className={`hd-live${showStructure ? ' hd-live--model' : ' hd-live--focus'}`} aria-labelledby="hd-live-title">
      <header className="hd-live__header">
        <div>
          <span>{isZh ? 'LIVE BODYGRAPH' : 'LIVE BODYGRAPH'}</span>
          <h2 id="hd-live-title">{isZh ? '你的人類圖，現在可以直接看懂' : copy.stageTitle}</h2>
          <p>{isZh ? '這不是盤面圖片。點中心、通道或左右資料，圖與白話解讀會一起連動。' : copy.stageBody}</p>
        </div>
        <div className="hd-live__view-toggle" aria-label={isZh ? '圖面顯示方式' : copy.bodyToggleGraph}>
          <button type="button" className={showStructure ? 'is-active' : ''} onClick={() => setShowStructure(true)} aria-pressed={showStructure}>
            {isZh ? '個人完整圖' : copy.bodyToggleGraph}
          </button>
          <button type="button" className={!showStructure ? 'is-active' : ''} onClick={() => setShowStructure(false)} aria-pressed={!showStructure}>
            {isZh ? '單一重點' : copy.legendOn}
          </button>
        </div>
      </header>

      <div className={`hd-live__workspace${showStructure ? ' is-model' : ' is-focus'}`}>
        {showStructure && (
          <ActivationColumn
            title={isZh ? '設計面' : 'Design'}
            hint={isZh ? '身體自然會做出的反應' : 'Your unconscious body pattern'}
            tone="design"
            rows={designRows}
            selectedGate={selectedGate}
            onSelect={selectGate}
          />
        )}
        <div className="hd-live__graph-wrap">
          <p className="hd-live__clarity-note">
            {isZh ? '只畫你的啟動：圓點是啟動閘門，粗線是已形成的完整通道。' : copy.frameNote}
          </p>
          <div className="hd-live__at-a-glance" aria-label={isZh ? '人類圖重點數量' : copy.frameNote}>
            <span><strong>{definedCenterList.length}</strong>{isZh ? '個穩定中心' : copy.stateDefined}</span>
            <span><strong>{definedChannels.length}</strong>{isZh ? '條完整通道' : copy.channelsTitle}</span>
            <span><strong>{activatedGates.size}</strong>{isZh ? '個啟動閘門' : copy.gateLabel}</span>
          </div>
          <svg
            className="hd-live__graph"
            viewBox={`0 0 ${HD_VIEWBOX.width} ${HD_VIEWBOX.height}`}
            role="group"
            aria-label={isZh ? '可互動的人類圖，包含九個中心與已定義通道' : copy.frameLabel}
          >
            <defs>
              <linearGradient id="hd-live-channel-gradient" x1="0" x2="1">
                <stop offset="0" stopColor="#bd4b26" />
                <stop offset="1" stopColor="#397785" />
              </linearGradient>
              <filter id="hd-live-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {showStructure && <path className="hd-live__silhouette" d="M360 56 C330 56 312 82 319 109 C323 126 335 139 349 146 C304 171 286 215 283 271 L270 432 C268 469 285 493 313 505 L290 645 C281 704 286 783 302 842 L282 1045 M360 56 C390 56 408 82 401 109 C397 126 385 139 371 146 C416 171 434 215 437 271 L450 432 C452 469 435 493 407 505 L430 645 C439 704 434 783 418 842 L438 1045" />}

            {selectedChannel && !selectedChannelDefined && (() => {
              const [gate1, gate2] = selectedChannel;
              const start = GATE_POSITIONS[gate1];
              const end = GATE_POSITIONS[gate2];
              if (!start || !end) return null;
              return <line className="hd-live__channel-preview" x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
            })()}

            {definedChannels.map(([gate1, gate2]) => {
              const start = GATE_POSITIONS[gate1];
              const end = GATE_POSITIONS[gate2];
              const key = sortedChannelKey(gate1, gate2);
              const isSelected = selectedChannelKey === key;
              if (!start || !end) return null;
              return (
                <g key={key} data-channel={key}>
                  <line className={`hd-live__channel-defined${isSelected ? ' is-selected' : ''}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
                  <line
                    className="hd-live__channel-hit"
                    x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    tabIndex={0}
                    role="button"
                    aria-label={`${copy.channelsTitle} ${gate1}-${gate2}`}
                    aria-pressed={isSelected}
                    onClick={() => { setSelectedGate(null); setSelection({ kind: 'channel', gates: [gate1, gate2] }); }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedGate(null);
                        setSelection({ kind: 'channel', gates: [gate1, gate2] });
                      }
                    }}
                  >
                    <title>{`${copy.channelsTitle} ${gate1}-${gate2}`}</title>
                  </line>
                </g>
              );
            })}

            {HD_CENTER_IDS.map((id) => {
              const center = HD_CENTER_POSITIONS[id];
              const isDefined = definedCenters.has(id);
              const isSelected = selectedCenter === id;
              const gates = [...activatedGates].filter((gate) => HD_GATE_TO_CENTER[gate] === id);
              return (
                <g
                  key={id}
                  className={`hd-live__center${isDefined ? ' is-defined' : ''}${isSelected ? ' is-selected' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${copy.centers[id].label}，${isDefined ? copy.stateDefined : copy.stateUndefined}`}
                  aria-pressed={isSelected}
                  onClick={() => { setSelectedGate(null); setSelection({ kind: 'center', id }); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedGate(null);
                      setSelection({ kind: 'center', id });
                    }
                  }}
                >
                  <rect className="hd-live__center-hit" x={center.x - 56} y={center.y - 56} width="112" height="112" rx="16" />
                  <path d={centerShape(id)} style={{ '--hd-center-color': CENTER_COLORS[id] } as CSSProperties} />
                  <text className="hd-live__center-name" x={center.x} y={center.y - 2} textAnchor="middle">{copy.centers[id].label}</text>
                  <text className="hd-live__center-count" x={center.x} y={center.y + 19} textAnchor="middle">
                    {showStructure
                      ? (gates.length ? `${gates.length} ${isZh ? '個閘門' : copy.gateLabel}` : (isZh ? '開放' : copy.stateUndefined))
                      : (isDefined ? (isZh ? '穩定' : copy.stateDefined) : (isZh ? '開放' : copy.stateUndefined))}
                  </text>
                </g>
              );
            })}

            {[...visibleGates].map((gate) => {
              const position = GATE_POSITIONS[gate];
              if (!position) return null;
              const highlighted = selectedGate === gate;
              return (
                <g key={gate} className={`hd-live__gate${highlighted ? ' is-selected' : ''}`}>
                  <circle cx={position.x} cy={position.y} r={highlighted ? 15 : showStructure ? 10 : 13} />
                  <text x={position.x} y={position.y + (showStructure ? 3 : 4)} textAnchor="middle">{gate}</text>
                </g>
              );
            })}
          </svg>

          <div className="hd-live__legend" aria-label={isZh ? '圖例' : copy.frameNote}>
            <span><i className="is-defined" />{isZh ? '完整通道' : copy.legendOn}</span>
            <span><i className="is-center" />{isZh ? '填色中心＝穩定運作' : copy.stateDefined}</span>
            {showStructure && <span><i className="is-gate" />{isZh ? '圓點＝啟動閘門' : copy.gateLabel}</span>}
          </div>
        </div>
        {showStructure && (
          <ActivationColumn
            title={isZh ? '人格面' : 'Personality'}
            hint={isZh ? '你較容易意識到的自己' : 'What you consciously recognise'}
            tone="personality"
            rows={personalityRows}
            selectedGate={selectedGate}
            onSelect={selectGate}
          />
        )}
      </div>

      <div className="hd-live__readout" aria-live="polite">
        {selectedCenter && (() => {
          const center = copy.centers[selectedCenter];
          const isDefined = definedCenters.has(selectedCenter);
          const gates = [...activatedGates].filter((gate) => HD_GATE_TO_CENTER[gate] === selectedCenter);
          return (
            <>
              <div className="hd-live__readout-label">
                <span>{isDefined ? copy.stateDefined : copy.stateUndefined}</span>
                <h3>{center.label}</h3>
                <p>{copy.bodyPartLabel}：{center.bodyPart}</p>
              </div>
              <div className="hd-live__readout-copy">
                <p>{center.meaning}</p>
                <strong>{copy.dailyLabel}</strong>
                <p>{isDefined ? center.definedTip : center.undefinedTip}</p>
              </div>
              <div className="hd-live__readout-gates">
                <span>{isZh ? '此中心啟動' : copy.gateLabel}</span>
                <strong>{gates.length ? gates.join(' · ') : '—'}</strong>
              </div>
            </>
          );
        })()}
        {selectedChannel && (() => {
          const [gate1, gate2] = selectedChannel;
          const circuit = HD_CHANNEL_CIRCUITS[sortedChannelKey(gate1, gate2)];
          const circuitLabel = circuit === 'individual' ? copy.circuitIndividual : circuit === 'tribal' ? copy.circuitTribal : copy.circuitCollective;
          return (
            <>
              <div className="hd-live__readout-label">
                <span>{isZh ? (selectedChannelDefined ? '已開啟通道' : '未開啟通道') : copy.channelsTitle}</span>
                <h3>{isZh && selectedChannelGuide ? selectedChannelGuide.name : channelDetail?.name ?? fillTemplate(copy.channelGenericName, { gate1, gate2 })}</h3>
                <p>{copy.circuitLabel}：{circuitLabel}</p>
              </div>
              <div className="hd-live__readout-copy">
                <p>{isZh && selectedChannelGuide ? selectedChannelGuide.purpose : channelDetail?.trait ?? fillTemplate(copy.channelGenericTrait, { gate1, gate2 })}</p>
                <strong>{isZh ? (selectedChannelDefined ? '已開啟時' : '未開啟時') : copy.dailyLabel}</strong>
                <p>{isZh && selectedChannelGuide
                  ? (selectedChannelDefined ? selectedChannelGuide.defined : selectedChannelGuide.undefined)
                  : channelDetail?.daily ?? copy.channelGenericDaily}</p>
              </div>
              <div className="hd-live__readout-gates">
                <span>{isZh ? '連接閘門' : copy.gateLabel}</span>
                <strong>{gate1} ↔ {gate2}</strong>
              </div>
            </>
          );
        })()}
      </div>

      {isZh && (
        <ChannelDirectory
          definedChannelKeys={definedChannelKeys}
          selectedChannelKey={selectedChannelKey}
          filter={channelFilter}
          onFilter={setChannelFilter}
          onSelect={(gates) => { setSelectedGate(null); setSelection({ kind: 'channel', gates }); }}
        />
      )}

      <div className="hd-live__activation-disclosure">
        <button
          type="button"
          aria-expanded={showActivations}
          aria-controls="hd-live-activation-details"
          onClick={() => setShowActivations((current) => !current)}
        >
          <span>{isZh ? '設計面與人格面' : 'Design & Personality'}</span>
          <strong>{showActivations ? (isZh ? '收起星體明細' : copy.closeLabel) : (isZh ? '需要時再查看 26 筆星體明細' : copy.frameNote)}</strong>
          <i aria-hidden="true">{showActivations ? '−' : '+'}</i>
        </button>
        {showActivations && (
          <div id="hd-live-activation-details" className="hd-live__activation-grid">
            <ActivationColumn
              title={isZh ? '設計面' : 'Design'}
              hint={isZh ? '身體自然會做出的反應' : 'Your unconscious body pattern'}
              tone="design"
              rows={designRows}
              selectedGate={selectedGate}
              onSelect={selectGate}
            />
            <ActivationColumn
              title={isZh ? '人格面' : 'Personality'}
              hint={isZh ? '你較容易意識到的自己' : 'What you consciously recognise'}
              tone="personality"
              rows={personalityRows}
              selectedGate={selectedGate}
              onSelect={selectGate}
            />
          </div>
        )}
      </div>
    </section>
  );
}
