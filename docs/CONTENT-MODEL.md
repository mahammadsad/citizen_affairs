# Content model

All public records include language, translation group, slug, description, body, section, staff attribution, workflow/verification status, review dates, SEO, tags, sources and correction history.

Government Jobs add organization, post, notification, vacancies, qualification, age, pay, fees, dates, selection process, location, official notice/application links and recruitment status.

Welfare Schemes add ministry, scheme level, beneficiaries, benefits, eligibility/exclusions, documents, application process, portal, helpline, status and policy review dates.

Exams add conducting authority, notice, stage, dates, geography, eligibility/fee summaries, official action link and status. Public notices add issuing authority, notice/effective/expiry dates, geography, affected people, eligibility/fee summaries, exact notice link and status. Citizen services and alerts add their responsible authority, geography, current action/status and exact official evidence.

Draft-only Bengali starting contracts for jobs, exams, schemes, notices, services and alerts live in `templates/editorial/`. They remain outside the public Astro collection until copied into a language draft directory. Every copy starts fail-closed and requires a current official source plus independent human review before publication.

The Astro schema in `src/content.config.ts` is the public snapshot contract. The PostgreSQL tables are the private working model. `scripts/export-approved-content.mjs` is the controlled mapping between them.

Only `jobs` and `projects` currently have active public category landing pages. The additional beat schemas and templates enable controlled private drafting; they do not activate unfinished public categories or assert that beat staffing exists.
