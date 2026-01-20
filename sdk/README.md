# MST - MySpeedTest SDK

真正理解你網速的測速工具。開源、透明、前端執行。

## 為什麼要用 MST？

### 測速一定要在前端執行

```
❌ 後端測速
[後端伺服器] ←→ [CDN]
     ↑
  測到的是「伺服器的網速」

✅ 前端測速（MST 的做法）
[用戶瀏覽器] ←→ [CDN]
     ↑
  測到的是「用戶的網速」
```

### 為什麼不能只用一個 fetch？

```javascript
// ❌ 錯誤做法
const start = Date.now();
await fetch('/big-file.bin');
const speed = fileSize / (Date.now() - start);
// 問題：單一連線無法跑滿頻寬
```

```javascript
// ✅ 正確做法（MST 的邏輯）
// 1. 多條連線並行下載
// 2. 使用 Range 請求，避免緩存
// 3. 固定時間窗口，持續累計
```

---

## 安裝

### 瀏覽器

```html
<script src="/sdk/mst.js"></script>
```

### ES Module

```javascript
import MST from './sdk/mst.js';
```

---

## 快速開始

```javascript
const mst = new MST();

// 監聽進度
mst.on('progress', ({ speed }) => {
  console.log(`${speed.value} ${speed.unit}`);
});

// 監聽完成
mst.on('complete', (result) => {
  console.log('測速完成:', result);
});

// 執行
await mst.run();
```

---

## API

### Constructor

```javascript
new MST(options)
```

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `apiEndpoint` | string | `/api/mst` | 後端 API 端點 |
| `duration` | number | `10000` | 測速時間（毫秒） |
| `maxConnections` | number | `3` | 最大並行連線數 |
| `chunkSize` | number | `524288` | 下載區塊大小（bytes） |
| `updateInterval` | number | `100` | 進度更新間隔（毫秒） |

### Methods

| 方法 | 說明 |
|------|------|
| `run()` | 執行測速，返回 `Promise<Result>` |
| `stop()` | 停止測速 |
| `on(event, cb)` | 註冊事件監聽器，返回 `this` |
| `off(event, cb)` | 移除事件監聽器，返回 `this` |

### Static Methods

```javascript
MST.formatSpeed(87654321)
// { value: 87.7, unit: 'Mbps', raw: 87654321 }
```

### Events

| 事件 | 觸發時機 | 資料 |
|------|----------|------|
| `start` | 測速開始 | `{ timestamp }` |
| `targets` | 取得節點 | `{ targets, count }` |
| `progress` | 進度更新 | `{ progress, elapsed, bytes, speed }` |
| `complete` | 測速完成 | `{ speed, bytes, duration, targets, timestamp }` |
| `error` | 發生錯誤 | `{ error, message }` |

### Result Object

```typescript
interface Result {
  speed: {
    value: number;   // 顯示值（如 87.5）
    unit: string;    // 單位（Kbps / Mbps / Gbps）
    raw: number;     // 原始值（bps）
  };
  bytes: number;     // 總下載量（bytes）
  duration: number;  // 實際測試時間（秒）
  targets: Target[]; // 使用的節點
  timestamp: number; // Unix timestamp
}
```

---

## 後端 API

MST SDK 需要搭配後端 API 使用。

### `GET /api/mst/targets`

取得測速節點。

**Response:**
```json
{
  "success": true,
  "targets": [
    { "url": "https://...", "city": "Taipei", "country": "TW" }
  ]
}
```

### `POST /api/mst/results`

儲存測速結果（可選）。

**Body:**
```json
{
  "speed": { "value": 87.5, "unit": "Mbps", "raw": 87654321 },
  "bytes": 109876543,
  "duration": 10.02
}
```

---

## 完整範例

```html
<!DOCTYPE html>
<html>
<body>
  <div id="speed">0</div>
  <div id="unit">Mbps</div>
  <button onclick="test()">GO</button>

  <script src="/sdk/mst.js"></script>
  <script>
    async function test() {
      const mst = new MST();

      mst.on('progress', ({ speed }) => {
        document.getElementById('speed').textContent = speed.value;
        document.getElementById('unit').textContent = speed.unit;
      });

      await mst.run();
    }
  </script>
</body>
</html>
```

---

## License

MIT

---

## Links

- [MySpeedTest](https://myspeedtest.app) - 線上測速
- [測速原理](https://myspeedtest.app/learn) - 了解測速如何運作
- [GitHub](https://github.com/user/mst) - 原始碼
