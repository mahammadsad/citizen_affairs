import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');

test('redundant utility strip is removed from the rendered presentation', () => {
  assert.match(header, /class="portal-utility"/);
  assert.match(layout, /:global\(\.portal-utility\)[\s\S]*display: none !important/);
});

test('mobile brand remains prominent without breaking the compact header', () => {
  assert.match(layout, /clamp\(136px, 42vw, 154px\)/);
  assert.match(layout, /max-height: 50px !important/);
  assert.match(layout, /:global\(\.portal-mobile-panel\)[\s\S]*top: 68px !important/);
  assert.doesNotMatch(layout, /width: 118px/);
});

test('desktop brand also receives a professional readable size', () => {
  assert.match(layout, /clamp\(158px, 18vw, 184px\)/);
  assert.match(layout, /max-height: 56px !important/);
});
