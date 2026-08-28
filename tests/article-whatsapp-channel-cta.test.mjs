import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const component = await readFile('src/components/ArticleWhatsAppChannelCTA.astro', 'utf8');
const englishRoute = await readFile('src/pages/articles/[slug].astro', 'utf8');
const localizedRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');

test('article WhatsApp CTA maps each locale to its own channel', () => {
  assert.match(component, /en:[\s\S]*0029VbEBWWNHwXb2suA0tf0r/);
  assert.match(component, /bn:[\s\S]*0029Vb8NQAX9cDDTfaEDwk3r/);
  assert.match(component, /hi:[\s\S]*0029VbDMfavLikgC8qYfCM2t/);
});

test('WhatsApp CTA is localized and communicates the privacy benefit', () => {
  assert.match(component, /Follow Citizen Affairs on WhatsApp/);
  assert.match(component, /WhatsApp-এ Citizen Affairs ফলো করুন/);
  assert.match(component, /WhatsApp पर Citizen Affairs को फॉलो करें/);
  assert.match(component, /Other followers cannot see your phone number/);
  assert.match(component, /অন্য ফলোয়াররা আপনার ফোন নম্বর দেখতে পাবেন না/);
  assert.match(component, /दूसरे फ़ॉलोअर्स आपका फ़ोन नंबर नहीं देख सकते/);
});

test('every current and future public article route automatically includes the CTA', () => {
  for (const route of [englishRoute, localizedRoute]) {
    assert.match(route, /import ArticleWhatsAppChannelCTA from '@components\/ArticleWhatsAppChannelCTA\.astro';/);
    assert.match(route, /<ArticleWhatsAppChannelCTA locale=\{locale\} \/>/);
  }
});

test('CTA uses one explicit external action and remains lightweight', () => {
  assert.match(component, /data-whatsapp-channel-link/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.doesNotMatch(component, /<img|https:\/\/.*\.(?:png|jpe?g|webp|svg)/i);
});
