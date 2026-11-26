# MySpeedTest

Internet speed test tool with embedded SDK and blog.

## Stack

- Astro 5 (static site generator)
- Express 5 (API server)
- JavaScript (ESM)
- Netflix fast.com CDN for test targets
- Port: 4001

## Run

```bash
npm run dev       # Astro dev server
npm run build     # Build static site
npm start         # Express production server
```

## Key Files

```
server.js                      — Express server (serves built Astro + API)
src/pages/index.astro          — Homepage (speed test UI + FAQ + latest posts)
src/pages/api.astro            — API docs page
src/pages/sdk.astro            — SDK docs page
src/content/blog/*.md          — Blog posts (15+ articles)
src/data/brand.ts              — 品牌與姊妹工具清單（footer 和 schema 的唯一來源）
src/components/BrandFooter.astro — 品牌 footer（薄殼，邏輯在 kit 裡）
src/lib/brand-footer-kit.cjs   — brand-footer-kit 的程式複製，勿直接改
api/mst-api.js                 — Standalone API (Vercel-compatible)
public/sdk/mst.js              — Browser SDK for speed testing
public/js/home-test.js         — 首頁測速流程（進頁面先測、按 GO 亮結果、確認視窗）
public/js/result-card.js       — 把測速結果畫成可存、可分享的圖
```

## 品牌 footer

邏輯來自 [brand-footer-kit](https://github.com/Jeffrey0117/brand-footer-kit)，以**程式複製**的方式接
（這台機器的 npm 禁止 git 來源套件，EALLOWGIT）。

- 要加減工具或改品牌文案 → 改 `src/data/brand.ts`，**只改那個檔**
- 要改 footer 的結構或行為 → 改上游 kit 再同步 `src/lib/brand-footer-kit.cjs`
- 深淺色換皮只覆寫 `.bfk-footer` 底下的 CSS 變數，別重寫 kit 的規則
- ⚠️ **工具連結一律指公開的專案頁**（`jeffrey0117.github.io/...`），不要填自架服務的
  直連網址——這是 public repo

## SEO 注意事項

- `/blog/tags/*` 全部 `noindex, follow`，也被 `astro.config.mjs` 的 sitemap filter 排除。
  它們是 1~3 篇的薄列表頁，曾經佔掉 sitemap 的四分之三。
- 首頁 FAQ 的問答文字同時餵給畫面與 `FAQPage` schema，兩邊必須一致，否則 Google 判違規。
  改文案記得兩邊是同一個陣列（`src/pages/index.astro` 的 `faqs`），不要拆開。
- 站台網址讀 `astro.config.mjs` 的 `site`（`Astro.site`），不要在頁面裡再寫死一次。

## 首頁測速：進頁面就先測

- 頁面載完就在背景跑完整測速，按 GO 只是把結果亮出來（數字滾上去 + 確認視窗）。
  還在測就接著顯示進度；結果超過 60 秒或已經看過，按 GO 才是現場重測。
- 每個訪客都會被自動下載一次（約 1.5 秒滿速的量），這是 Jeff 明說要的，別加「行動網路不測」。
- 重測之後確認視窗改報「測了幾次、平均、誤差」（只算這次開頁面、完整測完的）；
  誤差 10% 內吐槽「就跟你說了很準」。
- 吐槽句在 `home-test.js` 的 `STEADY_LINES`（誤差小）和 `DRIFT_LINES`（誤差大），照次數輪，要加句子加在那裡。
- 連測第 3 次起，視窗多一塊推 Windows 桌面程式（聲聲慢、DuckShot、ReVid），清單在 `src/data/brand.ts` 的 `desktopApps`。
- 視窗的「存成圖片」由 `public/js/result-card.js` 畫 1080×1080 的圖：手機走系統分享、電腦直接下載。
  圖上的網址讀 `location.host`，不要寫死。
- 第一屏要看得到 GO：首頁標題、數字、按鈕的大小都同時看 vh，改大小別只看 vw。
- 改 `public/js/*.js` 要同時改 `index.astro` 裡 script 的 `?v=`，不然瀏覽器拿舊檔。

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/mst/targets` | Get speed test nodes (?count, ?country) |
| POST | `/api/mst/results` | Save test results |
| GET | `/api/mst/health` | Health check |

## SDK Usage

```html
<script src="/sdk/mst.js"></script>
<script>
const mst = new MST({ duration: 10000, maxConnections: 3 });
mst.on('progress', ({ speed }) => console.log(speed.value, speed.unit));
await mst.run();
</script>
```

## CloudPipe

- Manifest: `data/manifests/myspeedtest.json` (2 tools)
- Auth: none
- Entry: `server.js`
- Deploy: `git push`。⚠️ lowkey-guard 會擋這個 repo 的 push——站台網址本來就寫在 20 幾個
  檔案裡，任何 diff 的 context 行都會帶到，改程式清不掉。要 Jeff 手動推或調整 allowRepos。
