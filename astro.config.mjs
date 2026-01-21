import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://myspeedtest.isnowfriend.com',
  outDir: './dist',
  devToolbar: {
    enabled: false
  },
  integrations: [
    sitemap()
  ],
  build: {
    assets: 'assets'
  }
});
