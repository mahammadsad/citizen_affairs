# Editorial visual publication checklist

Use this checklist for every featured image, thumbnail, chart, illustration and social crop. A repository check cannot prove editorial truth inside pixels; publication therefore requires both automated validation and a named human review.

## Automated gate

- Register the source and every derivative in `src/data/editorial-assets.json`.
- Record creator/source, reuse terms, AI assistance, creation date, associated article, editorial owner and review state.
- Run `npm run validate:assets`.
- Reject retired branding, unapproved third-party marks, official-looking insignia, embedded website domains, verification claims and critical text in the source artwork.
- Confirm every derivative is 16:9, has the registered dimensions and stays within the content image budget.

This source/metadata gate is not OCR. Reliable pixel OCR remains a later capability; the repository must not claim OCR coverage.

## Human review at 390 px

- [ ] The subject is immediately understandable without reading text inside the image.
- [ ] No small or malformed English, Bengali or Hindi text is present.
- [ ] No URL, government interface, third-party logo or official insignia can mislead a reader.
- [ ] The crop does not hide the central subject.
- [ ] Colour contrast and dark-mode surroundings remain clear.
- [ ] Alt text accurately describes the visual without repeating the headline or claiming verification.

## Human review at 1440 px

- [ ] The asset is sharp and free of generation artefacts, distorted objects or accidental marks.
- [ ] No documentary-looking person is presented as a real subject when the image is illustrative.
- [ ] The caption identifies an illustration where relevant.
- [ ] Creator/source and licence/reuse status are accurate.
- [ ] Dates, amounts, eligibility rules, deadlines and “verified” claims are absent from pixels.
- [ ] Social/lead/card crops preserve the same truthful meaning.

## Approval record

The human reviewer records their real name and review date in the asset registry, sets both viewport checks to `true`, and changes `reviewStatus` to `approved-by-owner`. Until then, the pull-request checklist must remain incomplete and the asset is not approved for remote publication.

P0 approval recorded: Publication owner approved `welfare-programmes-guide-v1` and `exam-document-safety-v1` at 390 px and 1440 px on 8 August 2026.
