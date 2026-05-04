# PWA Icons

需要產出以下尺寸（建議用同一個 1024x1024 主視覺檔縮放）：

- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png (maskable)
- icon-384.png
- icon-512.png (maskable)

## 自動產生工具
```bash
# 用 sharp 一次生成（裝 npm i -g sharp-cli）
sharp -i source.png -o icon-72.png resize 72 72
# ... 各尺寸
```

或上傳到 https://realfavicongenerator.net/ 一次下載全套。

## 設計建議
- 主色：#0D1B2A 深藍底
- 點綴：#C9A227 金色八角星 / 太極 / 紫微星圖騰
- maskable 版本要留 10% safe area
