# Current operational status

Last verified: 2026-08-08. This is the current status source; older audit and implementation reports are historical snapshots.

P0 PR #163, P1 PR #164 and P2 PR #165 are merged and deployed. Their merge commits are `0893e991a7d3ff2597fde51e8d9af849e5c41676`, `c5f832c2e06e02503e81071fdc6a5c5cb8b3d224` and `a10ba75eec231202240c70360767b18c49cde0fd`. Later evidence and accessibility maintenance culminated in PR #169 at `32c952d24f2bd1314944a61eb7b50dbc40e07dce`; deploy/production-smoke run `31268142488` passed and the production health marker served that exact commit.

| Area | Current state | Accountable owner | Evidence / boundary |
|---|---|---|---|
| Public runtime | Static Astro output on the existing GitHub Pages path; P0–P2 release plus verified maintenance live | Publication owner | Production health served `32c952d24f2bd1314944a61eb7b50dbc40e07dce`; no runtime database required |
| Publication path | Human-reviewed branch and pull request to `main`; deployment workflow after merge | Publication owner | `docs/RELEASE_PROCESS.md`; no auto-merge |
| Editorial automation | Official-source research to private draft PR only; Bengali default | Publication owner | `automation/`, `generate-review-drafts.yml` |
| Public data collection | Disabled; correction/contact route prepares email | Publication owner | No public form endpoint, uploads, accounts, analytics, or newsletter |
| P2 service enablement | Deployed draft schemas/templates and operational specifications only | Publication owner | PR #165; six beats remain private; no tracking, newsletter, accounts, reminders or backend restored |
| Owned beat visuals | Six owner-approved, unassigned templates | Publication owner | 390 px and 1440 px approval recorded on 2026-08-08; article context still requires editorial review |
| Supabase | Blueprint/future integration, not required by public runtime | Unassigned until trigger | Must remain fail-closed until two real editorial users and approval exist |
| Search Console | One-time recrawl and sitemap submission complete; stale-brand clearance and weekly monitoring ongoing | Publication owner | Verified property used 2026-08-08; priority requests accepted; 80-URL sitemap succeeded; `docs/SEARCH-CONSOLE-RECRAWL.md` |
| Accessibility and browser QA | Live desktop keyboard pass complete; broader WCAG 2.2 AA and multi-browser/device review ongoing | Publication owner | PR #169; run `31268142488`; manual 1363 × 936 check confirmed skip link → focused `main` → first main-content link |
| Corrections | Ticket schema and public material ledger ready; no completed real drill | Correction owner unappointed | `docs/CORRECTIONS.md`; operational proof blocked |
| Security | Static attack surface and private email reporting; current dependency audits report zero vulnerabilities | Publication owner | `nanoid` 3.3.18 lockfile patch, root `SECURITY.md`; no bounty claim |
| Recovery | Repository/build recovery documented; real domain/GitHub restore drill outstanding | Owner + emergency admin unappointed | `docs/BACKUP-RECOVERY.md`, owner register |

## Incident and restore state

No incident is declared in this checkpoint. A repository rollback can use the last known production commit through the normal deployment path. A full restore test covering GitHub administration, domain/DNS, credentials, and a second administrator has not been completed and must not be represented as complete.

## Known blockers

Independent reviewer, correction SLA owner/drill, legal publisher/ownership/funding declarations, privacy/legal review, emergency administrator, Search Console stale-brand clearance and weekly evidence, broader manual WCAG 2.2 AA and multi-browser/device coverage, real KPI/field-performance evidence, and repository licence choice remain open in `docs/OWNER_ACTIONS_WORLD_CLASS.md` and `docs/WORLD_CLASS_REMEDIATION.md`.
