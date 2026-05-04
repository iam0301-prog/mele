import Image from 'next/image';

type MayaColor = 'red' | 'white' | 'blue' | 'yellow';

export type MayaTotemSlug =
  | 'red-dragon'
  | 'white-wind'
  | 'blue-night'
  | 'yellow-seed'
  | 'red-serpent'
  | 'white-worldbridger'
  | 'blue-hand'
  | 'yellow-star'
  | 'red-moon'
  | 'white-dog'
  | 'blue-monkey'
  | 'yellow-human'
  | 'red-skywalker'
  | 'white-wizard'
  | 'blue-eagle'
  | 'yellow-warrior'
  | 'red-earth'
  | 'white-mirror'
  | 'blue-storm'
  | 'yellow-sun';

export type MayaTotem = {
  idx: number;
  slug: MayaTotemSlug;
  zh: string;
  en: string;
  color: MayaColor;
  keywords: string[];
  summary: string;
  assetPath: string;
};

type MayaOracleEntry = {
  kin?: number;
  seal?: unknown;
  tone?: {
    zh?: string;
    en?: string;
  };
};

type MayaOracleBoardResult = {
  data?: {
    kin?: number;
    seal?: unknown;
    tone?: {
      zh?: string;
      en?: string;
    };
    oracle?: Record<string, MayaOracleEntry | undefined>;
    starroot?: {
      classicTzolkin?: { label?: string };
      haab?: { label?: string };
      longCount?: { starrootLabel?: string; label?: string };
      thirteenMoon?: { label?: string };
    };
  };
};

const assetPath = (slug: MayaTotemSlug) => `/maya/totems/${slug}.png`;

