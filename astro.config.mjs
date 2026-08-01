import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeImageAttrs } from './src/lib/rehype-image-attrs.mjs';
import brand from './brand.config.json' with { type: 'json' };

const githubPagesUrl = 'https://mahammadsad.github.io/citizen_affairs';
const site = brand.domain ? brand.domain.replace(/\/$/, '') : githubPagesUrl;
const base = brand.domain ? '/' : '/citizen_affairs/';

export default defineConfig({
  site,
  base,
  compressHTML: true,
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeImageAttrs, { base }]] }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'nord',
      wrap: true,
    },
  },
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
