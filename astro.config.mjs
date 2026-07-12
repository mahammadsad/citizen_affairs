import { defineConfig } from 'astro/config';
import { rehypeImageAttrs } from './src/lib/rehype-image-attrs.mjs';
import brand from './brand.config.json' with { type: 'json' };

const githubPagesUrl = 'https://mahammadsad.github.io/sarkari-tathya-kendra';
const site = brand.domain ? brand.domain.replace(/\/$/, '') : githubPagesUrl;
const base = brand.domain ? '/' : '/sarkari-tathya-kendra/';

export default defineConfig({
  site,
  base,
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'nord',
      wrap: true,
    },
    rehypePlugins: [rehypeImageAttrs],
  },
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
