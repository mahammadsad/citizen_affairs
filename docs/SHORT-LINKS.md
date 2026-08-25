# Citizen Affairs branded short links

Citizen Affairs uses `/go/<slug>/` as a branded sharing-link namespace. These routes issue permanent 301 redirects to the normal article URLs, so descriptive article URLs remain the canonical SEO destinations.

## Automatic links

Every public article is now included automatically when its workflow status is `published`, `corrected`, or `closed`, provided it is not a draft or withdrawn. The site generates a stable compact code from the article language and `urlSlug`, for example `/go/a1xyz23/`.

Article share controls use the preferred short URL automatically for:

- native device Share;
- WhatsApp;
- Telegram;
- Facebook;
- Copy Link.

Saved and recently viewed article records continue to use the canonical article URL. Canonical tags, sitemap entries, hreflang links, structured data and search URLs are not replaced by `/go/` links.

## Curated aliases

Important stories can keep memorable aliases. Curated aliases take priority over the generated code for sharing.

| Short link | Destination |
| --- | --- |
| `/go/sbi/` | `/articles/sbi-apprentice-result-2026/` |
| `/go/sbi-bn/` | `/bn/articles/sbi-apprentice-result-2026/` |
| `/go/sbi-hi/` | `/hi/articles/sbi-apprentice-result-2026/` |
| `/go/rrb/` | `/articles/rrb-ntpc-ug-cbt-1-result-2026/` |
| `/go/rrb-bn/` | `/bn/articles/rrb-ntpc-ug-cbt-1-result-2026/` |
| `/go/rrb-hi/` | `/hi/articles/rrb-ntpc-ug-cbt-1-result-2026/` |

## Adding a memorable alias

No manual work is required for normal future articles. To give a high-priority article a memorable alias, add one entry to `shortLinks` in `src/lib/short-links.mjs` with a short lowercase slug, root-relative canonical target and human-readable label. The automatic route generator will prefer that alias for the matching article.

Keep short-link targets free of UTM parameters and fragments. Campaign parameters can be added to a short URL when sharing, but they should not be stored in the permanent redirect registry.
