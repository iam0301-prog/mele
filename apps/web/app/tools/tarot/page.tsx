'use client';

import { useState } from 'react';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

const SPREADS = [
  { value: 'three_card', label: '三張牌：過去 / 現在 / 未來', count: 3 },
  { value: 'celtic', label: '塞爾特十字：完整局勢與深層阻力', count: 10 },
  { value: 'horseshoe', label: '馬蹄牌陣：事件走向與建議', count: 7 },
  { value: 'single', label: '單張牌：今日提醒', count: 1 },
];

const TAROT_STYLES = [
  {
    value: 'forest_athena',
    label: '森林雅典娜',
    desc: '橄欖金、深林綠與智慧女神意象，適合事業、學習與內在判斷。',
  },
  {
    value: 'ocean_poseidon',
    label: '大海波賽頓',
    desc: '海藍、銀白與浪潮神殿意象，適合情緒、關係與潛意識訊息。',
  },
  {
    value: 'ancient_pharaoh',
    label: '古老法老風',
    desc: '金砂、青金石與古埃及神殿意象，適合命運課題、權力與靈魂契約。',
  },
] as const;

type TarotStyle = (typeof TAROT_STYLES)[number]['value'];

export default function TarotPage() {
  const toast = useToast();
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState('three_card');
  const [tarotStyle, setTarotStyle] = useState<TarotStyle>('ocean_poseidon');
  const [reversed, setReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) {
      toast('請先輸入這次想詢問的問題。', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedSpread = SPREADS.find((item) => item.value === spread)!;
      const response = await calc('tarot', {
        count: selectedSpread.count,
        reversed,
        spread: selectedSpread.value,
        question: question.trim(),
        tarot_style: tarotStyle,
      });
      setResult(response);
    } catch (err) {
      const message = err instanceof CalcError ? err.message : (err as Error).message;
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="塔羅牌解讀"
      subtitle="三種藝術風格與 AR 牌面"
      description="輸入清楚的問題，選擇你喜歡的牌組風格與牌陣。結果會呈現牌義、位置、正逆位與 AR 卡面資訊。"
      spec="塔羅"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <div className="mb-5">
          <label className="mele-label">這次想問什麼？ *</label>
          <textarea
            rows={3}
            required
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="例：我接下來三個月在工作上應該注意什麼？"
            className="mele-input"
          />
          <p className="text-xs text-white/50 mt-2">
            問題越具體，解讀越容易聚焦。建議一次只問一個主題。
          </p>
        </div>

        <div className="mb-5">
          <label className="mele-label">牌組風格</label>
          <div className="tarot-style-grid">
            {TAROT_STYLES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTarotStyle(item.value)}
                className={tarotStyle === item.value ? 'is-active' : ''}
              >
                <span className={`tarot-style-preview tarot-style-preview--${item.value}`} aria-hidden="true">
                  <i />
                </span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mele-label">牌陣</label>
          <select value={spread} onChange={(event) => setSpread(event.target.value)} className="mele-input">
            {SPREADS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={reversed} onChange={(event) => setReversed(event.target.checked)} />
          使用逆位
        </label>

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '正在抽牌...' : '開始抽牌'}
        </button>
      </form>

      {loading && <ToolLoading label="正在洗牌並整理牌面訊息..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <div className="mele-card mt-6">
            <div className="text-accent text-xs tracking-widest mb-2">本次問題</div>
            <div className="text-white/85 italic">「{question}」</div>
          </div>
          <ToolResultSection kind="tarot" result={result} />
          <ConsultCTA spec="塔羅" label="塔羅" />
        </>
      )}
    </ToolShell>
  );
}
