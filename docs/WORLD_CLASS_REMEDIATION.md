# Citizen Affairs world-class remediation register

Baseline: audit commit `6aa662457e5aeaeb3f86b7d447bba01a12eaf646`, 8 August 2026. Statuses describe evidence, not aspiration. Operational and time-based goals cannot be completed by code alone.

| ID | Severity / phase | Category | Acceptance test | Status | Evidence | Owner / due |
|---|---|---|---|---|---|---|
| P0-1 unsafe visuals | P0 / 48h | repository | No unsafe/retired asset or reference; registered owned replacements; mobile/desktop review | owner-approved and verified | `src/assets/editorial/`, asset registry, `npm run validate:assets`; Mahammad Sad approved both viewports on 8 August 2026 | Owner / complete |
| P0-2 broken/private forms | P0 / 48h | repository + legal/privacy | No FormSubmit, cross-origin form, attachment field or spoofable success query in public output | verified locally | `ContactPage.astro`, `CareersPage.astro`, HTML validator and browser/unit tests | Engineering / current checkpoint |
| P0-3 unsupported careers | P0 / 48h | repository + owner decision | No role is open without complete approved requisition; no applicant collection | verified locally | `career-requisitions.mjs`, empty public requisition set and regression tests | Owner + engineering / current checkpoint |
| P0-4 newsroom overclaim | P0 / 48h | repository + editorial operation | Homepage/brand describe source-linked public-service publications and per-item status, not a continuous verified newsroom | verified locally | brand configuration, homepage, multilingual copy and generated-output scan | Editor / current checkpoint |
| E1 independent review gap | High / P1 | editorial operation | Every claimed confirmed item has a different real writer and reviewer with evidence | blocked | Existing content remains partially confirmed; owner action register | Owner / 14 days |
| E2 author identity mismatch | High / P1 | repository + owner decision | Visible byline, frontmatter and JSON-LD use one truthful accountability model | not yet due | Existing profile/schema audit finding retained | Owner + engineering / days 3–14 |
| E3 corrections ledger | High / P1 | repository + editorial operation | Ticket model, article note, central ledger and real completed drill | not yet due | Existing corrections schema/page; no records/drill | Editor / days 3–14 |
| E4 ownership/funding | High / P1 | owner decision + legal/privacy | Approved transparency facts published without placeholders | blocked | `OWNER_ACTIONS_WORLD_CLASS.md` | Owner/legal / 14 days |
| E5 AI visual governance | High / P0–P1 | repository + editorial operation | AI/visual policy covers images, captions, alt, translations and social; assets registered and reviewed | implemented—awaiting review | asset registry and visual checklist; policy extension remains P1 | Editor / P1 |
| E6 unused structured records | High / P2 | editorial operation | Real current job/exam/scheme records use structured schemas and official evidence | not yet due | Schemas exist; no artificial content added | Beat owners / 30 days |
| E7 translation-inflated count | High / P0 | repository + editorial operation | Metrics separate distinct stories from language editions | implemented—awaiting review | Remediation/KPI definition; no inflated public count retained | Editor / current + weekly |
| U1 duplicate landmarks | P0 / 48h | repository | Exactly one rendered `main`; inactive navigation has `hidden`/`inert` or CSS removal from tree | verified locally | component changes, `validate-html.mjs`, all-impact axe and keyboard checks at 390/1440 px | Engineering / current checkpoint |
| U2 weak visual truth tests | High / P0–P1 | repository + editorial operation | Source/domain/provenance gate plus human review; OCR claim only with reliable evidence | P0 verified; OCR unresolved | Asset validator, owner-approved registry and checklist; OCR explicitly unresolved | Engineering + editor / P1 OCR decision |
| U3 limited visual inventory | Medium / P2 | editorial operation | Six owned beat templates with crops and provenance | not yet due | Two P0 safe illustrations created; no false “six complete” claim | Designer/editor / 30 days |
| U4 basic search | Medium / P2 | repository + legal/privacy | Privacy-approved query learning, synonyms and zero-result backlog | blocked | Analytics intentionally off | Owner/privacy / 30–90 days |
| U5 Bengali-first policy | High / P1 | owner decision + editorial operation | English root retained; Bengali is default reporting/draft shift with measured targets | blocked | URL policy preserved; owner decision needed | Owner/editor / 14 days |
| U6 template overexpansion | High / now | editorial operation | No nonessential article-template expansion for 60 days | implemented—awaiting review | P0 changes limited to trust/privacy/accessibility | Owner / 60 days |
| S1 technical SEO | Keep | repository | Canonical/hreflang/schema/sitemap/feed regressions pass | verified locally | Full build, SEO, HTML and link validation passed at this checkpoint | Engineering / every release |
| S2 stale retired index | High / P0 external | external console | Search Console recrawl evidence and weekly clean-title monitoring | blocked | `SEARCH-CONSOLE-RECRAWL.md`; no external mutation authorised | Owner / 7 days + weekly |
| S3 News eligibility | Long-term | editorial operation | Current accountable reporting cadence and transparent bylines exist | not yet due | No markup-only completion claim | Editor / 90-day evidence |
| S4 Discover images/uniqueness | High / P0–P2 | repository + editorial operation | Safe 1200 px owned images and original useful content | P0 owner-approved | Two owner-approved 1200 px sources/derivatives; cadence pending | Editor / 30–90 days |
| S5 SEO operating loop | High / P1–P2 | external console | Weekly Search Console query/index/CTR record changes editorial decisions | blocked | KPI checklist only; no private console data | Owner/audience / weekly |
| P1 static performance strength | Keep | repository | Build budgets remain green and no heavy runtime added | verified locally | Performance budgets passed; Astro/Pages retained; no analytics/backend added | Engineering / every release |
| P2 field CWV absent | Medium / P2 | external console + legal/privacy | p75 LCP/INP/CLS by page/device/language from approved field source | blocked | Owner decision register; no field claim | Owner / 31–90 days |
| P3 legacy CSS/code | Low / later | repository | Evidence-led dead-code/CSS cleanup without rewrite | not yet due | Frozen behind P0/content priorities | Engineering / after 60 days |
| R1 response headers | Medium / decision trigger | external console | Header-capable hosting only when forms/accounts/backend justify it | not yet due | GitHub Pages retained; meta CSP and trigger documented | Owner/engineering / trigger-based |
| R2 dependency advisory | High build-chain | repository security | Risk owned, audit recorded, upstream-compatible fix adopted when available | resolved locally—awaiting CI | `nanoid` patched from 3.3.16 to 3.3.18 within PostCSS's existing range; full and production-only audits report zero vulnerabilities | Engineering / current checkpoint |
| R3 community/security metadata | Medium / P1 | repository + owner decision | Root security/contribution/templates/release docs; licence only after choice | not yet due | PR template exists; licence blocked in owner register | Owner/engineering / 30 days |
| R4 bus factor one | High / operational | owner decision | Emergency admin, hardware 2FA, recovery codes and restore drill evidenced | blocked | Owner action register; no fabricated administrator | Owner / 30 days |
| O1 Supabase blueprint only | Keep fail-closed | owner decision | Restore only after two real editorial users need roles/audits | not applicable with evidence | `/staff` and workflows remain fail-closed | Owner / trigger-based |
| O2 automation outcomes | High / P1 | repository + editorial operation | Distinct draft/no-candidate/source/fact-check/workflow outcomes and usefulness rate | not yet due | Human-only draft gate preserved | Engineering/editor / 14 days |
| O3 deployment churn | Medium / operation | editorial operation | Weekly release window and reduced avoidable deploy churn | blocked | Requires 30-day operational evidence | Owner / 30 days |
| O4 documentation drift | High / P1 | repository | One current operational-status document; old reports clearly historical | not yet due | Remediation register is current; full status doc remains P1 | Engineering / 14 days |
| O5 auto-merge disabled | Keep fail-closed | external console | Enable only with protection, reviewer separation and rollback drill | not applicable with evidence | No settings changed; prerequisites retained | Owner/admin / trigger-based |
| G1 owned audience loop | Medium / P2 | legal/privacy + product | Privacy-approved measured channel links, then consented newsletter/follows | blocked | No collection/tracking added | Owner/audience / 30–90 days |
| G2 no audience measurement | High / P2 | owner decision + legal/privacy | Approved event dictionary, disclosure and retention before instrumentation | blocked | Trackers remain off | Owner/privacy / 30–90 days |
| G3 sustainability | High / long-term | owner decision | Transparent 12-month funding model that cannot buy verification | blocked | Owner action register | Owner / 60 days |

## P0 release gates

- `npm run validate` and `npm run audit:secrets` pass in the supported environment.
- Generated output contains exactly one `main` per public document and no retired brand, FormSubmit action, unsafe filename or legacy success query.
- Both replacement assets pass source/metadata/dimension checks.
- Owner review is recorded for both replacement assets at 390 px and 1440 px; any later visual revision requires a fresh named review.
- Search Console, legal, staffing and private operational goals remain explicitly blocked rather than being presented as completed.

## Resolved security checkpoint: Astro build chain

The audit baseline recorded five high-severity dependency paths through Astro/Vite/PostCSS/`nanoid`/`vitefu`, all rooted in `GHSA-2v37-7h3g-55p8`. On 8 August 2026, the transitive `nanoid` package was patched from 3.3.16 to 3.3.18 within PostCSS's existing `^3.3.16` range; Astro, Vite and application code were not changed. Both `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high` then reported zero vulnerabilities. No exception, forced upgrade or audit suppression was added. Keep the lockfile, pinned GitHub Actions and weekly dependency review; reopen this item if CI or a later audit differs.
