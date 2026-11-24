import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://myspeedtest.isnowfriend.com',
  outDir: './dist',
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap({
      // tag 頁是薄內容（每頁 1–3 篇的列表），且佔了全站 URL 的四分之三。
      // 頁面本身帶 noindex, follow，權重照樣流向文章，但不該進 sitemap 稀釋可索引內容的比例。
      filter: (page) => !page.includes('/blog/tags/'),
    })
  ],
  build: {
    assets: 'assets'
  }
});
