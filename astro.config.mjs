// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeTableScroll from './src/plugins/rehype-table-scroll.mjs';

/** @type {import('katex').KatexOptions} */
const katexOptions = {
  // \htmlClass lets lesson math reuse the site's color classes (c-p, c-q, c-r, c-op).
  trust: (ctx) => ctx.command === '\\htmlClass',
  strict: false,
};

// Deployed to GitHub Pages at https://yalhojaily.github.io/algorithms/
export default defineConfig({
  site: 'https://yalhojaily.github.io',
  base: '/algorithms',
  trailingSlash: 'ignore',
  integrations: [react(), mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, katexOptions], rehypeTableScroll],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
