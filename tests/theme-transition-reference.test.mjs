import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const runtime = await readFile('src/components/ThemeTransitionRuntime.astro', 'utf8');
const layout = await readFile('src/layouts/MainLayout.astro', 'utf8');

test('shared layout mounts the dedicated reference theme transition runtime', () => {
  assert.match(layout, /ThemeTransitionRuntime/);
  assert.match(layout, /<ThemeTransitionRuntime\s*\/>/);
});

test('theme change uses the reference top-to-bottom wipe timing', () => {
  assert.match(runtime, /const wipeDuration = 300/);
  assert.match(runtime, /clipPath: 'inset\(0 0 100% 0\)'/);
  assert.match(runtime, /clipPath: 'inset\(0 0 0 0\)'/);
  assert.match(runtime, /cubic-bezier\(\.4, 0, \.2, 1\)/);
  assert.match(runtime, /::view-transition-new\(root\)/);
});

test('theme transition stages browser chrome before the page wipe and remains resilient', () => {
  const browserSync = runtime.indexOf('syncBrowserTheme(nextTheme);');
  const transitionStart = runtime.indexOf('startViewTransition(() => commitTheme(nextTheme))');
  assert.ok(browserSync >= 0 && transitionStart > browserSync);
  assert.match(runtime, /transitionInFlight/);
  assert.match(runtime, /localStorage\.setItem\('theme', theme\)/);
  assert.match(runtime, /prefers-reduced-motion: reduce/);
});

test('reference runtime captures the toggle before the legacy header listener', () => {
  assert.match(runtime, /closest\('\.portal-theme-toggle'\)/);
  assert.match(runtime, /event\.stopImmediatePropagation\(\)/);
  assert.match(runtime, /true\s*\n\s*\);/);
});