export const MAYA_TOTEMS: MayaTotem[] = [
  { idx: 1, slug: 'red-dragon', zh: '紅龍', en: 'Red Dragon', color: 'red', keywords: ['誕生', '滋養', '原初信任'], summary: '紅龍像生命的第一口氣，提醒你先照顧根基，再讓新的事物出生。', assetPath: assetPath('red-dragon') },
  { idx: 2, slug: 'white-wind', zh: '白風', en: 'White Wind', color: 'white', keywords: ['訊息', '呼吸', '真誠表達'], summary: '白風帶來清楚的語言與流動，適合把心裡真正想說的話說出來。', assetPath: assetPath('white-wind') },
  { idx: 3, slug: 'blue-night', zh: '藍夜', en: 'Blue Night', color: 'blue', keywords: ['夢境', '豐盛', '內在想像'], summary: '藍夜像一扇通往潛意識的門，邀請你相信夢與直覺提供的答案。', assetPath: assetPath('blue-night') },
  { idx: 4, slug: 'yellow-seed', zh: '黃種子', en: 'Yellow Seed', color: 'yellow', keywords: ['萌芽', '目標', '耐心成長'], summary: '黃種子提醒你選定方向，把能量放進真正值得培養的地方。', assetPath: assetPath('yellow-seed') },
  { idx: 5, slug: 'red-serpent', zh: '紅蛇', en: 'Red Serpent', color: 'red', keywords: ['本能', '生命力', '身體智慧'], summary: '紅蛇連結身體的警覺與慾望，讓你回到最直接的生命感。', assetPath: assetPath('red-serpent') },
  { idx: 6, slug: 'white-worldbridger', zh: '白世界橋', en: 'White Worldbridger', color: 'white', keywords: ['橋接', '放下', '轉換階段'], summary: '白世界橋幫你跨過舊局，透過放下讓新的關係與可能性進來。', assetPath: assetPath('white-worldbridger') },
  { idx: 7, slug: 'blue-hand', zh: '藍手', en: 'Blue Hand', color: 'blue', keywords: ['療癒', '實作', '完成'], summary: '藍手把理解落到行動，今天適合親手修補、整理、完成一件事。', assetPath: assetPath('blue-hand') },
  { idx: 8, slug: 'yellow-star', zh: '黃星星', en: 'Yellow Star', color: 'yellow', keywords: ['美感', '和諧', '優雅展現'], summary: '黃星星讓混亂回到秩序，也提醒你用更美、更精準的方式呈現自己。', assetPath: assetPath('yellow-star') },
  { idx: 9, slug: 'red-moon', zh: '紅月', en: 'Red Moon', color: 'red', keywords: ['淨化', '情緒流', '敏銳感受'], summary: '紅月像潮汐一樣清洗情緒，讓你看見心中真正需要被照顧的地方。', assetPath: assetPath('red-moon') },
  { idx: 10, slug: 'white-dog', zh: '白狗', en: 'White Dog', color: 'white', keywords: ['愛', '忠誠', '心的選擇'], summary: '白狗把焦點帶回關係與心意，問你是否願意忠於真正珍惜的人事物。', assetPath: assetPath('white-dog') },
  { idx: 11, slug: 'blue-monkey', zh: '藍猴', en: 'Blue Monkey', color: 'blue', keywords: ['遊戲', '魔法', '靈活創造'], summary: '藍猴提醒你別把生命想得太硬，玩心有時比控制更能打開局面。', assetPath: assetPath('blue-monkey') },
  { idx: 12, slug: 'yellow-human', zh: '黃人', en: 'Yellow Human', color: 'yellow', keywords: ['自由意志', '智慧', '選擇'], summary: '黃人把力量交回你的選擇，今天的關鍵是清醒地決定你要成為誰。', assetPath: assetPath('yellow-human') },
  { idx: 13, slug: 'red-skywalker', zh: '紅天行者', en: 'Red Skywalker', color: 'red', keywords: ['探索', '勇氣', '拓展邊界'], summary: '紅天行者邀請你走出熟悉範圍，去看更大的世界與更高的視角。', assetPath: assetPath('red-skywalker') },
  { idx: 14, slug: 'white-wizard', zh: '白巫師', en: 'White Wizard', color: 'white', keywords: ['臨在', '感受力', '內在魔法'], summary: '白巫師不是用力控制，而是在安定臨在中讓影響力自然發生。', assetPath: assetPath('white-wizard') },
  { idx: 15, slug: 'blue-eagle', zh: '藍鷹', en: 'Blue Eagle', color: 'blue', keywords: ['視野', '洞察', '創造藍圖'], summary: '藍鷹升高視角，幫你不被細節困住，看見整體局勢與下一步。', assetPath: assetPath('blue-eagle') },
  { idx: 16, slug: 'yellow-warrior', zh: '黃戰士', en: 'Yellow Warrior', color: 'yellow', keywords: ['提問', '勇敢', '智慧行動'], summary: '黃戰士以問題開路，適合誠實面對疑惑，並用智慧採取行動。', assetPath: assetPath('yellow-warrior') },
  { idx: 17, slug: 'red-earth', zh: '紅地球', en: 'Red Earth', color: 'red', keywords: ['同步', '導航', '身在此地'], summary: '紅地球讓你校準節奏，留意巧合、環境訊號與身體的方向感。', assetPath: assetPath('red-earth') },
  { idx: 18, slug: 'white-mirror', zh: '白鏡', en: 'White Mirror', color: 'white', keywords: ['映照', '真相', '界線'], summary: '白鏡照出事物原貌，也提醒你用清楚界線保護內在的清明。', assetPath: assetPath('white-mirror') },
  { idx: 19, slug: 'blue-storm', zh: '藍風暴', en: 'Blue Storm', color: 'blue', keywords: ['轉化', '更新', '能量重整'], summary: '藍風暴帶來強烈轉換，讓停滯的能量被翻動、清理、重新啟動。', assetPath: assetPath('blue-storm') },
  { idx: 20, slug: 'yellow-sun', zh: '黃太陽', en: 'Yellow Sun', color: 'yellow', keywords: ['照亮', '生命力', '完整'], summary: '黃太陽把光帶回中心，提醒你用坦然與溫暖照亮自己和周圍。', assetPath: assetPath('yellow-sun') },
];

