'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MayaTotemGlyph, getMayaTotemBySeal } from '@/components/MayaTotemGlyph';
import type { CalcResponse, CalcTool } from '@/lib/api';

export type ReadingArKind = CalcTool;

type TarotStyle = 'forest_athena' | 'ocean_poseidon' | 'ancient_pharaoh';
type RuneMaterial = 'stone' | 'wood' | 'crystal';

type AssetMeta = {
  title: string;
  label: string;
  className: string;
  note: string;
  fallbackGlyph: string;
};

type TarotCardData = {
  id?: string | number;
  name_zh?: string;
  name_en?: string;
  number?: string | number;
  arcana?: string;
  keywords?: string[];
  upright?: { keywords?: string[]; text?: string };
  reversed?: { keywords?: string[]; text?: string };
};

type TarotDraw = {
  card?: TarotCardData;
  position?: string;
  meaning?: string;
  keywords?: string[];
  spread_position?: string;
  slot?: string;
  drawIndex?: string | number;
};

type RuneData = {
  glyph?: string;
  name?: string;
  zh?: string;
  keywords?: string[];
  upright?: { keywords?: string[]; text?: string };
  reversed?: { keywords?: string[]; text?: string };
};

type RuneDraw = {
  rune?: RuneData;
  position?: string;
  meaning?: string;
  keywords?: string[];
};

type VisualDiagramGuideItem = {
  title: string;
  body: string;
};

type VisualDiagramGuideContent = {
  intro: string;
  note: string;
  items: VisualDiagramGuideItem[];
};

const TAROT_STYLE_META: Record<TarotStyle, { label: string; short: string }> = {
  forest_athena: { label: '森林雅典娜', short: '森林神殿' },
  ocean_poseidon: { label: '大海波賽頓', short: '海洋神殿' },
  ancient_pharaoh: { label: '古老法老風', short: '法老神殿' },
};

const RUNE_MATERIAL_META: Record<RuneMaterial, { label: string; short: string }> = {
  stone: { label: '石面', short: '石刻盧恩' },
  wood: { label: '木頭', short: '木紋盧恩' },
  crystal: { label: '水晶', short: '水晶盧恩' },
};

const SUMMARY_LABELS: Record<string, string> = {
  lifePath: '生命靈數',
  birthDay: '生日數',
  lifePathArchetype: '生命原型',
  kin: 'Kin',
  label: '本命印記',
  tone: '調性',
  seal: '圖騰',
  dayMaster: '日主',
  dayMasterWuxing: '日主五行',
  dayMasterYinYang: '日主陰陽',
  fiveElementsClass: '五行局',
  mingGong: '命宮',
  shenGong: '身宮',
  sun: '太陽',
  moon: '月亮',
  ascendant: '上升',
  midheaven: '天頂',
  type: '類型',
  authority: '內在權威',
  profile: '人生角色',
  strategy: '策略',
};

const SUMMARY_VALUE_LABELS: Record<string, string> = {
  Manifestor: '顯示者',
  Generator: '生產者',
  'Manifesting Generator': '顯示生產者',
  Projector: '投射者',
  Reflector: '反映者',
  Emotional: '情緒權威',
  Sacral: '薦骨權威',
  Splenic: '直覺權威',
  'Ego (Heart)': '意志力權威',
  'Self-Projected': '自我投射權威',
  Lunar: '月亮權威',
  'Mental (Outer)': '環境權威',
  'To Inform': '告知後行動',
  'To Respond': '等待回應',
  'To Wait for the Invitation': '等待邀請',
  'To Wait a Lunar Cycle': '等待月亮週期',
};

