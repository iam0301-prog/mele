# 命理媒介中心 — AR / Mobile API 規格

版本：1.0.0
基礎 URL：`http://localhost:8000`（本機）／部署後改成你的網域

OpenAPI 文件：[http://localhost:8000/docs](http://localhost:8000/docs)（Swagger UI）

---

## 統一回應外殼

所有 8 個排盤端點都回傳同一個 JSON 結構：

```json
{
  "tool": "bazi",
  "version": "1.0.0",
  "computed_at": "2026-04-27T07:42:00.123Z",
  "input": { "year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0 },
  "data": {
    /* 原始結構化資料 — AR / 二次運算用 */
  },
  "render": {
    "svg": "<svg>...</svg>",       /* 已含 CSS 動畫 keyframes，AR 也可解析 */
    "html": null,                  /* 部分工具會給完整 HTML 卡片 */
    "palette": ["#C9A227", ...],   /* 主色系，AR 用來建材質 */
    "animations": [                /* 動畫時間軸 — AR 可重現 */
      { "target": "main_circle", "type": "fadeIn", "duration": 0.8, "delay": 0 }
    ],
    "speech": "你的生命靈數是 3，表達者……"  /* TTS 朗讀稿 */
  }
}
```

**AR 應用建議流程：**
1. 收集使用者生辰 → POST 到對應 `/api/v1/calc/{tool}`
2. 取 `data` 自行用 3D 引擎渲染（Three.js / RealityKit / ARCore）
3. 取 `render.palette` 設定材質 / 顏色
4. 取 `render.speech` 給 TTS 旁白
5. 取 `render.animations` 重現節奏

---

## 8 個端點

### 1. 靈數 `POST /api/v1/calc/numerology`

**Request：**
```json
{ "year": 1990, "month": 5, "day": 15 }
```

**Response.data：**
```json
{
  "lifePath": 3, "birthDay": 6,
  "isMaster": false, "isBirthDayMaster": false,
  "breakdown": { "yearReduced": 1, "monthReduced": 5, "dayReduced": 6, "total": 12 },
  "lifePathArchetype": { "name": "表達者", "desc": "創意、溝通、樂觀..." },
  "birthDayArchetype": { "name": "照護者", "desc": "..." }
}
```

### 2. 瑪雅 `POST /api/v1/calc/maya`

**Request：** `{ "year": 1990, "month": 5, "day": 15, "include_leap_day": false }`

**Response.data：** kin (1-260) + seal + tone + 5 kin 神諭板（self/analog/antipode/occult/guide）

### 3. 八字 `POST /api/v1/calc/bazi`

**Request：**
```json
{ "year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0, "sect": 2, "longitude": 121.5 }
```

**Response.data：**
```json
{
  "pillars": { "year": ["庚","午"], "month": ["辛","巳"], "day": ["乙","未"], "time": ["壬","午"] },
  "dayMaster": "乙", "dayMasterYinYang": "陰", "dayMasterWuxing": "木",
  "wuxing": { "counts": { "木":2, "火":3, "土":2, "金":1, "水":0 } },
  "nayin": { "year": "路旁土", ... },
  "shishen": { "year": "正官", "month": "七殺", "time": "正印" },
  "lunarDate": { "year": 1990, "month": 4, "day": 21, "isLeapMonth": false }
}
```

### 4. 紫微 `POST /api/v1/calc/ziwei`

**Request：** `{ "year": 1990, "month": 5, "day": 15, "hour": 12, "gender": "男" }`

**Response.data：** 12 宮位（含名稱、地支、是否命/身宮）+ 五行局 + 農曆 + 年干支

### 5. 塔羅 `POST /api/v1/calc/tarot`

**Request：**
```json
{ "count": 3, "reversed_enabled": true, "spread": "past-present-future", "seed": null, "question": "..." }
```

**Response.data：** 78 牌中抽出的 cards 陣列，每張含 card 全資訊 + position (upright/reversed) + drawIndex

### 6. 盧恩 `POST /api/v1/calc/runes`

**Request：** `{ "count": 3, "reversed_enabled": true }`

### 7. 西洋占星 `POST /api/v1/calc/astro`

**Request：**
```json
{
  "year": 1990, "month": 5, "day": 15, "hour": 12, "minute": 0,
  "timezone": 8.0, "latitude": 25.0330, "longitude": 121.5654,
  "house_system": "P"
}
```

**Response.data：** 10 行星（黃經、星座、宮位、是否逆行）+ 12 宮位 + Asc + MC

### 8. 人類圖 `POST /api/v1/calc/humandesign`

**Request：** 同 astro 但無 location

**Response.data：**
```json
{
  "type": "Generator",
  "strategy": "等待回應",
  "authority": "Sacral",
  "profile": "3/5",
  "definedCenters": ["Sacral", "G", "Throat"],
  "undefinedCenters": ["Head", ...],
  "definedChannels": [[1, 8], ...],
  "personalityBodies": { "sun": {...}, "moon": {...}, ... },
  "designBodies": { "sun": {...}, ... },
  "activatedGates": [1, 8, 13, ...]
}
```

---

## 錯誤格式

```json
HTTP 400
{ "detail": { "error": "Invalid date: 1990-13-45", "type": "ValueError" } }
```

---

## 認證（後續加）

目前 API 是公開的（任何 client 都可呼叫）。後續加上：
- 註冊用戶 API key（rate limit）
- AR / Mobile app 用 OAuth2 + JWT bearer token
- Webhook signing for callbacks

---

## CORS

預設 `*`（允許所有來源）。部署時建議鎖到你的網域：
```python
allow_origins=["https://你的網域.com", "https://app.你的網域.com"]
```

---

## 速率限制（建議）

未做。建議部署時加 `slowapi` 或前面架 Cloudflare：
- 匿名：10 次/分鐘
- 登入用戶：60 次/分鐘
- AR 客戶端：300 次/分鐘

---

## 範例呼叫

### Python
```python
import requests
r = requests.post("http://localhost:8000/api/v1/calc/bazi", json={
    "year": 1990, "month": 5, "day": 15,
    "hour": 12, "minute": 0
})
result = r.json()
print(result["data"]["pillars"])
print(result["render"]["speech"])
```

### Swift (iOS / RealityKit)
```swift
struct CalcResponse: Codable {
    let tool: String
    let data: BaziData
    let render: RenderBundle
}

let req = URLRequest(url: URL(string: "https://api.mele.com/api/v1/calc/bazi")!)
// ... POST with JSON body
let result = try JSONDecoder().decode(CalcResponse.self, from: data)
// 在 ARView 用 result.render.palette 建材質
```

### Unity / C# (AR)
```csharp
var response = await UnityWebRequest.Post("api/v1/calc/humandesign", json);
var hd = JsonUtility.FromJson<HDResponse>(response.text);
// 用 hd.data.definedCenters 在 AR 空間中放發光球體
```
