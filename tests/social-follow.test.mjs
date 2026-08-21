import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const constants = await readFile('src/utils/constants.ts', 'utf8');
const component = await readFile('src/components/SocialFollow.astro', 'utf8');
const footer = await readFile('src/components/Footer.astro', 'utf8');
const mobileRuntime = await readFile('src/components/MobileNavigationRuntime.astro', 'utf8');
const header = await readFile('src/components/PortalHeader.astro', 'utf8');

const socialUrls = [
  'https://x.com/citizenaffairIn',
  'https://www.facebook.com/profile.php?id=61593098155563',
  'https://whatsapp.com/channel/0029Vb8NQAX9cDDTfaEDwk3r',
  'https://t.me/CitizenAffairsBangla'
];

test('Citizen Affairs social profiles are stored centrally', () => {
  socialUrls.forEach((url) => assert.match(constants, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.match(constants, /x:/);
  assert.match(constants, /facebook:/);
});

test('footer renders an accessible multilingual social-follow strip after primary navigation', () => {
  assert.match(component, /Follow Citizen Affairs on/);
  assert.match(component, /সিটিজেন অ্যাফেয়ার্সকে অনুসরণ করুন/);
  assert.match(component, /Citizen Affairs को फ़ॉलो करें/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.match(component, /aria-label=/);
  assert.match(component, /focus-visible/);
  assert.match(component, /width: 48px/);

  const socialPosition = footer.indexOf('<SocialFollow');
  const footerNavigationPosition = footer.indexOf('<div class="container footer-main">');
  const footerBottomPosition = footer.indexOf('<div class="container footer-bottom">');
  assert.ok(footerNavigationPosition > -1 && socialPosition > footerNavigationPosition);
  assert.ok(footerBottomPosition > socialPosition);
});

test('official brand shapes are used while the footer keeps one focused MCQ community link', () => {
  assert.match(component, /M14\.234 10\.162 22\.977 0/);
  assert.match(component, /M9\.101 23\.691v-7\.98/);
  assert.match(component, /M17\.472 14\.382/);
  assert.match(component, /M11\.944 0A12 12/);
  assert.match(footer, /MCQ Group/);
  assert.match(footer, /MCQ গ্রুপ/);
  assert.match(footer, /MCQ समूह/);
  assert.equal((footer.match(/SOCIALS\.telegramMCQ/g) || []).length, 1);
});

test('mobile menu stays focused on navigation instead of duplicating social destinations', () => {
  socialUrls.forEach((url) => assert.doesNotMatch(mobileRuntime, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
  assert.doesNotMatch(mobileRuntime, /portal-mobile-social|portal-mobile-social-link|socialAriaLabel/);
  assert.match(header, /route\('search'\)/);
  assert.match(header, /route\('saved'\)/);
  assert.match(header, /portal-menu-theme-toggle/);
});
