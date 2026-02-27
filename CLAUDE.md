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
server.js                — Express server (serves built Astro + API)
src/pages/index.astro    — Homepage (speed test UI)
src/pages/api.astro      — API docs page
src/pages/sdk.astro      — SDK docs page
src/content/blog/*.md    — Blog posts (15+ articles)
api/mst-api.js           — Standalone API (Vercel-compatible)
sdk/mst.js               — Browser SDK for speed testing
```

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
- Note: Last deploy failed — may need build fix
