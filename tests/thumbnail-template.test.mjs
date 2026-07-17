import assert from 'node:assert/strict';
import test from 'node:test';
import { thumbnailHtml } from '../scripts/lib/thumbnail-template.mjs';

test('thumbnail template uses the exact supplied monogram and escapes model output', () => {
  const html = thumbnailHtml({
    title: '<script>unsafe</script>',
    organisation: 'Official & verified',
    highlight: '1,200 vacancies',
    monogramDataUrl: 'data:image/png;base64,exact-logo',
  });
  assert.match(html, /data:image\/png;base64,exact-logo/);
  assert.match(html, /&lt;script&gt;unsafe&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>unsafe<\/script>/);
  assert.match(html, /width:1200px;height:675px/);
});
