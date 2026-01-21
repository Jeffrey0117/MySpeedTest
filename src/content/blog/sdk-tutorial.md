---
title: 如何在網頁中嵌入測速功能？MST SDK 教學
description: 想要在您的網站或應用程式中加入網路測速功能嗎？本篇教學將引導您如何使用 MST Speed Test SDK，透過簡單的 JavaScript 程式碼，輕鬆整合出功能強大且可自訂的網路速度測試工具，並提升使用者體驗。
date: 2025-01-22
tags: ["測速SDK", "API", "網頁測速", "開發者"]
---

## 前言：為什麼要在您的網站中加入測速功能？

在現今這個高度數位化的時代，網路速度不僅影響著使用者的日常瀏覽體驗，更是許多線上服務（如串流影音、雲端遊戲、遠端辦公）能否順暢運作的關鍵。對於網站經營者、網路服務提供商（ISP）或軟體開發者而言，如果能在自己的網頁或應用程式中，提供一個直觀、準確的網路測速工具，將帶來許多顯而易見的優勢：

1.  **提升使用者體驗**：當使用者感覺網路卡頓時，他們可以直接在您的平台上進行檢測，而無需跳轉至其他測速網站，從而提升了網站的黏著度與專業形象。
2.  **輔助客戶服務**：客服團隊可以引導使用者進行測速，並將結果回報，這有助於快速判斷問題根源是來自於使用者自身的網路環境，還是服務本身的問題，大幅縮短了故障排除的時間。
3.  **收集網路數據**：您可以匿名收集使用者的網路品質數據（如下載速度、上傳速度、延遲等），這些數據對於優化服務、改善基礎設施、或進行市場分析都具有極高的價值。

然而，要從零開始開發一個穩定且準確的測速工具，不僅技術門檻高，也相當耗費時間與資源。幸運的是，現在有了 **MST (MySpeedTest) Speed Test SDK**，讓這一切變得無比簡單。本篇教學將帶您一步步了解如何使用這個強大的 SDK，輕鬆地在您的網頁中嵌入專業級的測速功能。

## MST Speed Test SDK 是什麼？

MST Speed Test SDK 是一個輕量級、功能強大且易於整合的 JavaScript 套件。它專為開發者設計，讓您只需短短幾行程式碼，就能在任何網頁中實現一個完整、準確的網路速度測試功能。

MST SDK 的核心目標是提供一個高度客製化和精確的測速解決方案。它模擬了瀏覽器在真實世界中下載和上傳數據的行為，能夠準確測量出使用者當前的網路連線品質，主要指標包括：

*   **延遲 (Latency / Ping)**：測量數據從您的裝置發送到伺服器再返回所需的時間，單位是毫秒 (ms)。延遲越低，表示網路反應速度越快。
*   **抖動 (Jitter)**：測量延遲的變化程度。抖動越小，表示網路連線越穩定，對於即時通訊或線上遊戲尤其重要。
*   **下載速度 (Download Speed)**：衡量從網路下載數據到您裝置的速度，單位是 Mbps (Megabits per second)。這是我們最常關注的指標，影響著看影片、下載檔案的體驗。
*   **上傳速度 (Upload Speed)**：衡量從您的裝置上傳數據到網路的速度，單位同樣是 Mbps。它影響著視訊通話、上傳檔案、直播等操作的流暢度。

無論您是想為您的網路工具網站增加一個新功能，還是在您的產品後台整合一個網路診斷工具，MST SDK 都是您的最佳選擇。

## 安裝 MST SDK

整合 MST SDK 的第一步就是將其安裝到您的專案中。我們推薦使用 `npm` (Node Package Manager) 進行安裝，這也是現代網頁開發最主流的管理方式。

請在您的專案根目錄下，打開終端機（Terminal）並執行以下指令：

```bash
npm install mst-speed-test
```

這個指令會自動從 npm 倉庫下載 MST SDK，並將其加入到您的 `node_modules` 目錄以及 `package.json` 的依賴列表中。安裝完成後，您就可以在您的 JavaScript 或 TypeScript 檔案中引入並使用它了。

## 基本使用範例

MST SDK 的設計理念是「開箱即用」。在最簡單的情況下，您只需要幾行程式碼就能啟動一次完整的測速。

首先，您需要在您的 JavaScript 檔案中引入 `MstSpeedTest` 這個類別。

```javascript
import MstSpeedTest from 'mst-speed-test';
```

接下來，建立一個 `MstSpeedTest` 的實例。這個物件將是您用來控制測速流程的主要核心。最後，只需呼叫 `start()` 方法，測速便會立即開始。

