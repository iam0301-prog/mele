# Mele 客服 SOP

> 第一封投訴信進來時，知道在 30 分鐘內怎麼回。
> 文件位置：`docs/CUSTOMER_SUPPORT_SOP.md`
> 配套：[PAYMENT_REFUND_DISPUTE_SOP.md](PAYMENT_REFUND_DISPUTE_SOP.md)

最後更新：2026-05-23

---

## 📮 客服管道

| 管道 | 地址 / URL | 用途 | SLA |
|---|---|---|---|
| **客服信箱（主要）** | `support@mele.tw`（待設定） | 一般詢問、投訴 | 工作日 24h 內首次回覆 |
| **個資 / 隱私** | `privacy@mele.tw`（待設定） | GDPR / 個資法請求 | 30 天內回應 |
| **法務 / 著作權** | `legal@mele.tw`（待設定） | DMCA / 商標 | 14 天內回應 |
| **LINE 官方** | TBD | 即時諮詢、預約問題 | 工作時間 4h 內 |
| **工單系統** | Supabase `support_threads` table | 內部派工 | 同上 |

**工作時間**：週一至週五 10:00-18:00（台北時間 UTC+8）
**非工作時間**：自動回覆 + 下個工作日處理；緊急金流 / 安全事件 24/7 待命

---

## ⏱ 回應時效 SLA

| 案件類型 | 首次回覆 | 解決時效 | 升級條件 |
|---|---|---|---|
| 🔴 緊急（金流爭議、帳戶被盜、人身安全） | **2h 內** | 24h 內 | 立刻 |
| 🟠 高（付款失敗、預約衝突、技術故障） | **4h 內**（工作時間） | 24-48h | 8h 未解 |
| 🟡 中（一般使用問題、UI bug 回報） | **24h 內**（工作日） | 5 工作日 | 48h 未解 |
| 🟢 低（建議、感謝信、好奇問題） | **3 工作日內** | 視情況 | — |

---

## 📋 客服流程（5 步驟）

### Step 1：分流（Triage）
- 讀訊息，判斷類型（緊急 / 高 / 中 / 低）
- 在 `support_threads` 建立工單，分類 `category`：`payment` / `booking` / `account` / `teacher` / `technical` / `feedback`
- 系統會自動把 `category=payment` 升級為 `priority=high`（見 0004 migration）

### Step 2：模板回覆（首次回應）
- 24h 內**至少**用模板回覆一次，告知「已收到、預計處理時間、目前狀態」
- 即使還沒解決，讓對方知道有人看到了
- 模板見下方

### Step 3：調查與處理
- 查 Supabase `bookings` / `payments` / `chart_records` 等資料
- 若需要對方提供更多資訊，列出**具體**要的：訂單號、截圖、時間
- 若涉及老師，同時聯繫老師釐清

### Step 4：解決或升級
- 能解決就直接處理：退款、補單、改資料、修 bug
- 不能立刻解決：升級給 admin / 法務 / 技術
- **務必更新工單狀態**：`status = open / in_progress / resolved / escalated`

### Step 5：結案與紀錄
- 寫結案訊息：說明處理方式、補償（若有）、後續預防措施
- 工單留底 7 年（法定保留期）
- 重複問題進入 FAQ 或 PRD 改善池

---

## ✉️ 模板回覆（複製即用）

### 模板 A：首次回覆（通用）
```
Hi {customer_name}，

我們已收到你的訊息，正在查看處理中。
案件編號：#{ticket_id}
預計回覆時間：{deadline}

如果你需要補充資料，可以回覆這封信。

Mele 客服團隊
```

### 模板 B：退款處理中
```
Hi {customer_name}，

關於預約 #{booking_id}（{teacher_name} · {scheduled_at}）的退款：

✓ 已確認你的退款資格
✓ 退款金額：NT$ {refund_amount}
✓ 退款方式：原路退回（ECPay）
✓ 預計到帳時間：3-5 個工作日

若超過 5 工作日仍未收到，請回覆告知。

Mele 客服團隊
```

### 模板 C：老師未出席補償
```
Hi {customer_name}，

我們很抱歉聽到 {teacher_name} 未出席你的預約 #{booking_id}。
我們已對該老師啟動內部處分程序。

針對你的補償：
✓ 全額退款 NT$ {amount}
✓ 補償點數 200 點（已存入你的帳號）
✓ 若願意，我們可以協助媒合其他老師（不額外收費）

Mele 客服團隊
```

### 模板 D：技術問題（請對方補充資料）
```
Hi {customer_name}，

謝謝你回報這個問題。為了快速處理，可以請你提供：

1. 發生時的螢幕截圖或錯誤訊息
2. 使用裝置（iPhone / Android / 桌機）
3. 瀏覽器（Safari / Chrome / Edge）
4. 大概發生時間

我們會在收到資料後 24h 內回覆解決方式。

Mele 客服團隊
```

### 模板 E：拒絕退款（過時點）
```
Hi {customer_name}，

關於預約 #{booking_id} 的退款請求：

依服務條款規定，諮詢已開始（{actual_start_time}）後不予退款。

但我們理解你的處境，可以提供：
✓ 一張 {compensation_amount} 點補償點數
✓ 與該老師重新安排補單（需老師同意）

如有其他疑問請回覆告知。

Mele 客服團隊
```

### 模板 F：個資刪除請求確認
```
Hi {customer_name}，

我們已收到你的資料刪除請求。處理流程：

1. 7 天等待期：避免誤刪。如你改變心意可在這期間回覆撤回。
2. 7 天後：刪除 profile、chart_records、bookings 的個人識別資料。
3. 法定保留：付款、稅務紀錄依法保留 5 年（去識別化）。

預計完成日：{deletion_date}

如有疑問請聯絡 privacy@mele.tw。
```

---

## 🚨 升級流程

| 案件 | 升級對象 | 觸發條件 |
|---|---|---|
| 退款 > NT$ 5,000 | Admin | 自動 |
| 老師違規（性騷擾 / 詐騙嫌疑） | Admin + 法務 | 立刻 |
| 帳戶被盜疑慮 | 技術 + Admin | 2h 內處理 |
| 個資外洩疑慮 | Admin + 法務 + DPO | 立刻、24h 內通報主管機關 |
| 媒體曝光 / 公關危機 | Admin + 創辦人 | 立刻 |

---

## 📊 客服指標追蹤

每月檢視：

- 工單總量、各 category 分布
- 平均首次回覆時間 / 解決時間
- NPS / CSAT 抽樣
- Top 5 重複問題（進 FAQ 或 PRD）

---

## 🔗 相關文件

- [PAYMENT_REFUND_DISPUTE_SOP.md](PAYMENT_REFUND_DISPUTE_SOP.md) — 退款 SOP
- [LEGAL_COMPLIANCE_SOP.md](LEGAL_COMPLIANCE_SOP.md) — 法務 SOP
- [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) — 上線檢查清單
