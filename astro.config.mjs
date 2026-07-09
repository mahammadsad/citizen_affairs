import { defineConfig } from 'astro/config';
import image from '@astrojs/image';
import { rehypeImageAttrs } from './src/lib/rehype-image-attrs.mjs';

export default defineConfig({
  site: 'https://mahammadsad.github.io/sarkari-tathya-kendra',
  base: '/sarkari-tathya-kendra/',
  integrations: [image()],
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
