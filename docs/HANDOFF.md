# Mele 對話交接手冊

> 開新對話時直接複製本文件「📋 一鍵交接」整段貼給 Claude，他就接得上。
>
> 維護規則：每完成一個里程碑，更新本檔的「已完成」與「下一步」兩段，commit。

最後更新：2026-06-09（bazi 完成、tarot 待重寫）

---

## 📋 一鍵交接（複製以下整段給新對話）

```
接續 Mele L3 推進。

【現況】
- 工作目錄：D:\mele
- 分支：codex/full-teacher-reading-workbench
- 最新 commit：見 git log，最近一次 P1 文案 commit 為 1dd6c32
- 已推到 origin（github.com/iam0301-prog/mele）
- 整體進度：L1 通過、卡在 L2 入口（P0 全是只有人類能做的外部服務串接）

【已完成的 P1 工具文案】
- python_api/data/copy/numerology.yaml（594 行，完整）
- python_api/data/copy/maya.yaml（515 行，完整）
- python_api/data/copy/bazi.yaml（548 行，10 天干 + 12 地支 + 五行平衡完整）
- python_api/data/copy/tarot.yaml（7 行空殼，需重寫）

【已完成的法務 / SOP】
- docs/LAUNCH_CHECKLIST.md
- docs/CUSTOMER_SUPPORT_SOP.md
- docs/TEACHER_CONTRACT_TEMPLATE.md

【請依序做，每完成一份就 commit 一次】
1. ~~補 bazi.yaml 的 12 地支 + 五行平衡章節~~ ✅ 已完成 (eb890e3)
2. 重寫 tarot.yaml（22 大牌 voice），接 explain_tarot
3. runes.yaml（24 符文 × 正逆位），接 explain_runes
4. astro.yaml（太陽/月亮/上升 × 12 + 行星宮位），接 explain_astro
5. ziwei.yaml（14 主星 + 命宮 + 大運），接 explain_ziwei
6. human_design.yaml（64 閘門 + 9 中心 + 5 類型 + 4 內在權威），接 explain_human_design

【voice 風格】
參考 numerology.yaml 和 maya.yaml 的既有調性——scholar / friend / master
三段語氣，每段約 80-150 字，繁中為主，避免說教感。

【規則】
- 每寫完一份 YAML + engine 接線就立即 git commit，避免長對話被截斷
- 工具新文案放 python_api/data/copy/ 對應檔
- engine 接線改 python_api/engines/explanations.py
- 完成一個工具就同步更新 docs/LAUNCH_CHECKLIST.md 的勾選狀態
- 完成後同步更新 docs/HANDOFF.md（本檔）的「已完成」與「下一步」段
```

---

## 🎯 整體階段

| 等級 | 狀態 | 卡點 |
|---|---|---|
| L1 自用 | ✅ 通過 | — |
| **L2 封測** | ⏳ 卡關 | P0 七件外部服務串接（只有你能做） |
| L3 公開 | ⏳ 推進中 | 工具文案 3/8、Sentry 真實 SDK、律師審法務 |
| L4 商業營運 | — | 還早 |

詳細打勾清單見 [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)。

---

## 👤 只有你能做的（卡 L2 / L3 的真正阻塞）

1. ECPay 沙箱跑完整流程
2. Supabase 正式 project 開 + migration 上去 + pg_cron 排程
3. DNS + domain + HTTPS
4. LINE / Google OAuth callback 重設到 prod
5. GitHub Secrets 填齊
6. 找律師審 4 份法務文件
7. 找 2 位真實老師 + 5 位真實使用者測試
8. 客服信箱 + email SPF/DKIM/DMARC

---

## 🤖 Claude 可以繼續做的（P1）

### 工具文案 voice YAML
- [x] numerology — 完整 ✅
- [x] maya — 完整 ✅
- [x] bazi — 完整（10 天干 + 12 地支 + 五行平衡）✅
- [ ] tarot — 7 行空殼需重寫
- [ ] runes — 未建檔
- [ ] astro — 未建檔
- [ ] ziwei — 未建檔
- [ ] human_design — 未建檔

### 其他可代勞項目
- [ ] 7 個工具的老師後台 Voice tab UI 接線（馬雅 master voice 已寫好，只欠 UI）
- [ ] 真實安裝 `@sentry/nextjs` 並把 `lib/observability.ts` 的 stub 換成真 SDK
- [ ] OG image × 6 語系（要設計檔輸入）

---

## 💡 對話操作小貼士

**開新對話的時機**
- 單次回應或工具呼叫開始被截斷 → 該換了
- 完成一個大里程碑（commit + push 後）→ 順手換
- 一條會話累積超過 ~50 輪互動 → 預防性換

**換對話前的 checklist**
1. 把當前進度 commit 並 push
2. 更新 `docs/HANDOFF.md`（本檔）的「已完成 / 下一步」段並 commit
3. 確認 `git status` 乾淨
4. 開新對話、貼上面那段交接 prompt

**極簡版交接**（懶得貼長的也行）
```
接續分支 codex/full-teacher-reading-workbench。
請讀 docs/HANDOFF.md，從待辦清單接著做。每完成一份就 commit。
```