const COLOR_CLASS: Record<MayaColor, string> = {
  red: 'maya-totem--red',
  white: 'maya-totem--white',
  blue: 'maya-totem--blue',
  yellow: 'maya-totem--yellow',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalize(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_'-]/g, '');
}

export function getMayaTotemBySeal(seal: unknown): MayaTotem | null {
  if (typeof seal === 'number') {
    return MAYA_TOTEMS.find((totem) => totem.idx === seal) ?? null;
  }

  const candidates: unknown[] = [seal];
  if (isRecord(seal)) {
    candidates.push(seal.idx, seal.sealNum, seal.zh, seal.en, seal.label, seal.name, seal.slug);
  }

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    if (!normalized) continue;

    const direct = MAYA_TOTEMS.find((totem) => (
      normalize(totem.idx) === normalized
      || normalize(totem.zh) === normalized
      || normalize(totem.en) === normalized
      || normalize(totem.slug) === normalized
    ));
    if (direct) return direct;

    const included = MAYA_TOTEMS.find((totem) => (
      normalized.includes(normalize(totem.zh))
      || normalized.includes(normalize(totem.en))
      || normalized.includes(normalize(totem.slug))
    ));
    if (included) return included;
  }

  return null;
}

export function MayaTotemGlyph({
  seal,
  totem,
  size = 'md',
  showLabel = true,
  className = '',
  active = false,
  priority = false,
}: {
  seal?: unknown;
  totem?: MayaTotem | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'stage';
  showLabel?: boolean;
  className?: string;
  active?: boolean;
  priority?: boolean;
}) {
  const resolved = totem ?? getMayaTotemBySeal(seal) ?? MAYA_TOTEMS[0];
  const classes = [
    'maya-totem',
    `maya-totem--${size}`,
    COLOR_CLASS[resolved.color],
    active ? 'is-active' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} aria-label={`${resolved.zh}圖騰`}>
      <span className="maya-totem__frame">
        <Image
          className="maya-totem__image"
          src={resolved.assetPath}
          alt=""
          width={512}
          height={512}
          sizes="(max-width: 720px) 72px, 122px"
          loading={priority ? undefined : 'lazy'}
          priority={priority}
          draggable={false}
        />
      </span>
      {showLabel && (
        <span className="maya-totem__label">
          <strong>{resolved.zh}</strong>
          <small>{resolved.keywords.join(' / ')}</small>
        </span>
      )}
    </span>
  );
}

