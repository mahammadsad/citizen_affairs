import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const articleRoute = await readFile('src/pages/[lang]/articles/[slug].astro', 'utf8');
const workspace = await readFile('src/components/ArticleDecisionWorkspace.astro', 'utf8');
const action = await readFile('src/components/OfficialActionLink.astro', 'utf8');
const changeHistory = await readFile('src/components/ArticleChangeHistory.astro', 'utf8');

test('article routes use the decision workspace and transparent change history', () => {
  assert.match(articleRoute, /import ArticleDecisionWorkspace from '@components\/ArticleDecisionWorkspace\.astro'/);
  assert.match(articleRoute, /import ArticleChangeHistory from '@components\/ArticleChangeHistory\.astro'/);
  assert.match(articleRoute, /<ArticleDecisionWorkspace/);
  assert.match(articleRoute, /correctionHistory=\{article\.data\.correctionHistory\}/);
  assert.match(articleRoute, /updateHistory=\{article\.data\.updateHistory\}/);
});

test('structured article types provide official actions and decision facts', () => {
  assert.match(articleRoute, /article\.data\.job\?\.officialApplicationUrl/);
  assert.match(articleRoute, /article\.data\.scheme\?\.officialPortal/);
  assert.match(articleRoute, /article\.data\.admission\?\.officialApplicationUrl/);
  assert.match(articleRoute, /article\.data\.scholarship\?\.officialPortal/);
  assert.match(articleRoute, /article\.data\.service\?\.officialPortal/);
  assert.match(articleRoute, /decisionQualification/);
  assert.match(articleRoute, /decisionDocuments/);
  assert.match(articleRoute, /new Set\(sourceLinks\)\.size/);
});

test('decision workspace is localized, actionable and accessible', () => {
  assert.match(workspace, /What you should check and do next/);
  assert.match(workspace, /এখন কী যাচাই করবেন এবং কী করবেন/);
  assert.match(workspace, /अब क्या जाँचें और अगला कदम क्या हो/);
  assert.match(workspace, /id="action-checklist"/);
  assert.match(workspace, /aria-labelledby="decision-workspace-title"/);
  assert.match(workspace, /OfficialActionLink/);
  assert.match(workspace, /data-action-safety/);
  assert.match(action, /target="_blank"/);
  assert.match(action, /rel="noopener noreferrer external"/);
  assert.match(action, /referrerpolicy="no-referrer"/);
  assert.match(workspace, /deadlineLabel\(deadlineStatus, locale\)/);
});

test('change history distinguishes editorial updates from formal corrections', () => {
  assert.match(changeHistory, /id="article-updates"/);
  assert.match(changeHistory, /Previous information/);
  assert.match(changeHistory, /সংশোধিত তথ্য/);
  assert.match(changeHistory, /बदलाव का कारण/);
  assert.match(changeHistory, /record\.incorrectInformation/);
  assert.match(changeHistory, /record\.correctedInformation/);
  assert.match(changeHistory, /record\.reason/);
  assert.match(changeHistory, /record\.sourceUrl/);
});
