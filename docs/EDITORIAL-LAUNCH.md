# Citizen Affairs editorial launch runbook

This guide is for the owner and editors preparing Citizen Affairs content. It keeps drafting simple while preserving the protected fact-check, approval, deployment and live-verification controls.

## Current launch goal

Build a useful Bengali-first public inventory with at least two current articles in each portal section:

1. Government Jobs
2. Admissions, Exams & Results
3. Education & Scholarships
4. Welfare Schemes & Benefits
5. Citizen Services
6. Citizen Alerts & Notices
7. Citizen Guides

The initial launch target is 14 public articles. English and Hindi translations should follow only for the strongest nationally relevant articles. Do not translate weak or time-sensitive material merely to fill a language directory.

## What the draft editor can do

The `/admin/` page opens Pages CMS. It can create and edit hidden article drafts in English, Bengali or Hindi.

Every new record is forced to start with:

- `contentType: explainer`
- `workflowStatus: draft`
- `draft: true`
- `verificationStatus: under-verification`

The draft editor does not expose reviewer, fact-checker, approver or publisher controls. It cannot publish directly.

## Preparing a draft

1. Choose the correct language and portal section.
2. Use a lowercase English URL slug with hyphens.
3. Write a clear title and a one- or two-sentence factual summary.
4. Add at least one official government or issuing-authority URL.
5. Record the date the source was checked.
6. Add a later `nextReviewDate`.
7. Leave a deadline blank for evergreen guides.
8. Use an official action URL only when it is safe, current and directly supported by the source.
9. Explain uncertainty instead of guessing.
10. Save the article as a draft.

## Official-source checklist

Before an article can be considered for publication, confirm:

- the issuing authority is identifiable;
- the URL belongs to the relevant government department, statutory body, institution or authorised service portal;
- the notice number, publication date and current status have been checked where applicable;
- later corrections, extensions, cancellations or withdrawals have been searched for;
- application, payment and login links come from the official source;
- deadline, eligibility, fee, vacancy, benefit and document claims are explicitly supported;
- no AI-generated statement is being treated as evidence;
- the source-check date and next review date are recorded.

A `.gov.in` or `.nic.in` ending is useful but is not the only check. Confirm the website through the responsible authority or India.gov.in directory where appropriate.

## Protected review sequence

A safe publication should move through these stages:

1. **Draft** — hidden from the website.
2. **Submitted/editorial review** — structure, usefulness and plain language are checked.
3. **Fact-checking** — an independent reviewer verifies every material claim against official sources.
4. **Copy/final review** — dates, links, image text, disclaimers, SEO fields and accessibility are checked.
5. **Approved** — the immutable approved snapshot is ready for the protected publication workflow.
6. **Publication pull request** — all repository, security, content, build and browser checks must pass.
7. **Merged** — the content entered `main`; this is not proof of deployment.
8. **Deployed** — GitHub Pages serves the expected commit.
9. **Verified live** — exact-commit production browser checks pass.

Do not manually change a draft to public to skip these stages.

## Publication requirements

Public content must have:

- `draft: false`;
- an allowed public workflow state such as `published` or `corrected`;
- at least one valid official source;
- a current verification date;
- a future review date;
- no expired opportunity incorrectly marked open;
- the correct active category;
- a valid author profile;
- image alt text and optimised image files when an image is used;
- independent fact-check details when marked officially confirmed.

The CI content validator and editorial readiness audit enforce these contracts.

## Translation policy

Use the same `translationKey` for related language versions. Each language has its own URL slug, title, summary and body.

Translate only after the source article is strong enough to publish. Recheck dates, currency, official names and action links in every language. A translation must not introduce claims absent from the verified source version.

## Freshness and expiry

For every public article:

- set `lastVerified` to the latest official-source check;
- set `nextReviewDate` according to how quickly the information may change;
- use short review intervals for jobs, admissions, alerts and service interruptions;
- check deadline-based records before their closing date;
- remove expired opportunities from discovery rather than deleting historical pages;
- mark cancelled or withdrawn information immediately;
- record material corrections in the update or correction history.

The build produces freshness and launch-readiness reports. Warnings require editorial follow-up even when they do not block a draft-only pull request.

## Safe handling of the initial seven drafts

The Phase 13 starter drafts cover all seven sections. They are research-backed but intentionally hidden and under verification. Their purpose is to seed the review queue, not to create instant public content.

For each starter draft:

1. reopen every official source;
2. confirm the wording still matches the source;
3. replace generic guidance with precise current information only where supported;
4. assign an independent fact checker;
5. add or optimise an editorial image only when it helps citizens;
6. approve and publish through the protected workflow one article at a time.

## Actions the owner must not take

- Do not force-push `main`.
- Do not upload a replacement site manually to GitHub Pages.
- Do not bypass failed validation checks.
- Do not publish directly from Pages CMS.
- Do not expose Supabase service credentials or editorial tokens in public files.
- Do not accept a social-media post, AI answer or third-party blog as the sole source.
- Do not advertise a deadline, vacancy, benefit or eligibility condition that has not been verified.

## When a check fails

1. Open the failed GitHub Actions job.
2. Read the first failing validation step.
3. Correct the draft or configuration on its branch.
4. Rerun the complete pull-request pipeline.
5. Merge only when all required checks pass.
6. After merge, wait for the separate deployment and exact-commit production verification.

Never treat a merged pull request as automatically live.
