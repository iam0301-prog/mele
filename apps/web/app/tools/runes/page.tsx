'use client';

import { useState } from 'react';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

const MATERIALS = [
  { value: 'stone', label: '石面', desc: '霧面石紋與刻痕符號，適合穩定、現實、身體與資源問題。' },
  { value: 'wood', label: '木頭', desc: '溫潤木紋與手工烙印，適合成長、關係、家庭與長期累積。' },
  { value: 'crystal', label: '水晶', desc: '透明折射與光紋流動，適合直覺、夢境、能量與內在訊息。' },
] as const;

const SPREADS = [
  { value: 'single', label: '單符文：今日指引', count: 1 },
  { value: 'three', label: '三符文：過去 / 現在 / 未來', count: 3 },
  { value: 'five', label: '五符文：核心、阻礙、資源、行動、結果', count: 5 },
];

type RuneMaterial = (typeof MATERIALS)[number]['value'];

export default function RunesPage() {
  const toast = useToast();
  const [question, setQuestion] = useState('');
  const [material, setMaterial] = useState<RuneMaterial>('stone');
  const [spread, setSpread] = useState('three');
  const [reversed, setReversed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast('請先輸入你想詢問的問題。', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedSpread = SPREADS.find((item) => item.value === spread)!;
      const response = await calc('runes', {
        count: selectedSpread.count,
        reversed,
        spread: selectedSpread.value,
        material,
        question: question.trim(),
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
      title="盧恩符文解讀"
      subtitle="三種材質與 AR 石面"
      description="盧恩適合詢問行動方向、阻礙、資源與內在訊息。選擇石面、木頭或水晶材質後，結果會以符文石與 AR 形式呈現。"
      spec="盧恩"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <div className="mb-5">
          <label className="mele-label">這次想問什麼？ *</label>
          <textarea
            rows={3}
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例：我現在面對這個選擇，最需要看見的提醒是什麼？"
            className="mele-input"
          />
          <p className="text-xs text-white/50 mt-2">
            盧恩適合看當下局勢與行動提醒，問題保持簡潔會更清楚。
          </p>
        </div>

        <div className="mb-5">
          <label className="mele-label">盧恩材質</label>
          <div className="rune-material-grid">
            {MATERIALS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setMaterial(item.value)}
                className={material === item.value ? 'is-active' : ''}
              >
                <span className={`rune-material-preview rune-material-preview--${item.value}`} aria-hidden="true">
                  <i />
                </span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mele-label">符文陣</label>
          <select value={spread} onChange={(e) => setSpread(e.target.value)} className="mele-input">
            {SPREADS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={reversed} onChange={(e) => setReversed(e.target.checked)} />
          啟用逆位
        </label>

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '正在抽取符文...' : '開始抽符文'}
        </button>
      </form>

      {loading && <ToolLoading label="正在抽取符文並整理訊息..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <div className="mele-card mt-6">
            <div className="text-accent text-xs tracking-widest mb-2">本次問題</div>
            <div className="text-white/85 italic">「{question}」</div>
          </div>
          <ToolResultSection kind="runes" result={result} />
          <ConsultCTA spec="盧恩" label="盧恩" />
        </>
      )}
    </ToolShell>
  );
}
