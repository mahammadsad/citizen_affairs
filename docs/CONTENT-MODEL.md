# Content model

All public records include language, translation group, slug, description, body, section, staff attribution, workflow/verification status, review dates, SEO, tags, sources and correction history.

Government Jobs add organization, post, notification, vacancies, qualification, age, pay, fees, dates, selection process, location, official notice/application links and recruitment status.

Welfare Schemes add ministry, scheme level, beneficiaries, benefits, eligibility/exclusions, documents, application process, portal, helpline, status and policy review dates.

The Astro schema in `src/content.config.ts` is the public snapshot contract. The PostgreSQL tables are the private working model. `scripts/export-approved-content.mjs` is the controlled mapping between them.

Only `jobs` and `projects` are active. Future fields may be added in new migrations and optional snapshot fields without exposing unfinished categories.
