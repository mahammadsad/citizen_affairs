# Changelog

This file records reader-visible and operational release checkpoints. Dates use ISO 8601. Deployment evidence belongs in the pull request and operational status document.

## 2026-08-08 — Keyboard navigation verification

- Fixed the global skip link so it focuses the real main-content landmark and bypasses repeated navigation.
- Removed the nested `main` landmark and duplicate landmark ID from the 404 page.
- Added source-level and live-production regression checks for one main landmark and the keyboard skip destination.
- PR #169 deployed as `32c952d24f2bd1314944a61eb7b50dbc40e07dce`; deploy/production-smoke run `31268142488` passed.
- A manual live desktop check at 1363 × 936 confirmed that Tab focuses the skip link, Enter focuses `main#main-content`, and the next Tab reaches “All news” inside the main content. Broader WCAG 2.2 AA and multi-browser/device review remains open.

## 2026-08-08 — P0–P2 production release

P0 PR #163, P1 PR #164 and P2 PR #165 were merged sequentially and deployed. The production health marker reported `status: ready` at final merge commit `a10ba75eec231202240c70360767b18c49cde0fd`.

### P2 system enablement foundations

- Added fail-closed Bengali draft templates and structured validation for jobs, exams, schemes, notices, citizen services, and alerts.
- Added six text-light owned beat visuals with provenance, responsive derivatives, crop guidance, and owner approval at 390 px and 1440 px.
- Added source-monitoring SLAs plus privacy-gated event, Search Console KPI, newsletter, RUM, follows, Supabase, and hosting specifications without enabling data collection or accounts.

### P1 accountability and operations

- Named writer attribution and Person article schema.
- Fail-closed independent-review status and self-approval validation.
- Material-corrections ticket model, article notes, and central ledger.
- Transparency and AI/generated-media governance.
- Distinct automation outcomes, Bengali-first private drafts, and no draft auto-merge.
- Root security, contribution, conduct, issue, accessibility, release, and operational documentation.

### P0 trust, privacy, accessibility and visual governance

- Closed public trust, privacy, accessibility, unsupported-careers, and unsafe-visual gaps.
- Added owner-approved source-controlled editorial illustrations.
- Recorded remaining legal, staffing, Search Console, operational, and supply-chain blockers without claiming completion.
