import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// MST - MySpeedTest Server
// ============================================================
const CONFIG = {
  port: process.env.PORT || 3000,
  version: "1.0.0",
  cdn: {
    apiEndpoint: "https://api.fast.com/netflix/speedtest/v2",
    token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
    defaultUrlCount: 5,
  },
};

const app = express();
app.use(express.json());

// 靜態檔案
app.use(express.static(__dirname));
app.use("/sdk", express.static(`${__dirname}/sdk`));
app.use("/api", express.static(`${__dirname}/api`));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ============================================================
// Page Routes
// ============================================================
app.get("/learn", (req, res) => res.sendFile(`${__dirname}/learn.html`));
app.get("/sdk", (req, res) => res.sendFile(`${__dirname}/sdk.html`));

// ============================================================
// API Routes: /api/mst
// ============================================================

/**
 * GET /api/mst/targets
 * 取得測速節點
 */
app.get("/api/mst/targets", async (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 3, 5);
  const preferredCountry = req.query.country || "TW";

  const params = new URLSearchParams({
    https: "true",
    token: CONFIG.cdn.token,
    urlCount: String(CONFIG.cdn.defaultUrlCount),
  });

  try {
    const response = await fetch(`${CONFIG.cdn.apiEndpoint}?${params}`);

    if (!response.ok) {
      throw new Error(`CDN API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.targets || data.targets.length === 0) {
      return res.status(502).json({
        success: false,
        error: "No targets available",
      });
    }

    let targets = data.targets.filter(
      (t) => t.location?.country === preferredCountry
    );

    if (targets.length === 0) {
      targets = data.targets;
    }

    res.json({
      success: true,
      targets: targets.slice(0, count).map((t) => ({
        url: t.url,
        city: t.location?.city || "Unknown",
        country: t.location?.country || "Unknown",
      })),
    });
  } catch (error) {
    console.error("[MST] targets error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get targets",
    });
  }
});

/**
 * POST /api/mst/results
 * 儲存測速結果
 */
app.post("/api/mst/results", (req, res) => {
  const { speed, bytes, duration } = req.body;

  if (!speed || typeof speed.raw !== "number") {
    return res.status(400).json({
      success: false,
      error: "Invalid speed data",
    });
  }

  const result = {
    id: `mst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    speed,
    bytes,
    duration,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  console.log("[MST] Result:", JSON.stringify(result));

  res.json({
    success: true,
    id: result.id,
  });
});

/**
 * GET /api/mst/health
 */
app.get("/api/mst/health", (req, res) => {
  res.json({
    success: true,
    name: "MySpeedTest",
    version: CONFIG.version,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 啟動
// ============================================================
app.listen(CONFIG.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║     ███╗   ███╗ ███████╗ ████████╗                   ║
  ║     ████╗ ████║ ██╔════╝ ╚══██╔══╝                   ║
  ║     ██╔████╔██║ ███████╗    ██║                      ║
  ║     ██║╚██╔╝██║ ╚════██║    ██║                      ║
  ║     ██║ ╚═╝ ██║ ███████║    ██║                      ║
  ║     ╚═╝     ╚═╝ ╚══════╝    ╚═╝                      ║
  ║                                                       ║
  ║     MySpeedTest - 真正理解你網速的測速工具           ║
  ║     v${CONFIG.version}                                          ║
  ║                                                       ║
  ╠═══════════════════════════════════════════════════════╣
  ║                                                       ║
  ║  🌐 Server    http://localhost:${CONFIG.port}                   ║
  ║  🏠 首頁      http://localhost:${CONFIG.port}/                  ║
  ║  📦 SDK       http://localhost:${CONFIG.port}/sdk/mst.js        ║
  ║                                                       ║
  ╠═══════════════════════════════════════════════════════╣
  ║  API Endpoints:                                       ║
  ║    GET  /api/mst/targets  取得測速節點               ║
  ║    POST /api/mst/results  儲存測速結果               ║
  ║    GET  /api/mst/health   健康檢查                   ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});