```javascript
// 引入 SDK
import MstSpeedTest from 'mst-speed-test';

// 建立 MstSpeedTest 實例
const speedTest = new MstSpeedTest();

// 開始測速
speedTest.start().then(result => {
  console.log('測速完成！');
  console.log('延遲 (Ping):', result.latency.avg, 'ms');
  console.log('抖動 (Jitter):', result.latency.jitter, 'ms');
  console.log('下載速度:', result.download.speed, 'Mbps');
  console.log('上傳速度:', result.upload.speed, 'Mbps');
}).catch(error => {
  console.error('測速失敗:', error);
});

```

`start()` 方法會返回一個 Promise。當測速成功完成時，Promise 會解析（resolve）並回傳一個包含所有測速結果的物件。如果過程中發生任何錯誤（例如無法連接到伺服器），Promise 將會被拒絕（reject），您可以透過 `.catch()` 來捕捉並處理這些錯誤。

這就是最基本的用法！僅僅幾行程式碼，一個功能完整的測速引擎就已經在您的網頁中運行了。

## 事件監聽與回調 (Event Listeners & Callbacks)

雖然 `start()` 方法的 Promise 讓我們可以在測速結束時取得最終結果，但在更多情況下，我們會希望在測速過程中即時地更新 UI，例如顯示一個進度條、即時更新速度數字，或是告訴使用者目前正在進行哪個階段的測試。

MST SDK 提供了非常完善的事件監聽機制，讓您可以輕鬆掛載回調函式，以應對測速過程中的各個重要事件。

以下是幾個最常用的事件：

*   `onConnecting`: 當 SDK 開始嘗試連接到測速伺服器時觸發。
*   `onLatency`: 當延遲（Ping）測試完成時觸發，回傳延遲與抖動的結果。
*   `onDownloadProgress`: 在下載測速期間會持續觸發，回傳即時的下載速度和進度。
*   `onUploadProgress`: 在上傳測速期間會持續觸發，回傳即時的上傳速度和進度。
*   `onResult`: 當所有測試（延遲、下載、上傳）都完成後觸發，回傳最終的完整報告。

讓我們來看一個更完整的範例，展示如何使用這些事件監聽來打造一個互動式的測速介面。

```javascript
import MstSpeedTest from 'mst-speed-test';

const speedTest = new MstSpeedTest();

// 監聽 "connecting" 事件
speedTest.onConnecting = () => {
  console.log('正在連接到伺服器...');
  // 在這裡更新 UI，例如顯示 "正在連接..."
};

// 監聽 "latency" 事件
speedTest.onLatency = (latency) => {
  console.log('延遲測試完成:', latency.avg, 'ms');
  console.log('抖動:', latency.jitter, 'ms');
  // 在這裡更新 UI，顯示 Ping 和 Jitter 值
};

// 監聽 "downloadProgress" 事件
speedTest.onDownloadProgress = (progress) => {
  console.log(`下載中... ${Math.round(progress.percent * 100)}%`);
  console.log(`即時下載速度: ${progress.speed} Mbps`);
  // 在這裡更新 UI，例如更新進度條和即時速度顯示
};

// 監聽 "uploadProgress" 事件
speedTest.onUploadProgress = (progress) => {
  console.log(`上傳中... ${Math.round(progress.percent * 100)}%`);
  console.log(`即時上傳速度: ${progress.speed} Mbps`);
  // 在這裡更新 UI
};

// 監聽 "result" 事件
speedTest.onResult = (result) => {
  console.log('所有測試已完成！');
  // 這裡的 result 物件結構與 start().then() 中取得的相同
  console.log('最終結果:', result);
  // 在這裡更新 UI，顯示最終的彙總報告
};

// 處理可能發生的錯誤
speedTest.onError = (error) => {
  console.error('發生錯誤:', error.message);
  // 在 UI 上顯示錯誤訊息
};

// 呼叫 start() 啟動測試
// 注意：即使使用了事件監聽，start() 仍然返回 Promise
speedTest.start();
```

透過這些事件回調，您可以完全掌握測速的每一個環節，為使用者打造出流暢且資訊豐富的互動體驗。

## 自訂選項 (Custom Options)

MST SDK 不僅功能強大，還具備高度的靈活性。您可以透過在建立 `MstSpeedTest` 實例時傳入一個設定物件，來調整測速的各項參數，以滿足不同的需求。

```javascript
const options = {
  // 自訂選項...
};

const speedTest = new MstSpeedTest(options);
```

