# Current operational status

Last verified: 2026-08-08. This is the current status source; older audit and implementation reports are historical snapshots.

P0 PR #163, P1 PR #164 and P2 PR #165 are merged and deployed. Their merge commits are `0893e991a7d3ff2597fde51e8d9af849e5c41676`, `c5f832c2e06e02503e81071fdc6a5c5cb8b3d224` and `a10ba75eec231202240c70360767b18c49cde0fd`. The P0–P2 GitHub release workflows passed, and the production health marker reported `status: ready` at the P2 merge commit.

| Area | Current state | Accountable owner | Evidence / boundary |
|---|---|---|---|
| Public runtime | Static Astro output on the existing GitHub Pages path; P0–P2 production release live | Mahammad Sad | Production health served `a10ba75eec231202240c70360767b18c49cde0fd`; no runtime database required |
| Publication path | Human-reviewed branch and pull request to `main`; deployment workflow after merge | Mahammad Sad | `docs/RELEASE_PROCESS.md`; no auto-merge |
| Editorial automation | Official-source research to private draft PR only; Bengali default | Mahammad Sad | `automation/`, `generate-review-drafts.yml` |
| Public data collection | Disabled; correction/contact route prepares email | Mahammad Sad | No public form endpoint, uploads, accounts, analytics, or newsletter |
| P2 service enablement | Deployed draft schemas/templates and operational specifications only | Mahammad Sad | PR #165; six beats remain private; no tracking, newsletter, accounts, reminders or backend restored |
| Owned beat visuals | Six owner-approved, unassigned templates | Mahammad Sad | 390 px and 1440 px approval recorded on 2026-08-08; article context still requires editorial review |
| Supabase | Blueprint/future integration, not required by public runtime | Unassigned until trigger | Must remain fail-closed until two real editorial users and approval exist |
| Search Console | External follow-up not performed by repository work | Owner action | `docs/SEARCH-CONSOLE-RECRAWL.md` |
| Corrections | Ticket schema and public material ledger ready; no completed real drill | Correction owner unappointed | `docs/CORRECTIONS.md`; operational proof blocked |
| Security | Static attack surface and private email reporting; current dependency audits report zero vulnerabilities | Mahammad Sad | `nanoid` 3.3.18 lockfile patch, root `SECURITY.md`; no bounty claim |
| Recovery | Repository/build recovery documented; real domain/GitHub restore drill outstanding | Owner + emergency admin unappointed | `docs/BACKUP-RECOVERY.md`, owner register |

## Incident and restore state

No incident is declared in this checkpoint. A repository rollback can use the last known production commit through the normal deployment path. A full restore test covering GitHub administration, domain/DNS, credentials, and a second administrator has not been completed and must not be represented as complete.

## Known blockers

Independent reviewer, correction SLA owner/drill, legal publisher/ownership/funding declarations, privacy/legal review, emergency administrator, Search Console recrawl, real KPI/field-performance evidence, and repository licence choice remain open in `docs/OWNER_ACTIONS_WORLD_CLASS.md` and `docs/WORLD_CLASS_REMEDIATION.md`.
