# Citizen Affairs branded short links

Citizen Affairs uses `/go/<slug>` as a branded sharing-link namespace. These routes issue permanent 301 redirects to the normal article URLs, so the descriptive article URL remains the canonical SEO destination.

## Current links

| Short link | Destination |
| --- | --- |
| `/go/sbi/` | `/articles/sbi-apprentice-result-2026/` |
| `/go/sbi-bn/` | `/bn/articles/sbi-apprentice-result-2026/` |
| `/go/sbi-hi/` | `/hi/articles/sbi-apprentice-result-2026/` |
| `/go/rrb/` | `/articles/rrb-ntpc-ug-cbt-1-result-2026/` |
| `/go/rrb-bn/` | `/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/` |
| `/go/rrb-hi/` | `/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/` |

## Adding a new short link

Add one entry to `src/lib/short-links.mjs` with a short lowercase slug, root-relative canonical target and human-readable label. The dynamic `src/pages/go/[slug].astro` route will generate the redirect automatically.

Keep short-link targets free of UTM parameters and fragments. Tracking parameters can be added when sharing the short URL if needed; they should not be stored in the permanent redirect registry.
