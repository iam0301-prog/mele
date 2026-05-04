'use client';

export function ToolLoading({ label = '正在整理解讀...' }: { label?: string }) {
  return (
    <div className="tool-loading-ritual mele-card mt-6" aria-live="polite">
      <div className="tool-loading-ritual__portrait" aria-hidden="true">
        <span className="tool-loading-ritual__halo" />
        <span className="tool-loading-ritual__face">
          <i className="tool-loading-ritual__eye tool-loading-ritual__eye--left" />
          <i className="tool-loading-ritual__eye tool-loading-ritual__eye--right" />
          <b className="tool-loading-ritual__smile" />
          <em className="tool-loading-ritual__spark tool-loading-ritual__spark--one" />
          <em className="tool-loading-ritual__spark tool-loading-ritual__spark--two" />
        </span>
      </div>
      <div className="tool-loading-ritual__copy">
        <span>READING IN PROGRESS</span>
        <strong>{label}</strong>
        <p>你的問題已送進解盤流程，正在把盤面、符號與下一步提醒整理成可以帶走的訊息。</p>
      </div>
      <div className="tool-loading-ritual__steps" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function ToolError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-reverse bg-reverse/[0.05] p-8 mt-6 text-center text-rose-300">
      <div className="text-2xl mb-2">計算失敗</div>
      <div className="text-sm">{message}</div>
      <div className="text-xs mt-3 text-white/50">
        請稍後再試，或確認 API 服務是否已啟動。
      </div>
    </div>
  );
}