const ASSETS: Record<ReadingArKind, AssetMeta> = {
  numerology: {
    title: '生命靈數視覺盤',
    label: '數字原型',
    className: 'plate',
    note: '用穩定的 2D 盤面整理生命靈數重點，讓數字、原型與行動方向可以一眼看懂。',
    fallbackGlyph: 'NUM',
  },
  maya: {
    title: '馬雅 Kin 視覺盤',
    label: 'Kin 能量',
    className: 'plate',
    note: '把 Kin、調性、圖騰與神諭關係整理成可讀的能量盤，先看清楚，再決定是否深入解讀。',
    fallbackGlyph: 'KIN',
  },
  bazi: {
    title: '八字四柱視覺盤',
    label: '四柱五行',
    className: 'plate',
    note: '用四柱與五行分布呈現命盤底色，避免只看到文字清單卻不知道主軸。',
    fallbackGlyph: '八字',
  },
  ziwei: {
    title: '紫微斗數視覺命盤',
    label: '十二宮導讀',
    className: 'plate',
    note: '紫微先看命宮、身宮與五行局，再依問題看對應宮位；目前以清楚 2D 導讀取代未完成 3D。',
    fallbackGlyph: '紫微',
  },
  tarot: {
    title: '塔羅牌面視覺展示',
    label: '牌面訊息',
    className: 'tarot',
    note: '第一套海洋正式插畫牌組優先上線，用卡面、正逆位與關鍵詞呈現抽牌結果，不再只是一張文字牌。',
    fallbackGlyph: 'TAROT',
  },
  runes: {
    title: '盧恩材質視覺展示',
    label: '符文石面',
    className: 'runes',
    note: '以石面、木頭與水晶三種材質呈現盧恩符號，讓每日抽石有更明確的儀式感。',
    fallbackGlyph: 'RUNE',
  },
  astro: {
    title: '西洋占星視覺盤',
    label: '星盤摘要',
    className: 'plate',
    note: '用太陽、月亮、上升與天頂整理占星主軸，讓初次使用者先抓到自己的星盤入口。',
    fallbackGlyph: 'ASTRO',
  },
  humandesign: {
    title: '人類圖 2D BodyGraph',
    label: 'BodyGraph',
    className: 'humandesign',
    note: '人類圖暫停 3D/AR 模型展示，先用精修 2D BodyGraph 保留可讀性與正式感。',
    fallbackGlyph: 'HD',
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function text(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function formatSummaryValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (['string', 'number', 'boolean'].includes(typeof value)) {
    const raw = String(value);
    return SUMMARY_VALUE_LABELS[raw] ?? raw;
  }
  if (Array.isArray(value)) {
    const joined = value.slice(0, 6).map(formatSummaryValue).filter(Boolean).join(' / ');
    return joined || null;
  }
  const obj = asRecord(value);
  return text(obj.label) || text(obj.zh) || text(obj.name) || text(obj.name_zh) || null;
}

function getTarotStyle(result?: CalcResponse | null): TarotStyle {
  const value = result?.input?.tarot_style;
  return value === 'ocean_poseidon' || value === 'ancient_pharaoh' || value === 'forest_athena'
    ? value
    : 'ocean_poseidon';
}

function getRuneMaterial(result?: CalcResponse | null): RuneMaterial {
  const value = result?.input?.material;
  return value === 'wood' || value === 'crystal' || value === 'stone' ? value : 'stone';
}

function getTarotDraw(result?: CalcResponse | null): TarotDraw | null {
  return getTarotDraws(result)[0] ?? null;
}

function getTarotDraws(result?: CalcResponse | null): TarotDraw[] {
  return asArray<TarotDraw>(result?.data.cards);
}

function getRuneDraw(result?: CalcResponse | null): RuneDraw | null {
  return asArray<RuneDraw>(result?.data.runes)[0] ?? null;
}

function positionLabel(position?: string) {
  return position === 'reversed' ? '逆位' : '正位';
}

function drawSlotLabel(draw: TarotDraw | null, index?: number) {
  return text(draw?.spread_position) || text(draw?.slot) || (typeof index === 'number' ? `第 ${index + 1} 張` : '');
}

function isRuneDraw(draw: TarotDraw | RuneDraw): draw is RuneDraw {
  return 'rune' in draw;
}

function selectedMeaning(draw: TarotDraw | RuneDraw | null) {
  if (!draw) return null;
  if (draw.meaning) return draw.meaning;
  const isReversed = draw.position === 'reversed';
  if (isRuneDraw(draw)) return isReversed ? draw.rune?.reversed?.text : draw.rune?.upright?.text;
  return isReversed ? draw.card?.reversed?.text : draw.card?.upright?.text;
}

function keywordsFrom(draw: TarotDraw | RuneDraw | null) {
  if (!draw) return [];
  if (draw.keywords?.length) return draw.keywords;
  const isReversed = draw.position === 'reversed';
  if (isRuneDraw(draw)) return draw.rune?.keywords ?? (isReversed ? draw.rune?.reversed?.keywords : draw.rune?.upright?.keywords) ?? [];
  return draw.card?.keywords ?? (isReversed ? draw.card?.reversed?.keywords : draw.card?.upright?.keywords) ?? [];
}

const TAROT_RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'] as const;

const TAROT_PIP_COUNT: Record<string, number> = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Page: 3,
  Knight: 4,
  Queen: 5,
  King: 6,
};

const TAROT_PIP_POSITIONS = [
  { left: 50, top: 15 },
  { left: 50, top: 78 },
  { left: 50, top: 46 },
  { left: 28, top: 26 },
  { left: 72, top: 26 },
  { left: 28, top: 66 },
  { left: 72, top: 66 },
  { left: 28, top: 46 },
  { left: 72, top: 46 },
  { left: 50, top: 93 },
];

function tarotArcana(card?: TarotCardData): string {
  const arcana = text(card?.arcana);
  if (['wands', 'cups', 'swords', 'pentacles'].includes(arcana)) return arcana;
  return 'major';
}

function tarotRank(card?: TarotCardData): string {
  const name = text(card?.name_en);
  return TAROT_RANKS.find((rank) => name === rank || name.startsWith(`${rank} `)) ?? 'major';
}

function tarotIllustrationPath(style: TarotStyle, card?: TarotCardData): string | null {
  const cardId = text(card?.id) || text(card?.number);
  return cardId ? `/tarot/cards/${style}/${cardId}.webp` : null;
}

function getGenericSummary(kind: ReadingArKind, result?: CalcResponse | null) {
  const data = result?.data ?? {};
  const keysByKind: Record<ReadingArKind, string[]> = {
    numerology: ['lifePath', 'birthDay', 'lifePathArchetype'],
    maya: ['kin', 'label', 'tone', 'seal'],
    bazi: ['dayMaster', 'dayMasterWuxing', 'dayMasterYinYang'],
    ziwei: ['mingGong', 'shenGong', 'fiveElementsClass'],
    tarot: [],
    runes: [],
    astro: ['sun', 'moon', 'ascendant', 'midheaven'],
    humandesign: ['type', 'authority', 'profile', 'strategy'],
  };
  return keysByKind[kind]
    .map((key) => ({ label: SUMMARY_LABELS[key] ?? key, value: formatSummaryValue(data[key]) }))
    .filter((item): item is { label: string; value: string } => Boolean(item.value));
}

function getVisualDiagramGuide(kind: ReadingArKind, result?: CalcResponse | null): VisualDiagramGuideContent {
  const summary = getGenericSummary(kind, result);
  const firstSummary = summary[0] ? `${summary[0].label}：${summary[0].value}` : '盤面中央會放本次最重要的識別訊號。';
  const guides: Partial<Record<ReadingArKind, VisualDiagramGuideContent>> = {
    bazi: {
      intro: '八字先看日主，再看五行強弱與四柱分工。這張圖不是要你判斷吉凶，而是幫你抓命盤的運作主軸。',
      note: '如果只想先懂一件事：中間的日主是「我」，外圈四柱是不同人生場景，五行比例是能量分布。',
      items: [
        { title: '中間主題', body: `${firstSummary}。八字先看日主，因為日主代表你如何消化壓力、做決定與展現自己。` },
        { title: '外圈結構', body: '外圈把年、月、日、時四柱整理成時間層次：年看早期與外界，月看環境，日看自己與關係，時看後續發展。' },
        { title: '線條代表', body: '線條代表五行之間的流動與拉扯。線越集中，表示那一組元素越值得先觀察。' },
      ],
    },
    maya: {
      intro: '馬雅盤先把 Kin、調性與圖騰放在一起看。不要先背名詞，先理解它描述的是你的節奏、天賦與支持力量。',
      note: '先看中間的 Kin，再看外圈神諭關係；它們像是同一個主題的不同支援角色。',
      items: [
        { title: '中間主題', body: `${firstSummary}。中間是你的主要 Kin 或圖騰，代表這次解讀的核心身份。` },
        { title: '外圈結構', body: '外圈用來放調性、圖騰與神諭角色，像是把主要能量周圍的支持與挑戰排出來。' },
        { title: '線條代表', body: '線條代表不同角色之間的關係，不是好壞，而是提醒你哪裡可以互相補位。' },
      ],
    },
    numerology: {
      intro: '靈數盤把生命路徑、生日數與原型整理成一張地圖。先看哪個數字最像你，再看今天可以練習什麼。',
      note: '數字不是限制，而是幫你命名一種常見的思考與行動方式。',
      items: [
        { title: '中間主題', body: `${firstSummary}。中間放最主要的生命數字，先用它抓你的基本節奏。` },
        { title: '外圈結構', body: '外圈整理其他輔助數字與原型，幫你看見不同面向如何支援主軸。' },
        { title: '線條代表', body: '線條代表數字之間的連動，提醒你哪些特質容易一起出現。' },
      ],
    },
    ziwei: {
      intro: '紫微盤先看命宮、身宮與主要星曜。十二宮很多，不需要一次看完，先從你真正想問的主題切入。',
      note: '看感情就找夫妻宮，看工作就找官祿宮，看金錢就找財帛宮。',
      items: [
        { title: '中間主題', body: `${firstSummary}。中間代表這張盤的主軸，先抓命宮或五行局。` },
        { title: '外圈結構', body: '外圈代表十二宮，像十二個生活領域；每一宮都回答不同類型的問題。' },
        { title: '線條代表', body: '線條代表宮位之間的互動，提示你某個議題可能牽動哪些生活面向。' },
      ],
    },
    astro: {
      intro: '星盤先看太陽、月亮、上升與天頂。它們分別像自我、情緒、外在表現與人生方向。',
      note: '新手先不用看所有行星；四個入口已經能理解多數日常感受。',
      items: [
        { title: '中間主題', body: `${firstSummary}。中間放這次星盤摘要的主要入口。` },
        { title: '外圈結構', body: '外圈代表星座、宮位或人生領域，幫你看某顆星的能量落在哪裡。' },
        { title: '線條代表', body: '線條代表行星或主題之間的互動，像是性格內部的合作與拉扯。' },
      ],
    },
  };

  return guides[kind] ?? {
    intro: '這張視覺盤用來把文字結果整理成圖像入口。先看中間主題，再看外圈分類，最後看線條提示的連動。',
    note: '圖面是導覽，不是考試；看不懂時先回到右側摘要即可。',
    items: [
      { title: '中間主題', body: firstSummary },
      { title: '外圈結構', body: '外圈把不同面向分區，讓你知道這份解讀正在看哪些生活領域。' },
      { title: '線條代表', body: '線條代表各面向之間的關係，幫你找出最值得先理解的連動。' },
    ],
  };
}

function TarotArt({ style, card }: { style: TarotStyle; card?: TarotCardData }) {
  const arcana = tarotArcana(card);
  const rank = tarotRank(card);
  const pipCount = arcana === 'major' ? 0 : TAROT_PIP_COUNT[rank] ?? 3;
  const illustrationPath = tarotIllustrationPath(style, card);
  return (
    <div className={`reading-ar__card-art reading-ar__card-art--${style} card-art--${arcana} card-art--rank-${rank.toLowerCase()}`} aria-hidden="true">
      {illustrationPath && (
        <Image
          className="card-art__illustration"
          src={illustrationPath}
          alt=""
          fill
          sizes="132px"
          unoptimized
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
      <span className="card-art__mini-frame" />
      <span className="card-art__halo" />
      <span className="card-art__scene" />
      <span className="card-art__primary" />
      <span className="card-art__secondary" />
      <span className="card-art__ground" />
      <span className="card-art__stars" />
      {pipCount > 0 && (
        <span className="card-art__pips">
          {Array.from({ length: pipCount }).map((_, index) => {
            const pos = TAROT_PIP_POSITIONS[index] ?? TAROT_PIP_POSITIONS[2];
            return <span key={index} className="card-art__pip" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />;
          })}
        </span>
      )}
      <span className={`card-art__sigil card-art__sigil--${style}`} />
      <span className="card-art__caption" />
    </div>
  );
}

function TarotPreview({ draw, style, activeIndex }: { draw: TarotDraw | null; style: TarotStyle; activeIndex?: number }) {
  const card = draw?.card;
  const name = card?.name_zh || card?.name_en || '塔羅牌';
  const meta = [drawSlotLabel(draw, activeIndex), positionLabel(draw?.position), TAROT_STYLE_META[style].label].filter(Boolean).join(' / ');
  return (
    <div className={`reading-ar__sculpture reading-ar__sculpture--tarot reading-ar__sculpture--${style}`} aria-label={`${name} 牌面視覺展示`}>
      <div className="sculpture-card__thickness" />
      <div className="sculpture-card__face">
        <span className="sculpture-card__number">{card?.number ?? 'I'}</span>
        <TarotArt style={style} card={card} />
        <strong>{name}</strong>
        <small>{meta}</small>
      </div>
      <span className="sculpture-shadow" />
    </div>
  );
}

function RunePreview({ result }: { result?: CalcResponse | null }) {
  const material = getRuneMaterial(result);
  const draw = getRuneDraw(result);
  const rune = draw?.rune;
  return (
    <div className={`reading-ar__sculpture reading-ar__sculpture--rune reading-ar__sculpture--${material}`} aria-label="盧恩材質視覺展示">
      <span className="sculpture-rune__rim" />
      <span className="sculpture-rune__bevel" />
      <span className="sculpture-rune__edge sculpture-rune__edge--top" />
      <span className="sculpture-rune__edge sculpture-rune__edge--bottom" />
      <span className="sculpture-rune__grain sculpture-rune__grain--one" />
      <span className="sculpture-rune__grain sculpture-rune__grain--two" />
      <span className="sculpture-rune__grain sculpture-rune__grain--three" />
      <span className="sculpture-rune__crack sculpture-rune__crack--one" />
      <span className="sculpture-rune__crack sculpture-rune__crack--two" />
      <span className="sculpture-rune__inlay sculpture-rune__inlay--one" />
      <span className="sculpture-rune__inlay sculpture-rune__inlay--two" />
      <strong>{rune?.glyph || 'ᚱ'}</strong>
      <small>{RUNE_MATERIAL_META[material].label} / {positionLabel(draw?.position)}</small>
      <span className="sculpture-shadow" />
    </div>
  );
}

function PlatePreview({ kind, result, asset }: { kind: ReadingArKind; result?: CalcResponse | null; asset: AssetMeta }) {
  const summary = getGenericSummary(kind, result);
  const glyph = summary[0]?.value || asset.fallbackGlyph;
  const mayaTotem = kind === 'maya' ? getMayaTotemBySeal(result?.data.seal) : null;
  return (
    <div className={`reading-ar__sculpture reading-ar__sculpture--plate reading-ar__sculpture--${kind}`} aria-label={`${asset.title}視覺展示`}>
      <span className="sculpture-plate__thickness" />
      <span className="sculpture-plate__rim sculpture-plate__rim--outer" />
      <span className="sculpture-plate__rim sculpture-plate__rim--middle" />
      <span className="sculpture-plate__rim sculpture-plate__rim--inner" />
      <span className="sculpture-plate__axis sculpture-plate__axis--x" />
      <span className="sculpture-plate__axis sculpture-plate__axis--y" />
      <span className="sculpture-plate__nodes" />
      <span className="sculpture-plate__constellation" />
      <span className="sculpture-plate__seal" />
      <span className="sculpture-plate__ticks" />
      {mayaTotem ? (
        <span className="sculpture-plate__maya-totem">
          <MayaTotemGlyph totem={mayaTotem} size="stage" showLabel={false} active />
          <b>{glyph}</b>
        </span>
      ) : (
        <strong>{glyph}</strong>
      )}
      <small>{asset.label}</small>
      <span className="sculpture-shadow" />
    </div>
  );
}

function HumanDesignPlanarPreview({ result }: { result?: CalcResponse | null }) {
  const svg = result?.render?.svg;
  const summary = getGenericSummary('humandesign', result);

  return (
    <div className="reading-ar__hd-planar" aria-label="人類圖 2D BodyGraph 視覺展示">
      <div className="reading-ar__hd-planar-frame">
        {svg ? (
          <div className="reading-ar__hd-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="reading-ar__hd-placeholder">
            <span>BODYGRAPH</span>
            <strong>2D</strong>
          </div>
        )}
      </div>
      <div className="reading-ar__hd-planar-copy">
        <span>精修 2D 展示</span>
        <strong>先把能量結構看清楚</strong>
        <p>人類圖目前不展示未成熟 3D 模型，改用可讀的 BodyGraph 盤面呈現中心、通道與啟動閘門。</p>
        {summary.length > 0 && (
          <dl>
            {summary.slice(0, 4).map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

function VisualPreview({
  kind,
  result,
  asset,
  tarotDraw,
  tarotStyle,
  activeTarotIndex,
}: {
  kind: ReadingArKind;
  result?: CalcResponse | null;
  asset: AssetMeta;
  tarotDraw?: TarotDraw | null;
  tarotStyle?: TarotStyle;
  activeTarotIndex?: number;
}) {
  if (kind === 'humandesign') return <HumanDesignPlanarPreview result={result} />;
  if (kind === 'tarot') return <TarotPreview draw={tarotDraw ?? getTarotDraw(result)} style={tarotStyle ?? getTarotStyle(result)} activeIndex={activeTarotIndex} />;
  if (kind === 'runes') return <RunePreview result={result} />;
  return <PlatePreview kind={kind} result={result} asset={asset} />;
}

function ReadingDetails({
  kind,
  result,
  asset,
  tarotDraw,
  tarotStyle,
  activeTarotIndex,
}: {
  kind: ReadingArKind;
  result?: CalcResponse | null;
  asset: AssetMeta;
  tarotDraw?: TarotDraw | null;
  tarotStyle?: TarotStyle;
  activeTarotIndex?: number;
}) {
  if (kind === 'tarot') {
    const draw = tarotDraw ?? getTarotDraw(result);
    const card = draw?.card;
    const style = tarotStyle ?? getTarotStyle(result);
    const name = card?.name_zh || card?.name_en || '塔羅牌';
    const keywords = keywordsFrom(draw);
    const slot = drawSlotLabel(draw, activeTarotIndex);
    return (
      <div className="reading-ar__details">
        <span>{slot || TAROT_STYLE_META[style].label}</span>
        <h3>{name} / {positionLabel(draw?.position)}</h3>
        {keywords.length > 0 && <p>{keywords.slice(0, 4).join(' / ')}</p>}
        {selectedMeaning(draw) && <p>{selectedMeaning(draw)}</p>}
      </div>
    );
  }

  if (kind === 'runes') {
    const draw = getRuneDraw(result);
    const rune = draw?.rune;
    const material = getRuneMaterial(result);
    const name = rune?.zh || rune?.name || '盧恩符文';
    const keywords = keywordsFrom(draw);
    return (
      <div className="reading-ar__details">
        <span>{RUNE_MATERIAL_META[material].label}</span>
        <h3>{name} / {positionLabel(draw?.position)}</h3>
        {keywords.length > 0 && <p>{keywords.slice(0, 4).join(' / ')}</p>}
        {selectedMeaning(draw) && <p>{selectedMeaning(draw)}</p>}
      </div>
    );
  }

  const summary = getGenericSummary(kind, result);
  return (
    <div className="reading-ar__details">
      <span>{asset.label}</span>
      <h3>{asset.title}</h3>
      {summary.length > 0 ? summary.map((item) => <p key={item.label}>{item.label}：{item.value}</p>) : <p>這裡會整理本次結果的核心訊息。</p>}
    </div>
  );
}

function VisualDiagramGuide({ kind, result }: { kind: ReadingArKind; result?: CalcResponse | null }) {
  if (kind === 'tarot' || kind === 'runes' || kind === 'humandesign') return null;
  const guide = getVisualDiagramGuide(kind, result);

  return (
    <section className="reading-ar__diagram-guide" aria-label="圖面導覽">
      <div className="reading-ar__diagram-guide-header">
        <span>圖面導覽</span>
        <h3>這張圖要先看哪裡？</h3>
        <p>{guide.intro}</p>
      </div>
      <div className="reading-ar__diagram-guide-grid">
        {guide.items.map((item) => (
          <article key={item.title} className="reading-ar__diagram-guide-card">
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <p className="reading-ar__diagram-guide-note">{guide.note}</p>
    </section>
  );
}

export function ReadingArStage({ kind, result }: { kind: ReadingArKind; result?: CalcResponse | null }) {
  const asset = ASSETS[kind];
  const tarotStyle = getTarotStyle(result);
  const tarotDraws = kind === 'tarot' ? getTarotDraws(result) : [];
  const tarotSignature = tarotDraws
    .map((draw, index) => `${text(draw.card?.id) || text(draw.card?.name_en) || text(draw.card?.name_zh) || index}:${draw.position}`)
    .join('|');
  const [activeTarotIndex, setActiveTarotIndex] = useState(0);
  const visibleTarotIndex = tarotDraws[activeTarotIndex] ? activeTarotIndex : 0;
  const activeTarotDraw = tarotDraws[visibleTarotIndex] ?? null;
  const canSwitchTarot = kind === 'tarot' && tarotDraws.length > 1;

  useEffect(() => {
    setActiveTarotIndex(0);
  }, [kind, tarotSignature]);

  const goToTarot = (nextIndex: number) => {
    if (!tarotDraws.length) return;
    setActiveTarotIndex((nextIndex + tarotDraws.length) % tarotDraws.length);
  };

  return (
    <section id="reading-ar-stage" className={`reading-ar reading-ar--${asset.className} reading-ar--${kind}`}>
      <div className="reading-ar__copy">
        <span>VISUAL RESULT STAGE</span>
        <h2>{asset.title}</h2>
        <p>{asset.note}</p>
        <em className="reading-ar__viewer-state reading-ar__viewer-state--fallback">使用精修 2D 結果展示</em>
      </div>

      <div className="reading-ar__stage">
        <div className="reading-ar__visual-column">
          <div className="reading-ar__model-zone">
            <div className="reading-ar__model-fallback" aria-label="精修 2D 視覺展示">
              <VisualPreview kind={kind} result={result} asset={asset} tarotDraw={activeTarotDraw} tarotStyle={tarotStyle} activeTarotIndex={visibleTarotIndex} />
            </div>
          </div>

          {canSwitchTarot && (
            <div className="reading-ar__carousel" aria-label="切換塔羅牌">
              <div className="reading-ar__carousel-main">
                <button type="button" className="reading-ar__carousel-button" onClick={() => goToTarot(visibleTarotIndex - 1)}>
                  上一張
                </button>
                <span className="reading-ar__carousel-count">{visibleTarotIndex + 1} / {tarotDraws.length}</span>
                <button type="button" className="reading-ar__carousel-button" onClick={() => goToTarot(visibleTarotIndex + 1)}>
                  下一張
                </button>
              </div>
              <div className="reading-ar__carousel-dots" aria-label="牌面索引">
                {tarotDraws.map((draw, index) => (
                  <button
                    key={`${text(draw.card?.id) || text(draw.card?.name_en) || text(draw.card?.name_zh) || 'tarot'}-${index}`}
                    type="button"
                    className={`reading-ar__carousel-dot${index === visibleTarotIndex ? ' is-active' : ''}`}
                    aria-label={`切換到第 ${index + 1} 張`}
                    aria-pressed={index === visibleTarotIndex}
                    onClick={() => goToTarot(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <ReadingDetails kind={kind} result={result} asset={asset} tarotDraw={activeTarotDraw} tarotStyle={tarotStyle} activeTarotIndex={visibleTarotIndex} />
        <VisualDiagramGuide kind={kind} result={result} />
      </div>

      <div className="reading-ar__actions" aria-label="AR 狀態說明">
        <span className="reading-ar__model-link reading-ar__model-link--disabled">AR / 3D 正式版準備中</span>
        <p>我先停用目前品質不夠好的 3D 模型，避免讓使用者看到未完成品。正式 AR 會等卡牌、石面與盤面模型達到可發布水準後再開放。</p>
      </div>

      <div className="reading-ar__support reading-ar__support--limited">
        <strong>目前採用穩定 2D 體驗</strong>
        <p>手機與桌面都能直接觀看，不需要額外啟動 AR。這一版先確保清楚、精緻、可測試。</p>
      </div>
    </section>
  );
}