以下是一些常用的自訂選項：

*   `server`: (string)
    預設情況下，SDK 會自動選擇最佳的伺服器進行測速。但您也可以手動指定一個特定的測速伺服器 URL。
    ```javascript
    const options = {
      server: 'https://my-custom-speedtest-server.com/api'
    };
    ```

*   `downloadThreads` / `uploadThreads`: (number)
    設定下載或上傳時使用的並行執行緒數量。增加執行緒數量有助於更好地跑滿高頻寬的網路，但同時也會增加客戶端和伺服器的負擔。預設值通常是 `4`。
    ```javascript
    const options = {
      downloadThreads: 5,
      uploadThreads: 5
    };
    ```

*   `testDuration`: (number)
    設定下載和上傳測試各自的持續時間（單位為秒）。較長的測試時間可以得到更平滑、更準確的平均速度，但也會花費更多時間。預設值為 `10` 秒。
    ```javascript
    const options = {
      testDuration: 12 // 每個測試持續 12 秒
    };
    ```

*   `latencyTestCount`: (number)
    設定進行多少次 Ping 測試來計算平均延遲和抖動。次數越多，結果越精確。預設值為 `20`。
    ```javascript
    const options = {
      latencyTestCount: 30
    };
    ```

### 綜合範例：使用自訂選項與事件監聽

現在，讓我們將所有知識點結合起來，建立一個使用自訂選項並包含完整事件監聽的測速實例。

```javascript
import MstSpeedTest from 'mst-speed-test';

// 1. 定義自訂選項
const customOptions = {
  testDuration: 15,       // 測試時間延長到 15 秒
  downloadThreads: 6,     // 使用 6 個下載執行緒
  uploadThreads: 6,       // 使用 6 個上傳執行緒
  latencyTestCount: 25,   // 進行 25 次 Ping 測試
};

// 2. 建立帶有選項的實例
const speedTest = new MstSpeedTest(customOptions);

// 3. 設定 UI 元素 (假設 HTML 中有對應的 id)
const statusElement = document.getElementById('status');
const pingElement = document.getElementById('ping');
const downloadElement = document.getElementById('download');
const uploadElement = document.getElementById('upload');
const startButton = document.getElementById('startButton');

// 4. 掛載事件監聽
speedTest.onConnecting = () => statusElement.innerText = '正在連接...';
speedTest.onLatency = (latency) => {
  statusElement.innerText = '正在測試下載速度...';
  pingElement.innerText = `延遲: ${latency.avg} ms (抖動: ${latency.jitter} ms)`;
};
speedTest.onDownloadProgress = (progress) => {
  downloadElement.innerText = `下載速度: ${progress.speed} Mbps`;
};
speedTest.onUploadProgress = (progress) => {
  // 可以在下載完成後更新狀態
  if (statusElement.innerText !== '正在測試上傳速度...') {
    statusElement.innerText = '正在測試上傳速度...';
  }
  uploadElement.innerText = `上傳速度: ${progress.speed} Mbps`;
};
speedTest.onResult = (result) => {
  statusElement.innerText = '測試完成！';
  downloadElement.innerText = `最終下載速度: ${result.download.speed} Mbps`;
  uploadElement.innerText = `最終上傳速度: ${result.upload.speed} Mbps`;
  startButton.disabled = false; // 重新啟用按鈕
};
speedTest.onError = (error) => {
  statusElement.innerText = `錯誤: ${error.message}`;
  startButton.disabled = false;
};

// 5. 綁定按鈕事件
startButton.addEventListener('click', () => {
  // 重設 UI
  statusElement.innerText = '';
  pingElement.innerText = '';
  downloadElement.innerText = '';
  uploadElement.innerText = '';
  startButton.disabled = true;

  // 開始測速
  speedTest.start();
});
```

## 總結

MST Speed Test SDK 為開發者提供了一個前所未有的簡單、靈活且強大的方式，來將網路測速功能整合到自己的網站或應用程式中。無論是為了提升使用者體驗、輔助客戶支援，還是進行網路數據分析，它都是一個值得信賴的工具。

透過本篇教學，您已經學會了如何安裝 SDK、進行基本和進階的測速、利用事件監聽來建立互動介面，以及如何透過自訂選項來微調測速參數。

現在就動手試試看吧！您可以前往 [MST SDK 官方網站](https://myspeedtest.isnowfriend.com/sdk) 探索更詳細的 API 文件和範例。將這個強大的工具整合到您的專案中，為您的使用者提供更透明、更優質的網路服務體驗。
