# Contributing to Citizen Affairs

Citizen Affairs accepts focused corrections and improvements through pull requests. Do not add or imply legal, ownership, funding, staffing, sponsorship, government-affiliation, review, or verification facts without named evidence and approval.

## Before opening a pull request

1. Create a branch from the current `main` branch.
2. Keep the change focused and preserve English, Bengali, and Hindi routes.
3. For editorial content, cite primary official sources and keep automated work private and draft-only.
4. Never approve, fact-check, or publish your own article record.
5. Do not add tracking, advertising, data collection, forms, uploads, accounts, licences, or third-party processors without the recorded owner and privacy prerequisites.
6. Run `npm ci`, `npm run validate`, and `npm run audit:secrets`. For automation changes, also run `python -m pytest -q` from `automation/`.

Use the pull-request template. Explain what changed, why it is safe, reader impact, tests, and any owner or operational blocker. A passing check is not editorial approval. Pull requests remain human-reviewed and are not auto-merged.

Security vulnerabilities must follow [SECURITY.md](SECURITY.md), not a public issue. Material factual errors should use the email correction route on the site.
