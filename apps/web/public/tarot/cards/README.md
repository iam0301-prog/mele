正式塔羅插畫資產放置規則

網站會依照塔羅風格與牌 ID 自動優先載入正式插畫。

第一套優先上線：

- `/tarot/cards/ocean_poseidon/{id}.webp`

後續擴充路徑：

- `/tarot/cards/forest_athena/{id}.webp`
- `/tarot/cards/ancient_pharaoh/{id}.webp`

牌 ID 來自 `python_api/data/tarot.json`，範圍為 `0` 到 `77`。

建議規格：

- 比例：直式 2:3
- 尺寸：至少 1024x1536
- 格式：WebP 優先，PNG/JPG 可作後備
- 圖面不要放牌名、數字、Logo 或浮水印，網站會自行疊加牌名與正逆位資訊。

產圖 prompt 清單在：

- `python_api/data/tarot_art_prompts.json`

缺少正式插畫時，網站會 fallback 到程式化 SVG 牌面，避免結果頁破圖。
