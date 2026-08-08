# Current operational status

Last verified: 2026-08-08. This is the current status source; older audit and implementation reports are historical snapshots.

| Area | Current state | Accountable owner | Evidence / boundary |
|---|---|---|---|
| Public runtime | Static Astro output on the existing GitHub Pages path | Mahammad Sad | `astro.config.mjs`, deploy workflow; no runtime database required |
| Publication path | Human-reviewed branch and pull request to `main`; deployment workflow after merge | Mahammad Sad | `docs/RELEASE_PROCESS.md`; no auto-merge |
| Editorial automation | Official-source research to private draft PR only; Bengali default | Mahammad Sad | `automation/`, `generate-review-drafts.yml` |
| Public data collection | Disabled; correction/contact route prepares email | Mahammad Sad | No public form endpoint, uploads, accounts, analytics, or newsletter |
| Supabase | Blueprint/future integration, not required by public runtime | Unassigned until trigger | Must remain fail-closed until two real editorial users and approval exist |
| Search Console | External follow-up not performed by repository work | Owner action | `docs/SEARCH-CONSOLE-RECRAWL.md` |
| Corrections | Ticket schema and public material ledger ready; no completed real drill | Correction owner unappointed | `docs/CORRECTIONS.md`; operational proof blocked |
| Security | Static attack surface and private email reporting; one indirect `nanoid` advisory tracked | Mahammad Sad | Root `SECURITY.md`; no bounty claim |
| Recovery | Repository/build recovery documented; real domain/GitHub restore drill outstanding | Owner + emergency admin unappointed | `docs/BACKUP-RECOVERY.md`, owner register |

## Incident and restore state

No incident is declared in this checkpoint. A repository rollback can use the last known production commit through the normal deployment path. A full restore test covering GitHub administration, domain/DNS, credentials, and a second administrator has not been completed and must not be represented as complete.

## Known blockers

Independent reviewer, correction SLA owner/drill, legal publisher/ownership/funding declarations, privacy/legal review, emergency administrator, Search Console recrawl, field performance evidence, repository licence choice, and the indirect dependency advisory remain open in `docs/OWNER_ACTIONS_WORLD_CLASS.md` and `docs/WORLD_CLASS_REMEDIATION.md`.
