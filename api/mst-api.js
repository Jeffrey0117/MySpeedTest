/**
 * MST API - 單檔部署版
 *
 * 支援部署到：
 * - Vercel (Serverless Functions)
 * - Railway / Render (Node.js)
 * - 任何支援 Express 的平台
 *
 * 使用方式：
 * 1. Vercel: 放到 /api/mst.js，自動變成 /api/mst 端點
 * 2. 獨立運行: node mst-api.js
 */

const CONFIG = {
  cdn: {
    apiEndpoint: 'https://api.fast.com/netflix/speedtest/v2',
    token: 'YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm',
    defaultUrlCount: 5,
  },
};

/**
 * 取得測速節點
 */
async function getTargets(preferredCountry = 'TW', count = 3) {
  const params = new URLSearchParams({
    https: 'true',
    token: CONFIG.cdn.token,
    urlCount: String(CONFIG.cdn.defaultUrlCount),
  });

  const response = await fetch(`${CONFIG.cdn.apiEndpoint}?${params}`);

  if (!response.ok) {
    throw new Error(`CDN API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.targets || data.targets.length === 0) {
    throw new Error('No targets available');
  }

  // 優先選擇指定國家的節點
  let targets = data.targets.filter(
    (t) => t.location?.country === preferredCountry
  );

  if (targets.length === 0) {
    targets = data.targets;
  }

  return targets.slice(0, Math.min(count, 5)).map((t) => ({
    url: t.url,
    city: t.location?.city || 'Unknown',
    country: t.location?.country || 'Unknown',
  }));
}

/**
 * CORS Headers
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ============================================================
// Vercel Serverless Handler
// ============================================================
export default async function handler(req, res) {
  // CORS
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.split('?')[0];

  try {
    // GET /api/mst/targets
    if (req.method === 'GET' && path.endsWith('/targets')) {
      const count = Math.min(parseInt(req.query?.count) || 3, 5);
      const country = req.query?.country || 'TW';

      const targets = await getTargets(country, count);

      return res.status(200).json({
        success: true,
        targets,
      });
    }

    // POST /api/mst/results
    if (req.method === 'POST' && path.endsWith('/results')) {
      const { speed, bytes, duration } = req.body || {};

      if (!speed || typeof speed.raw !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Invalid speed data',
        });
      }

      const result = {
        id: `mst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        speed,
        bytes,
        duration,
        timestamp: new Date().toISOString(),
      };

      console.log('[MST] Result:', JSON.stringify(result));

      return res.status(200).json({
        success: true,
        id: result.id,
      });
    }

    // GET /api/mst/health
    if (req.method === 'GET' && path.endsWith('/health')) {
      return res.status(200).json({
        success: true,
        name: 'MySpeedTest API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // 404
    return res.status(404).json({
      success: false,
      error: 'Not found',
    });

  } catch (error) {
    console.error('[MST] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// ============================================================
// 獨立運行模式 (node mst-api.js)
// ============================================================
if (typeof require !== 'undefined' && require.main === module) {
  (async () => {
    const express = (await import('express')).default;
    const app = express();
    const PORT = process.env.PORT || 3001;

    app.use(express.json());

    // CORS
    app.use((req, res, next) => {
      Object.entries(corsHeaders()).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    // Routes
    app.get('/api/mst/targets', async (req, res) => {
      try {
        const count = Math.min(parseInt(req.query.count) || 3, 5);
        const country = req.query.country || 'TW';
        const targets = await getTargets(country, count);
        res.json({ success: true, targets });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/mst/results', (req, res) => {
      const { speed, bytes, duration } = req.body;
      if (!speed || typeof speed.raw !== 'number') {
        return res.status(400).json({ success: false, error: 'Invalid speed data' });
      }
      const id = `mst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      console.log('[MST] Result:', JSON.stringify({ id, speed, bytes, duration }));
      res.json({ success: true, id });
    });

    app.get('/api/mst/health', (req, res) => {
      res.json({
        success: true,
        name: 'MySpeedTest API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    app.listen(PORT, () => {
      console.log(`
  ╔════════════════════════════════════════╗
  ║     MST API - Standalone Mode          ║
  ╠════════════════════════════════════════╣
  ║  🌐 http://localhost:${PORT}              ║
  ║                                        ║
  ║  Endpoints:                            ║
  ║    GET  /api/mst/targets               ║
  ║    POST /api/mst/results               ║
  ║    GET  /api/mst/health                ║
  ╚════════════════════════════════════════╝
      `);
    });
  })();
}
