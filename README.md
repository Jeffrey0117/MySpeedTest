<div align="center">

# ⚡ MST - MySpeedTest

**最快的網速測試工具，5 秒出結果**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Astro](https://img.shields.io/badge/Astro-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://www.javascript.com/)

[Live Demo](https://myspeedtest.isnowfriend.com) • [SDK Documentation](./sdk/README.md) • [Blog](https://myspeedtest.isnowfriend.com/blog)

</div>

---

## 😫 The Problem

Other speed test tools are **slow**:
- Wait 10+ seconds staring at loading spinners
- Inaccurate single-connection tests
- Closed-source algorithms you can't verify
- Bloated with ads and trackers

## ✨ The Solution

**MST** gives you results in **5 seconds** with automatic accuracy verification:

| Feature | MST | Others |
|---------|-----|--------|
| **Result Time** | 5 seconds | 10-30 seconds |
| **Multi-Connection** | ✅ 4 parallel downloads | ❌ Single connection |
| **Auto-Verification** | ✅ Detects fluctuations | ❌ One-shot test |
| **Open Source** | ✅ Fully transparent | ❌ Black box |
| **Privacy** | ✅ No tracking | ⚠️ Analytics/ads |
| **SDK Available** | ✅ Embed anywhere | ❌ Website only |

---

## 🎯 Features

### Fast Testing
- **5-second tests** - Multi-connection parallel downloads saturate bandwidth quickly
- **Automatic verification** - Detects unstable connections and re-tests for accuracy
- **Real-time updates** - See your speed fluctuate in real-time (50ms intervals)

### Accurate & Transparent
- **FAST CDN nodes** - Uses Netflix's high-quality CDN infrastructure
- **Smart node selection** - Automatically picks closest servers (Taiwan priority)
- **Open-source algorithm** - Verify exactly how we calculate speed

### Developer-Friendly
- **Embeddable SDK** - Add speed tests to your own apps ([SDK docs](./sdk/README.md))
- **REST API** - Integrate testing into backend services
- **No dependencies** - Pure vanilla JavaScript, works everywhere

### Privacy-First
- **No tracking** - Zero analytics, no cookies, no user identification
- **Client-side testing** - All measurements happen in your browser
- **No data collection** - Results stored temporarily in logs only (not persisted)

---

## 🚀 Quick Start

### Try It Live

Visit [myspeedtest.isnowfriend.com](https://myspeedtest.isnowfriend.com) and click **GO**.

### Use the SDK

```html
<script src="https://myspeedtest.isnowfriend.com/sdk/mst.js"></script>
<script>
  const mst = new MST();

  mst.on('progress', ({ speed }) => {
    console.log(`${speed.value} ${speed.unit}`);
  });

  mst.on('complete', (result) => {
    console.log('Done:', result.speed);
  });

  await mst.run();
</script>
```

See [SDK Documentation](./sdk/README.md) for full API reference.

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or pnpm

### Local Development

```bash
git clone https://github.com/Jeffrey0117/MySpeedTest.git
cd MySpeedTest
npm install
npm run dev
```

Visit `http://localhost:4321`

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy

The site is built with **Astro** and can be deployed to:

- **Vercel** (recommended) - Zero config, auto-deploy from GitHub
- **Netlify** - Static site hosting
- **Railway / Render** - Node.js hosting with Express backend
- **Any static host** - Build output in `dist/`

---

## 🛠️ How It Works

### Client-Side Testing Architecture

```
┌─────────────────────────────────────────────────────┐
│ User Browser (Your Device)                          │
│                                                     │
│  1. Click "GO"                                      │
│     ↓                                               │
│  2. Request CDN nodes from API                      │
│     ↓                                               │
│  3. Download from 4 parallel connections            │
│     ↓                                               │
│  4. Measure bytes/sec every 50ms                    │
│     ↓                                               │
│  5. Calculate final speed (Mbps)                    │
│     ↓                                               │
│  6. If fluctuation > 15% → Auto re-test             │
│                                                     │
└─────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
    [CDN Node 1]        [CDN Node 2]        [CDN Node 3]
```

### Why Multi-Connection?

Single-connection downloads **cannot saturate modern broadband**:

```javascript
// ❌ WRONG: Single fetch
const start = Date.now();
await fetch('/big-file');
const speed = fileSize / (Date.now() - start);
// Result: ~30-50% of actual bandwidth

// ✅ CORRECT: MST approach
// 4 parallel Range requests → 100% bandwidth utilization
```

### Automatic Verification

If coefficient of variation (CV) > 0.15 in recent samples:
1. Run second 2-second test
2. Average both results
3. Display "已驗證" (Verified) badge

This ensures accuracy for unstable connections (WiFi, mobile).

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SDK README](./sdk/README.md) | Full SDK API reference and examples |
| [Blog: How MST Works](https://myspeedtest.isnowfriend.com/blog/mst-tech) | Technical deep dive (Chinese) |
| [Blog: MST vs Fast.com](https://myspeedtest.isnowfriend.com/blog/mst-vs-fastcom-vs-speedtest) | Comparison guide (Chinese) |

---

## 🗂️ Project Structure

```
/
├── api/
│   └── mst-api.js           # API endpoints (targets, results, health)
├── public/
│   ├── sdk/mst.js           # Standalone SDK
│   └── og-image.jpg         # Social preview image
├── sdk/
│   └── README.md            # SDK documentation (Chinese)
├── src/
│   ├── content/
│   │   └── blog/*.md        # Blog posts (Chinese)
│   ├── layouts/
│   │   ├── BaseLayout.astro # Page wrapper
│   │   └── DocLayout.astro  # Documentation wrapper
│   ├── pages/
│   │   ├── index.astro      # Main speed test page
│   │   ├── sdk.astro        # SDK documentation page
│   │   ├── api.astro        # API documentation page
│   │   └── blog/            # Blog routes
│   └── styles/
│       └── global.css       # Global styles
├── astro.config.mjs         # Astro configuration
├── server.js                # Express server (production)
└── package.json
```

---

## 🧪 API Reference

### Backend Endpoints

#### `GET /api/mst/targets`

Fetch CDN nodes for testing.

**Query Parameters:**
- `count` (number, optional) - Number of nodes (max 5, default 3)
- `country` (string, optional) - Preferred country code (default "TW")

**Response:**
```json
{
  "success": true,
  "targets": [
    {
      "url": "https://...",
      "city": "Taipei",
      "country": "TW"
    }
  ]
}
```

#### `POST /api/mst/results`

Submit test results (optional, for logging).

**Body:**
```json
{
  "speed": { "value": 87.5, "unit": "Mbps", "raw": 87654321 },
  "bytes": 109876543,
  "duration": 10.02
}
```

#### `GET /api/mst/health`

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "name": "MySpeedTest API",
  "version": "1.0.0",
  "timestamp": "2026-01-28T07:00:00.000Z"
}
```

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] English blog translations
- [ ] Additional CDN providers (besides FAST)
- [ ] Upload speed testing
- [ ] Ping/latency measurement
- [ ] Historical results chart
- [ ] Mobile app (React Native SDK)

**Guidelines:**
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Live Site**: [myspeedtest.isnowfriend.com](https://myspeedtest.isnowfriend.com)
- **SDK Docs**: [SDK README](./sdk/README.md)
- **Blog**: [技術文章](https://myspeedtest.isnowfriend.com/blog)

---

<div align="center">

**如果這工具幫你省下時間，給個 ⭐ 吧！**

Made with ⚡ by [Jeffrey0117](https://github.com/Jeffrey0117)

</div>
