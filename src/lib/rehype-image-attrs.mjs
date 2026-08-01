import { visit } from 'unist-util-visit';

/**
 * Adds loading="lazy" and decoding="async" to every <img> produced from
 * markdown content (e.g. ![alt](url) inside an article body).
 *
 * This is the "automatic image handling" that's actually achievable for
 * this project: article images are uploaded through Pages CMS into
 * public/uploads/... as plain files, and Astro's build pipeline only
 * optimizes (resizes/re-encodes) images imported from src/ — files in
 * public/ are always copied through unprocessed, by design. Real
 * binary optimization (@astrojs/image's <Image>/<Picture> components)
 * stays available in astro.config.mjs for any future src/-based assets,
 * but can't apply to editor-uploaded content without a much larger
 * architecture change. Deferring offscreen images and hinting async
 * decode is the safe, zero-risk win that applies universally instead.
 */
export function rehypeImageAttrs({ base = '/' } = {}) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      node.properties = node.properties || {};
      if (node.properties.loading === undefined) {
        node.properties.loading = 'lazy';
      }
      if (node.properties.decoding === undefined) {
        node.properties.decoding = 'async';
      }
      const source = node.properties.src;
      if (typeof source === 'string' && source.startsWith('/') && !source.startsWith('//')) {
        const normalized = source.replace(/^\/citizen_affairs\//, '/').replace(/^\/+/, '');
        node.properties.src = `${base}${normalized}`;
      }
    });
  };
}
