# 喵宇宙 MEOWVERSE 🐾

用自家貓咪照片製作的免費抽卡小遊戲，手機與電腦都能玩。

[立即試玩](https://cat-card-club-yuze-1025.cuddlybeech65.chatgpt.site/) · [GitHub Pages 發布網址](https://yuzetsai.github.io/catcard/)

## 玩法

- 完成餵食換水、清理貓砂、陪玩任務，每項每天領 1 張抽卡券。
- 玩魚乾記憶配對，完成 6 組配對可領 1 張券，每天最多 3 次。
- 每張券開一包，一包 3 張卡；有普通卡、稀有閃卡，以及未知的隱藏卡。
- 圖鑑只顯示抽到的卡，重複卡會累計張數。
- 每日任務依台灣時間更新；抽卡券與收藏儲存在各自瀏覽器。

遊戲完全在瀏覽器運行，沒有 AI API 呼叫，也沒有付費抽卡。清除瀏覽器資料會清除該瀏覽器的進度；不同網域、瀏覽器、裝置各自存檔。

## 本機試玩

需要 Python 3。在專案目錄執行：

```sh
python3 -m http.server 8000 --directory site
```

開啟 http://localhost:8000 。

## 更新與發布

遊戲原始檔在 `site/`，沒有套件安裝或建置步驟。

第一次發布，請在儲存庫 **Settings → Pages → Build and deployment → Source** 選 **GitHub Actions**。之後推送到 `main`，工作流程會檢查程式與卡圖，再自動發布 GitHub Pages。

```sh
node --check site/app.js
node scripts/validate.mjs
git add site README.md scripts .github
git commit -m "Update cat cards"
git push origin main
```

新增卡片時，把圖片放進 `site/assets/`，在 `site/cards.json` 加入卡片資料。保留原有卡片的 `id`，才能維持玩家收藏對應。日常卡片總數會自動計算。

## 專案結構

- `site/index.html`：遊戲頁面
- `site/style.css`：樣式與閃卡效果
- `site/app.js`：抽卡、任務、小遊戲與存檔
- `site/cards.json`：卡池資料
- `site/assets/`：貓咪照片
- `.github/workflows/pages.yml`：自動檢查與發布

## 授權

依儲存庫內的 [MIT License](LICENSE) 使用。
