# Editorial review: Aadhaar update and status guide

- **Article:** `src/content/articles/bn/update-aadhaar-and-check-status-officially.md`
- **Review date:** 2026-08-05
- **Next review:** 2026-09-05
- **Decision:** publish after material corrections
- **Verification state:** `partially-confirmed`
- **Public category:** Citizen Services (`affairs`)

## Scope

The review checked the current UIDAI channels for address, mobile-number, POI/POA document, demographic and biometric updates. It also checked request tracking, centre requirements and the current myAadhaar document-update fee waiver.

## Material finding: the previous mobile rule was outdated

The hidden draft said mobile-number update required an enrolment or update centre. That is no longer complete.

UIDAI's current Aadhaar app guidance says an existing mobile number can be changed through the official app in supported scenarios using OTP verification, Face Authentication and the prescribed charge. Depending on the situation, OTP may be required on both the old registered number and the new number.

A centre remains necessary when:

- a mobile number is being registered for the first time;
- the Aadhaar number holder does not have access to the old registered mobile number;
- the required app verification cannot be completed; or
- UIDAI directs the request to an authorised centre.

The article now states this boundary explicitly and does not use the inaccurate absolutes “always online” or “never online.”

## Claims reconfirmed

- myAadhaar supports online address update and POI/POA document update with registered-mobile OTP.
- Address-update requests require a valid POA document and can be rejected after UIDAI verification.
- Successful online requests generate an SRN or acknowledgement used for tracking.
- Biometric updates require an authorised Aadhaar centre.
- Aadhaar centres can handle permitted demographic, mobile/email, document and biometric updates based on service availability.
- UIDAI says most update requests are completed within 30 days, but submission does not guarantee acceptance.
- POI/POA document submission through myAadhaar is fee-free through 14 June 2027 under the current UIDAI notice; centre document update currently costs ₹75.

## Corrections made

- Replaced the draft-only title and description.
- Changed `workflowStatus` to `published`, `draft` to `false` and verification to `partially-confirmed`.
- Added six structured primary-source records.
- Added the official Aadhaar app mobile-update scenarios.
- Added the first-time/no-old-mobile centre boundary.
- Separated address update, document update, mobile update and biometric update.
- Added current fee-waiver language with a recheck warning.
- Strengthened SRN/EID, rejection, OTP, Face Authentication, payment and public-sharing safety guidance.
- Kept the article unfeatured.

## Verification boundary

UIDAI interfaces, fees, accepted documents and available app services can change. The review does not verify an individual request, document, demographic correction or eligibility for an exception process.

No separate human fact checker is registered in the repository. The article must remain `partially-confirmed` and must not be described as an official UIDAI decision or personalised Aadhaar support.

## Publication safeguards

- current UIDAI and myAadhaar sources only;
- next review scheduled after the verification date;
- article remains unfeatured;
- three other starter articles remain hidden drafts;
- full content, build, SEO, link, security, dependency and responsive-browser checks required before merge;
- exact deployed commit must pass the no-retry production smoke suite before the article is described as verified live.
