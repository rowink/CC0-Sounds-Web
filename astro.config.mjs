import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cc0sounds.com',
  srcDir: './src',
  outDir: './dist',
  publicDir: './public',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: 'assets'
  }
});
