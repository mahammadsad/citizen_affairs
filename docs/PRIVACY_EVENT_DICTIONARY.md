# Proposed privacy-reviewed event dictionary

Status: **specification only; collection disabled**. No analytics script, endpoint, cookie, identifier or processor is authorised by this document. Owner and Indian privacy/legal approval are required before implementation.

| Event | Minimum fields | Purpose | Prohibited fields |
|---|---|---|---|
| `article_view` | page type, language, content ID, coarse timestamp | understand useful coverage | IP in product data, user ID, full referrer/query |
| `official_action_click` | content ID, action type, official destination host | measure safe handoff | destination path/query containing personal data |
| `save` | content ID, language, add/remove | assess local save usefulness | browser-storage contents or cross-device identity |
| `share` | content ID, channel class | understand sharing actions | recipient, message text or contact data |
| `search` | language, normalized query category, result count | improve findability | raw sensitive query without approved redaction/retention |
| `zero_result` | language, redacted query category | identify missing coverage | full query when it may contain personal data |
| `language_switch` | from/to language, page type | improve multilingual experience | persistent identity |
| `correction_contact` | content ID, route opened | measure access to correction route | report text, email address or source URL |
| `newsletter_signup` | consent version, language, acquisition surface | prove explicit consent if launched | email in analytics, inferred consent or pre-ticked state |

## Approval gate

Before any event is collected, record the controller/publisher, lawful purpose, processor and contract, collection endpoint, consent/notice decision, first-party identifier policy, IP handling, retention, deletion route, access roles, grievance contact, cross-border transfer assessment, security controls and a test proving disabled-by-default behaviour.

Prefer aggregate Search Console/CrUX data when it answers the question without adding general tracking. Do not fingerprint, join datasets, collect exact location, or claim anonymous measurement when re-identification remains possible.
