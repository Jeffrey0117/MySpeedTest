/**
 * 品牌與姊妹工具 — 單一真相來源。
 *
 * footer、JSON-LD 的 Organization / sameAs 都讀這裡。
 * 要加減工具只改這個檔，不要去動 BrandFooter.astro。
 */

export interface BrandTool {
  /** 顯示名稱 */
  name: string;
  /** 一句話說明，中文 6–10 字最好看 */
  blurb: string;
  /** 對外網址 */
  url: string;
}

export const brand = {
  name: 'htmlcat 切版職人',
  shortName: 'htmlcat',
  tagline: '一個人做一整套自己的工具',
  /** 作品站 — hub-and-spoke 的 hub */
  home: 'https://jeffrey0117.github.io/jeffrey-apps/',
  github: 'https://github.com/Jeffrey0117',
  /** 著作權起始年；結束年在 footer 動態產生 */
  foundedYear: 2019,
} as const;

/**
 * Organization schema 的 sameAs — 讓 Google 把這些站認成同一個實體。
 * 之後有 IG / Threads / YouTube 再往下加。
 */
export const brandSameAs: string[] = [brand.github, brand.home];

/**
 * 首頁測速確認視窗裡推的桌面程式（Windows 下載）。
 * 訪客連測三次以上才會看到 —— 這麼愛玩，就給他別的玩。
 * 網頁上能直接玩的工具之後另外整理，先不放進來。
 * 一樣只連公開的專案頁。
 */
export const desktopApps: BrandTool[] = [
  {
    name: '聲聲慢',
    blurb: '用講的打字，本機中文語音輸入',
    url: 'https://jeffrey0117.github.io/SpeakSlow/',
  },
  {
    name: 'DuckShot',
    blurb: '截圖加文字辨識',
    url: 'https://jeffrey0117.github.io/jeffrey-apps/work/DuckShot/',
  },
  {
    name: 'ReVid',
    blurb: '看片學語言的播放器',
    url: 'https://jeffrey0117.github.io/ReVid/',
  },
];

/**
 * footer 精選的姊妹工具。
 *
 * 刻意只放 6 個：每頁外連太多會稀釋權重，也會讓 footer 比內容還長。
 * 完整清單在作品站，footer 最後一格會連過去。
 * 挑選標準 = 測速訪客（一般使用者，不是工程師）真的會想點的東西。
 *
 * ⚠️ 一律連公開的專案頁（github.io），不要改成自架服務的直連網址。
 * 這是 public repo，寫進來等於把自架主機名公開；而且權重集中在作品站
 * 那一叢才是 hub-and-spoke 該有的樣子。專案頁上自然會連到實際服務。
 */
export const siblingTools: BrandTool[] = [
  {
    name: 'Pokkit',
    blurb: '丟檔案拿短網址',
    url: 'https://jeffrey0117.github.io/pokkit/',
  },
  {
    name: 'RawTxt',
    blurb: '貼文字拿網址',
    url: 'https://jeffrey0117.github.io/jeffrey-apps/work/RawTxt/',
  },
  {
    name: 'Readdy',
    blurb: '純文字變好讀',
    url: 'https://jeffrey0117.github.io/jeffrey-apps/work/readdy/',
  },
  {
    name: '聲聲慢 SpeakSlow',
    blurb: '本機中文語音輸入',
    url: 'https://jeffrey0117.github.io/SpeakSlow/',
  },
  {
    name: 'DuckShot',
    blurb: '截圖加文字辨識',
    url: 'https://jeffrey0117.github.io/jeffrey-apps/work/DuckShot/',
  },
  {
    name: 'SimPPT',
    blurb: 'Markdown 直接當簡報',
    url: 'https://jeffrey0117.github.io/jeffrey-apps/work/SimPPT/',
  },
];