export function MayaTotemGallery({ activeSeal }: { activeSeal?: unknown }) {
  const activeTotem = getMayaTotemBySeal(activeSeal) ?? null;
  const featured = activeTotem ?? MAYA_TOTEMS[0];

  return (
    <section className="maya-totem-gallery" aria-label="馬雅二十圖騰索引">
      <div className="maya-totem-gallery__header">
        <span>MAYA TOTEMS</span>
        <h2>二十個圖騰，各自有自己的氣質</h2>
        <p>每個圖騰都用獨立 PNG 卡面呈現，不再只是符號或文字；你可以先看自己的本命圖騰，再觀察神諭板裡其他力量如何互相牽動。</p>
      </div>

      <div className="maya-totem-gallery__featured">
        <MayaTotemGlyph totem={featured} size="lg" active />
        <div>
          <span>{activeTotem ? '你的本命圖騰' : '圖騰預覽'}</span>
          <h3>{featured.zh}</h3>
          <p>{featured.summary}</p>
          <div className="maya-totem-gallery__keywords">
            {featured.keywords.map((keyword) => <em key={keyword}>{keyword}</em>)}
          </div>
        </div>
      </div>

      <div className="maya-totem-gallery__grid">
        {MAYA_TOTEMS.map((item) => {
          const isActive = activeTotem?.idx === item.idx;
          return (
            <article key={item.slug} className={`maya-totem-gallery__item${isActive ? ' is-active' : ''}`}>
              <MayaTotemGlyph totem={item} size="sm" showLabel={false} active={isActive} />
              <div>
                <span>{String(item.idx).padStart(2, '0')}</span>
                <strong>{item.zh}</strong>
                <small>{item.keywords.slice(0, 2).join(' / ')}</small>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OracleCell({
  role,
  entry,
  area,
  active = false,
}: {
  role: string;
  entry?: MayaOracleEntry;
  area: string;
  active?: boolean;
}) {
  const totem = getMayaTotemBySeal(entry?.seal);
  const toneLabel = entry?.tone?.zh;
  const totemName = totem?.zh ?? '圖騰';
  const title = [toneLabel, totemName].filter(Boolean).join(' ');
  return (
    <article className={`maya-oracle-board__cell maya-oracle-board__cell--${area}${active ? ' is-active' : ''}`}>
      <span className="maya-oracle-board__role">{role}</span>
      <MayaTotemGlyph totem={totem} size="sm" showLabel={false} active={active} priority />
      <strong>Kin {entry?.kin ?? '-'}</strong>
      <small className="maya-oracle-board__totem-name">{title}</small>
    </article>
  );
}

export function MayaOracleBoard({ result }: { result: MayaOracleBoardResult }) {
  const data = result.data ?? {};
  const oracle = data.oracle ?? {};
  const selfEntry: MayaOracleEntry = {
    kin: data.kin,
    seal: data.seal,
    tone: data.tone,
  };
  const selfTotem = getMayaTotemBySeal(data.seal);
  const starroot = data.starroot ?? {};
  const longCount = starroot.longCount?.starrootLabel ?? starroot.longCount?.label;

  return (
    <section className="maya-oracle-board" aria-label="馬雅圖騰神諭盤">
      <div className="maya-oracle-board__header">
        <span>MAYA ORACLE</span>
        <h2>馬雅圖騰神諭盤</h2>
        <p>用完整圖騰卡面看五股力量的關係：上方是指引，右側是支持，左側是挑戰，下方是隱藏推動力，中間是你的本命。</p>
      </div>

      <div className="maya-oracle-board__hero">
        <MayaTotemGlyph totem={selfTotem} size="stage" showLabel={false} active priority />
        <div>
          <span>本命圖騰</span>
          <strong>Kin {data.kin ?? '-'}</strong>
          <small>{data.tone?.zh} {selfTotem?.zh}</small>
        </div>
      </div>

      <div className="maya-oracle-board__grid">
        <OracleCell role="指引" area="guide" entry={oracle.guide} />
        <OracleCell role="挑戰" area="challenge" entry={oracle.antipode} />
        <OracleCell role="本命" area="self" entry={selfEntry} active />
        <OracleCell role="支持" area="support" entry={oracle.analog} />
        <OracleCell role="隱藏推動力" area="hidden" entry={oracle.occult} />
      </div>

      <dl className="maya-oracle-board__crosscheck">
        <div>
          <dt>Dreamspell</dt>
          <dd>Kin {data.kin ?? '-'} / {data.tone?.en} {selfTotem?.en}</dd>
        </div>
        <div>
          <dt>傳統 Tzolkin</dt>
          <dd>{starroot.classicTzolkin?.label ?? '-'}</dd>
        </div>
        <div>
          <dt>Haab</dt>
          <dd>{starroot.haab?.label ?? '-'}</dd>
        </div>
        <div>
          <dt>Long Count</dt>
          <dd>{longCount ?? '-'}</dd>
        </div>
        <div>
          <dt>13 Moon</dt>
          <dd>{starroot.thirteenMoon?.label ?? '-'}</dd>
        </div>
      </dl>
    </section>
  );
}
