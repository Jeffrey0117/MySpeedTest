// ─────────────────────────────────────────────────────────────────────
// 複製自 brand-footer-kit v0.2.0
// source: https://github.com/Jeffrey0117/brand-footer-kit
//
// 這台機器的 npm 禁止 git 來源套件（EALLOWGIT），所以用程式複製的方式接。
// ⚠️ 要改行為請改上游 kit 再同步回來，不要只改這一份。
//     kit-kit audit brand-footer-kit 會標出哪些專案的複製版落後。
// ─────────────────────────────────────────────────────────────────────
'use strict';

/**
 * brand-footer-kit — 站群品牌 footer。
 *
 * 一個人做很多站的時候，每個站底下都該掛同一個品牌、互相連過去：
 * 訪客會順著逛（培養腦粉），搜尋引擎也看得到站群之間的關係。
 *
 * 為什麼是「回傳字串」而不是框架元件：
 *   連結必須在**建置期**就寫進 HTML。用 JS 在瀏覽器抓清單再塞進 DOM，
 *   爬蟲多半看不到，整件事的 SEO 價值就沒了。回字串的話 Astro、
 *   Express 樣板、Next、11ty、純靜態產生器都能用，而且一定是靜態的。
 *
 * 零依賴，只用 node 內建。
 */

const DEFAULT_PREFIX = 'bfk';

/* ────────────────────────────── 工具函式 ────────────────────────────── */

/** HTML escape。品牌名、文案都可能含 & < > "，不 escape 會壞版或開 XSS。 */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 只放行 http / https 的絕對網址。
 * 擋 `javascript:`、`data:` 這類；相對路徑也擋掉——站群連結一定是跨站的，
 * 出現相對路徑通常代表資料填錯，安靜吃掉比連到錯的地方好。
 */
