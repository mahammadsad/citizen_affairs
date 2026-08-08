# Search Console retired-brand cleanup

External console actions are not performed by repository code. Complete this checklist only through the verified Citizen Affairs Search Console property.

## One-time recrawl

- [x] Inspect and request indexing for `https://citizenaffairs.in/`.
- [x] Inspect and request indexing for `/about/`, `/team/`, `/bn/` and `/hi/`.
- [x] Inspect the main category and article index pages in each active language.
- [x] Resubmit `https://citizenaffairs.in/sitemap.xml`.
- [x] Confirm the submitted sitemap reports the current canonical domain and no retired-brand URL.

## Evidence recorded 2026-08-08

- The verified `citizenaffairs.in` domain property was used; no property or ownership setting was changed.
- The homepage, About page, Bengali homepage and Hindi homepage were indexed. Fresh indexing requests were accepted for all four.
- The Team page was unknown to Google. Its indexing request was accepted and added to the priority crawl queue.
- The English, Bengali and Hindi article hubs were indexed. The Bengali and Hindi Jobs hubs were indexed; the English Jobs hub was unknown to Google and its indexing request was accepted.
- `/articles/` was confirmed as the intentional `noindex` language redirect to `/en/articles/`; the canonical English article hub itself was indexed.
- `https://citizenaffairs.in/sitemap.xml` was submitted successfully. Search Console reported 80 discovered pages, and an independent live check found only `https://citizenaffairs.in/` URLs and no retired-brand URL or reference.
- Page indexing reported 33 indexed URLs and four excluded URLs: two redirects and two `noindex` pages. This matches the intentional redirect/noindex boundary at this checkpoint.
- The Search performance view still contained retired-brand queries. Exact private query metrics were not copied into the public repository; stale-identity monitoring therefore remains open.

## Weekly monitoring until clean

- [ ] Search indexed titles/snippets for the retired identity.
- [ ] Record affected URL, observed title, inspection result and recrawl date.
- [x] Record the initial excluded/indexed and canonical baseline on 2026-08-08; repeat weekly.
- [ ] Confirm homepage, About and Team show the current Citizen Affairs identity.

Do not change stable URLs merely to chase a stale snippet. Do not mark this complete until current Search Console evidence shows the stale identity has cleared.

Next review due: 2026-08-15. Compare query identity, CTR, indexed/excluded totals, unexpected canonicals and the queued Team/English Jobs URLs against this baseline.
