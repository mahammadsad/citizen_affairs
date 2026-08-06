# Editorial review: verification guides and welfare translations

- **Review date:** 2026-08-06
- **Next review:** 2026-09-06
- **Decision:** publish the two Bengali verification guides and the English/Hindi welfare translations
- **Verification state:** `partially-confirmed`

## Files reviewed

- `src/content/articles/bn/verify-government-job-notice-officially.md`
- `src/content/articles/bn/check-exam-admit-card-result-officially.md`
- `src/content/articles/en/india-major-welfare-schemes-official-guide.md`
- `src/content/articles/hi/india-major-welfare-schemes-official-guide.md`

## Government job notice guide

The review checked the guide against:

- the Staff Selection Commission Notice Board;
- the India.gov.in Government Web Directory;
- PIB Fact Check information and a current government warning about fraudulent recruitment;
- the National Cyber Crime Reporting Portal and its suspect-reporting facility.

The guide now treats the recruiting authority's own notice as the primary evidence, requires corrigendum and cancellation checks, separates official application fees from personal payment requests and points immediate cyber-financial-fraud victims to the official 1930/portal route.

The article does not verify a specific vacancy, eligibility decision or application status.

## Exam, admit-card and result guide

The review checked the guide against:

- the NTA homepage and Notice Board Archive;
- NTA's 10 June 2026 UGC-NET city-intimation notice, which states that the city slip is not the admit card;
- NTA's 9 June 2026 CUET (UG) provisional-answer-key and recorded-response notice;
- DigiLocker information about Issued Documents and its official QR verification utility.

The guide distinguishes city intimation, admit card, provisional answer key, recorded response, final key, score card and result. It also distinguishes issuer-provided DigiLocker documents from user uploads.

The article does not replace the latest notice for any individual examination.

## Welfare translations

The English and Hindi files use the same `translationKey`, official source list and approval boundaries as the Bengali article reviewed on 5 August 2026. They do not add new eligibility, payment, deadline or approval claims.

Material boundaries preserved in both translations:

- Jal Jeevan Mission 2.0 through December 2028;
- PMAY-G from FY 2024-25 through 2028-29;
- NFSA free-foodgrain decision for five years from 1 January 2024;
- PM POSHAN temporary continuation only until 30 September 2026 or the next approval date, whichever is earlier;
- no unsupported new long-term end date for AMRUT 2.0 or Samagra Shiksha.

## Verification boundary

No separate human fact checker is registered in the repository. These four articles must remain `verificationStatus: partially-confirmed` and must not be represented as an official government decision about an individual reader.

## Publication safeguards

- `workflowStatus: published`
- `draft: false`
- Government of India or issuing-authority sources only
- current `lastVerified` and future `nextReviewDate`
- content, build, SEO, link, dependency, security and browser checks required before merge
- exact deployed commit must pass production smoke verification before the work is described as verified live
