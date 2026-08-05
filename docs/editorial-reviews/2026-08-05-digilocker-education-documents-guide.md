# Editorial review: DigiLocker education documents guide

- **Article:** `src/content/articles/bn/use-digilocker-education-documents-safely.md`
- **Review date:** 2026-08-05
- **Next review:** 2026-09-05
- **Decision:** suitable for controlled publication as `partially-confirmed`
- **Public category:** Education (`materials`)

## Sources checked

1. DigiLocker About page — `https://www.digilocker.gov.in/web/about/about-digilocker`
2. DigiLocker FAQ — `https://www.digilocker.gov.in/web/about/faq`
3. DigiLocker Terms of Use — `https://www.digilocker.gov.in/web/about/tos`
4. DigiLocker QR verification portal — `https://verify.digilocker.gov.in/`
5. National Academic Depository FAQ — `https://nad.digilocker.gov.in/faq`

The DigiLocker platform is operated by the National e-Governance Division under the Ministry of Electronics and Information Technology, Government of India.

## Material findings

### Issued and uploaded documents are not the same

DigiLocker FAQ distinguishes documents issued electronically by registered agencies from files uploaded by users. Issued documents originate from the issuer's data source and appear in the Issued Documents section. Uploaded files are personal storage and do not become issuer-verified merely because they are stored in DigiLocker.

The draft already mentioned the difference but did not support it with structured official sources or explain the provenance boundary clearly enough.

### Legal-validity wording needs a boundary

DigiLocker states that documents issued through its system are deemed at par with physical originals under the applicable Information Technology Rules. The National Academic Depository gives the same guidance for issued academic awards.

This does not determine how every board, university, recruiter, counselling body or scholarship authority wants a document submitted. The revised guide therefore tells readers to follow the current admission or recruitment notice for file format, direct share, original verification or other process requirements.

### Verification is available through secure QR

DigiLocker provides an official QR verification portal and QR scanning in the official app. The article now explains that verification result, issuer details and document details must all be checked and warns against posting academic-document QR codes publicly.

### Account and sharing safety

Official FAQ and Terms describe consent-based sharing, activity logging, multifactor authentication and user responsibility for sharing. The revised guide warns against sharing OTP, PIN, login access, sensitive records or unnecessary documents and notes that NeGD does not charge for access to issued documents.

## Corrections made

- Replaced the draft-only introduction and status notice with a public citizen guide.
- Added five structured primary-source records.
- Added official QR verification instructions.
- Clarified issued versus uploaded document provenance.
- Qualified legal-validity language so it does not overrule institution-specific submission notices.
- Added a troubleshooting boundary between DigiLocker account/fetching problems and issuer record corrections.
- Expanded privacy, cyber-café, public-sharing and fake-app safety guidance.
- Kept the article unfeatured.

## Verification boundary

The review does not verify a specific student's marks, certificate, issuer database record or eligibility for an admission, scholarship or job. Availability differs by issuer, document type and year. Acceptance and submission procedures remain controlled by the receiving authority.

No separate human fact checker is registered in the repository. The article must therefore remain `verificationStatus: partially-confirmed`; it must not be labelled `officially-confirmed`.

## Publication safeguards

- `workflowStatus: published`
- `draft: false`
- `featured: false`
- official DigiLocker and National Academic Depository sources only
- next review scheduled after the verification date
- full content, build, SEO, link, security and responsive-browser checks required before merge
- exact deployed commit must pass production smoke verification before the article is described as verified live
