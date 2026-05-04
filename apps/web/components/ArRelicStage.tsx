'use client';

import { useMemo, useState } from 'react';

type RelicMode = 'human-design' | 'plate' | 'card' | 'stone';

const MODES: Array<{
  id: RelicMode;
  label: string;
  title: string;
  caption: string;
  action: string;
}> = [
  {
    id: 'human-design',
    label: '人類圖',
    title: '人類圖能量盤預覽',
    caption: '先用 2D BodyGraph 的語言呈現中心、通道與閘門，避免用不成熟 3D 模型讓人看不懂。',
    action: '到人類圖排盤',
  },
  {
    id: 'plate',
    label: '命盤',
    title: '命盤視覺盤預覽',
    caption: '紫微、八字與占星會先用清楚盤面、宮位與摘要引導使用者閱讀。',
    action: '到工具列表',
  },
  {
    id: 'card',
    label: '塔羅',
    title: '塔羅牌面預覽',
    caption: '塔羅保留牌面風格、牌名、正逆位與關鍵訊息，讓抽牌結果有儀式感。',
    action: '到塔羅抽牌',
  },
  {
    id: 'stone',
    label: '盧恩',
    title: '盧恩石面預覽',
    caption: '盧恩會以石面、木頭、水晶三種材質呈現，不再只有符號與文字。',
    action: '到盧恩抽石',
  },
];

function RelicPreview({ mode }: { mode: RelicMode }) {
  return (
    <div className={`ritual-relic ritual-relic--${mode}`} aria-label="精修 2D 視覺預覽">
      {mode === 'human-design' && (
        <>
          <div className="ritual-hd__plate" />
          {Array.from({ length: 9 }).map((_, index) => (
            <i key={index} className={`ritual-hd__center ritual-hd__center--${index + 1}`} />
          ))}
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} className={`ritual-hd__channel ritual-hd__channel--${index + 1}`} />
          ))}
        </>
      )}

      {mode === 'plate' && (
        <>
          <div className="ritual-plate__ring ritual-plate__ring--outer" />
          <div className="ritual-plate__ring ritual-plate__ring--middle" />
          <div className="ritual-plate__ring ritual-plate__ring--inner" />
          {Array.from({ length: 12 }).map((_, index) => (
            <i
              key={index}
              className="ritual-plate__mark"
              style={{ transform: `rotate(${index * 30}deg) translateY(-92px)` }}
            />
          ))}
          <span className="ritual-plate__core">命</span>
        </>
      )}

      {mode === 'card' && (
        <>
          <div className="ritual-card__frame" />
          <div className="ritual-card__sigil">XII</div>
          <div className="ritual-card__moon" />
          <div className="ritual-card__line ritual-card__line--top" />
          <div className="ritual-card__line ritual-card__line--bottom" />
        </>
      )}

      {mode === 'stone' && (
        <>
          <div className="ritual-stone__glyph">ᚱ</div>
          <div className="ritual-stone__grain ritual-stone__grain--one" />
          <div className="ritual-stone__grain ritual-stone__grain--two" />
        </>
      )}
    </div>
  );
}

function targetFor(mode: RelicMode) {
  if (mode === 'human-design') return '/tools/humandesign';
  if (mode === 'card') return '/tools/tarot';
  if (mode === 'stone') return '/tools/runes';
  return '/tools/ziwei';
}

export function ArRelicStage({ initialMode = 'human-design' }: { initialMode?: RelicMode }) {
  const [mode, setMode] = useState<RelicMode>(initialMode);
  const active = useMemo(() => MODES.find((item) => item.id === mode) ?? MODES[0], [mode]);

  return (
    <section className="ritual-stage" aria-label="視覺展示預覽">
      <div className="ritual-stage__toolbar" role="tablist" aria-label="視覺類型切換">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id)}
            className={mode === item.id ? 'is-active' : ''}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ritual-stage__scene">
        <RelicPreview mode={mode} />
      </div>

      <div className="ritual-stage__copy">
        <div className="ritual-stage__eyebrow">2D VISUAL READY</div>
        <h2>{active.title}</h2>
        <p>{active.caption}</p>
        <div className="ritual-stage__actions">
          <span className="mele-btn-secondary" aria-disabled="true">
            AR / 3D 正式版準備中
          </span>
          <a href={targetFor(mode)} className="mele-btn-primary">
            {active.action}
          </a>
        </div>
      </div>
    </section>
  );
}