function isSafeUrl(url) {
  if (typeof url !== 'string' || url === '') return false;
  try {
    const protocol = new URL(url).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/** 兩個網址是不是同一個站（只看 host，忽略 www、路徑、協定）。 */
function sameHost(a, b) {
  try {
    const strip = (h) => h.replace(/^www\./, '').toLowerCase();
    return strip(new URL(a).host) === strip(new URL(b).host);
  } catch (_) {
    return false;
  }
}

/**
 * 字串 → 32-bit 整數。用來做「每個站看到不同工具」的輪替。
 *
 * 刻意不用亂數：同一個站每次 build 要拿到同一組，否則每次部署
 * footer 連結都在變，對爬蟲來說是雜訊，diff 也會一直髒。
 */
function hashSeed(text) {
  let hash = 0;
  const str = String(text == null ? '' : text);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/* ────────────────────────────── 挑選邏輯 ────────────────────────────── */

/**
 * 從完整工具清單挑出要顯示的幾個。
 *
 * @param {Array} tools      全部工具 [{ name, blurb, url }]
 * @param {object} [options]
 * @param {string} [options.exclude] 當前站網址 — 同 host 的會被排除（別連到自己）
 * @param {number} [options.limit]   最多幾個（預設 6；<=0 表示不限）
 * @param {string} [options.seed]    輪替種子，通常就傳當前站網址
 * @returns {Array} 挑選後的工具（原物件不會被改動）
 */
function pickTools(tools, options) {
  const opts = options || {};
  const limit = opts.limit == null ? 6 : opts.limit;

  const usable = (Array.isArray(tools) ? tools : [])
    .filter((tool) => tool && typeof tool.name === 'string' && isSafeUrl(tool.url))
    .filter((tool) => !(opts.exclude && sameHost(tool.url, opts.exclude)));

  if (limit <= 0 || usable.length <= limit) return usable.slice();

  // 從種子決定的位置開始取，繞一圈。不同站拿到不同起點，整體曝光平均，
  // 但同一個站每次 build 都一樣。
  const start = hashSeed(opts.seed || '') % usable.length;
  const picked = [];
  for (let i = 0; i < limit; i += 1) {
    picked.push(usable[(start + i) % usable.length]);
  }
  return picked;
}

/* ────────────────────────────── 產生 HTML ────────────────────────────── */

function renderLink(url, label, sub, prefix, extraClass) {
  const cls = extraClass ? ` class="${prefix}-item ${extraClass}"` : ` class="${prefix}-item"`;
  return (
    `<li${cls}>` +
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">` +
    `<span class="${prefix}-item-name">${escapeHtml(label)}</span>` +
    (sub ? `<span class="${prefix}-item-blurb">${escapeHtml(sub)}</span>` : '') +
    '</a>' +
    '</li>'
  );
}

/**
 * 建一個 footer 產生器。
 *
 * @param {object} config
 * @param {object} config.brand            品牌：{ name, shortName, tagline, home, github, foundedYear }
 * @param {Array}  config.tools            站群完整工具清單 [{ name, blurb, url }]
 * @param {string} [config.prefix]         CSS class 前綴（預設 'bfk'），跟既有樣式衝突時改這個
 * @param {number} [config.year]           當前年份（預設 new Date().getFullYear()；測試時可固定）
 */
function createBrandFooter(config) {
  const cfg = config || {};
  const brand = cfg.brand || {};
  const tools = Array.isArray(cfg.tools) ? cfg.tools : [];
  const prefix = cfg.prefix || DEFAULT_PREFIX;

  if (!brand.name) throw new Error('brand-footer-kit: 缺少 brand.name');
  if (!isSafeUrl(brand.home)) throw new Error('brand-footer-kit: brand.home 必須是 http(s) 絕對網址');

  const year = cfg.year || new Date().getFullYear();

  /**
   * 產生 footer 的 HTML 字串。
   *
   * @param {object} [options]
   * @param {string} [options.currentUrl] 當前站網址 — 同時當排除依據與輪替種子
   * @param {number} [options.limit]      顯示幾個工具（預設 6）
   * @param {Array}  [options.nav]        站內導覽 [{ label, href }]，放在品牌區上方
   * @param {string} [options.note]       接在 tagline 後面的一句話，例：'本站是其中一個。'
   * @param {string} [options.moreLabel]  「看全部」那格的文字
   * @param {string} [options.moreBlurb]  「看全部」那格的副標
   */
  function html(options) {
    const opts = options || {};
    const picked = pickTools(tools, {
      exclude: opts.currentUrl,
      limit: opts.limit == null ? 6 : opts.limit,
      seed: opts.currentUrl,
    });

    const navHtml = Array.isArray(opts.nav) && opts.nav.length
      ? `<nav class="${prefix}-nav" aria-label="網站導覽">` +
        opts.nav
          .filter((item) => item && item.label && item.href)
          .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
          .join('') +
        '</nav>'
      : '';

    const taglineText = [brand.tagline, opts.note].filter(Boolean).join('');
    const taglineHtml = taglineText
      ? `<p class="${prefix}-tagline">${escapeHtml(taglineText)}</p>`
      : '';

    const itemsHtml = picked
      .map((tool) => renderLink(tool.url, tool.name, tool.blurb, prefix))
      .join('');

    const moreHtml = renderLink(
      brand.home,
      opts.moreLabel || '看全部作品',
      opts.moreBlurb || '',
      prefix,
      `${prefix}-more`
    );

    const startYear = brand.foundedYear;
    const years = startYear && year > startYear ? `${startYear}–${year}` : String(startYear || year);

    const bottomLinks = [];
    if (isSafeUrl(brand.github)) {
      bottomLinks.push(`<a href="${escapeHtml(brand.github)}" target="_blank" rel="noopener">GitHub</a>`);
    }
    bottomLinks.push(`<a href="${escapeHtml(brand.home)}" target="_blank" rel="noopener">作品站</a>`);

    return (
      `<footer class="${prefix}-footer">` +
      navHtml +
      `<section class="${prefix}-brand">` +
      `<a class="${prefix}-name" href="${escapeHtml(brand.home)}" target="_blank" rel="noopener">` +
      escapeHtml(brand.name) +
      '</a>' +
      taglineHtml +
      `<ul class="${prefix}-list">${itemsHtml}${moreHtml}</ul>` +
      '</section>' +
      `<div class="${prefix}-bottom">` +
      `<span>&copy; ${escapeHtml(years)} ${escapeHtml(brand.shortName || brand.name)}</span>` +
      bottomLinks.join('') +
      '</div>' +
      '</footer>'
    );
  }

  /**
   * 預設樣式。全部吃 CSS 變數，各站改變數就換皮，不必重寫規則。
   * 不想用就別呼叫，自己寫 — HTML 的 class 名稱是穩定介面。
   */
  function css() {
    const p = prefix;
    return `
.${p}-footer{--${p}-fg:#1a1a1a;--${p}-muted:#666;--${p}-line:#e0e0e0;--${p}-card:#fff;--${p}-accent:#ff9500;
  margin-top:80px;padding:50px 24px 40px;border-top:1px solid var(--${p}-line);text-align:center}
.${p}-footer a{margin:0;text-decoration:none}
.${p}-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 28px;font-size:14px}
.${p}-nav a{color:var(--${p}-muted);transition:color .2s}
.${p}-nav a:hover{color:var(--${p}-fg)}
.${p}-brand{max-width:760px;margin:44px auto 0;padding-top:36px;border-top:1px solid var(--${p}-line)}
.${p}-name{display:inline-block;font-size:17px;font-weight:700;color:var(--${p}-fg);transition:color .2s}
.${p}-name:hover{color:var(--${p}-accent)}
.${p}-tagline{margin-top:8px;font-size:13px;color:var(--${p}-muted)}
.${p}-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:28px;padding:0;list-style:none;text-align:left}
.${p}-list a{display:block;height:100%;padding:12px 16px;border:1px solid var(--${p}-line);border-radius:10px;background:var(--${p}-card);transition:border-color .2s,transform .2s}
.${p}-list a:hover{border-color:var(--${p}-accent);transform:translateY(-2px)}
.${p}-item-name{display:block;font-size:14px;font-weight:600;color:var(--${p}-fg)}
.${p}-item-blurb{display:block;margin-top:3px;font-size:12px;color:var(--${p}-muted)}
.${p}-more{grid-column:1/-1}
.${p}-more a{border-style:dashed;text-align:center}
.${p}-more .${p}-item-name::after{content:' \\2192';color:var(--${p}-accent)}
.${p}-bottom{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 20px;margin-top:40px;font-size:13px;color:var(--${p}-muted)}
.${p}-bottom a{color:var(--${p}-muted);transition:color .2s}
.${p}-bottom a:hover{color:var(--${p}-fg)}
@media(max-width:768px){.${p}-footer{margin-top:60px;padding:36px 16px 32px}
.${p}-list{grid-template-columns:1fr 1fr;gap:8px}.${p}-list a{padding:10px 12px}}
@media(max-width:420px){.${p}-list{grid-template-columns:1fr}}
`.trim();
  }

  return { html, css, pick: (options) => pickTools(tools, options), prefix };
}

module.exports = createBrandFooter;
module.exports.createBrandFooter = createBrandFooter;
module.exports.pickTools = pickTools;
module.exports.escapeHtml = escapeHtml;
module.exports.isSafeUrl = isSafeUrl;
module.exports.sameHost = sameHost;
