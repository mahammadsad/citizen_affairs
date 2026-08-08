# Owned visual template guide

Status: source-controlled templates approved by Mahammad Sad at 390 px and 1440 px on 2026-08-08. None is assigned to an article; every real assignment still requires contextual alt text, caption and evidence review.

| Registry ID | Beat | Visual cue | Crop guidance |
|---|---|---|---|
| `template-job-opportunity-v1` | Government jobs | notice sheet and briefcase | Keep the central card and briefcase inside the middle 70%; do not add vacancy counts or authority marks to the image. |
| `template-exam-update-v1` | Exams | paper, pencil and calendar | Preserve the paper/calendar relationship in 16:9 and centre crops; put dates in HTML, not the artwork. |
| `template-scheme-benefit-v1` | Schemes | open hand and benefit token | Keep the hand silhouette intact; do not imply guaranteed eligibility or payment. |
| `template-public-notice-v1` | Public notices | pinned notice sheet | Keep the pin and full paper edge visible; notice number/status belongs in HTML. |
| `template-citizen-service-v1` | Citizen services | service card and directional path | Preserve the card and action path; never draw or imitate an official portal. |
| `template-citizen-alert-v1` | Alerts | warning beacon and signal arcs | Keep the beacon centred with breathing space; urgency wording and expiry belong in HTML. |

## Use and review rules

- Default derivative is 1200 × 675; generated 768 × 432 and 480 × 270 versions must convey the same meaning.
- Keep critical shapes within the central 70% width and 72% height so social and card crops do not cut them off.
- The SVG must remain text-light: no embedded headline, date, fee, count, domain, logo, seal or trust badge.
- Alt text describes the illustration and its editorial purpose without repeating the headline. Captions disclose illustration status and AI assistance when the editorial policy requires it.
- Record the article assignment, named owner review, 390 px result, 1440 px result and review date in `src/data/editorial-assets.json` before publication.
- If a template is materially changed, reset both viewport flags and obtain fresh owner approval.
