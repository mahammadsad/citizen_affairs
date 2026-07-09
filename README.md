# সরকারি তথ্যকেন্দ্র — Astro মাইগ্রেশন

একটি আধুনিক Astro-ভিত্তিক সরকারি তথ্য প্রকাশনা প্ল্যাটফর্ম। মার্কডাউন কনটেন্ট সংগ্রহ, Decap CMS ব্যবস্থাপনা, এবং স্বয়ংক্রিয় GitHub Pages স্থাপনা সহ।

পশ্চিমবঙ্গ ও ভারতের সরকারি চাকরি, প্রকল্প, পরীক্ষা ও নোটিশের তথ্য সহজ বাংলা ভাষায় জানানোর জন্য একটি কমিউনিটি প্ল্যাটফর্ম।

## 🚀 বৈশিষ্ট্য

- ✅ **Astro ২ (স্থিতিশীল, `^2.10.15`-এ পিন করা)**
- ✅ **মার্কডাউন সংগ্রহ** — নমনীয় কনটেন্ট ম্যানেজমেন্ট
- ✅ **গতিশীল রুটিং** — নিবন্ধ, বিভাগ, ট্যাগ, লেখক পৃষ্ঠা
- ✅ **Decap CMS** — গিটহাব-চালিত CMS, সম্পাদকীয় ওয়ার্কফ্লো
- ✅ **স্বয়ংক্রিয় SEO** — স্কিমা, ওপেন গ্রাফ, সাইটম্যাপ, RSS
- ✅ **ছবি অপ্টিমাইজেশন** — WebP, প্রতিক্রিয়াশীল আকার, অলস লোডিং
- ✅ **অনুসন্ধান** — ক্লায়েন্ট-পক্ষ, তাৎক্ষণিক, কোনো ব্যাকএন্ড নেই
- ✅ **GitHub অ্যাকশন** — স্বয়ংক্রিয় নির্মাণ এবং স্থাপনা
- ✅ **সম্পূর্ণ অ্যাক্সেসযোগ্য** — WCAG AA, বাংলা-প্রথম
- ✅ **প্রতিক্রিয়াশীল ডিজাইন** — মোবাইল-প্রথম, ডার্ক মোড

## 📁 প্রকল্প কাঠামো

```
src/
  ├── components/        # Astro components & islands
  ├── layouts/          # Page layouts
  ├── pages/            # File-based routing
  ├── content/
  │   ├── articles/     # Blog posts
  │   ├── authors/      # Author data
  │   └── categories/   # Categories
  ├── lib/              # Utilities & helpers
  ├── utils/            # Constants & config
  └── styles/           # CSS

public/
  ├── admin/            # Decap CMS
  └── uploads/          # Images
```

## 🛠️ স্থানীয় সেটআপ

```bash
# সংগ্রহস্থল ক্লোন করুন
git clone https://github.com/mahammadsad/sarkari-tathya-kendra.git
cd sarkari-tathya-kendra

# নির্ভরতা ইনস্টল করুন
npm install

# উন্নয়ন সার্ভার চালান
npm run dev

# উৎপাদনের জন্য নির্মাণ করুন
npm run build
```

## 📝 কনটেন্ট ম্যানেজমেন্ট

### মার্কডাউন আর্টিকেল

`src/content/articles/` এ মার্কডাউন ফাইল যোগ করুন।

### Decap CMS

`/admin` এ নেভিগেট করুন এবং গিটহাব দিয়ে লগইন করুন।

## 🚀 স্থাপনা

GitHub Pages-এ স্বয়ংক্রিয় স্থাপনা (`main` পুশে)।

## 📄 লাইসেন্স

MIT

---
logo you originally uploaded.** Your uploaded logo included the State Emblem of India (the
four-lion Ashoka Capital + "সত্যমেব জয়তে"). That emblem's use is legally restricted to official
government bodies under the *State Emblem of India (Prohibition of Improper Use) Act, 2005*, so I
designed a new "information hub" mark instead (`assets/logo-mark.svg`) — a bell/hub icon in the
same blue-green-orange palette, symbolizing the site's three community channels feeding into one
hub. I also added a small, honest disclaimer in the footer and a dedicated `disclaimer.html` page
stating clearly that this is an independent platform, not a government body. This protects both
you and your visitors — many well-known private "sarkari job" portals in India do the same. If you
want to adjust the wording or the mark itself, both are easy to edit (see below).

## Folder structure

```
├── index.html              # the whole one-page site (hero, about, community, services,
│                             articles, why-trust-us, FAQ, newsletter, contact, footer)
├── privacy.html            # Privacy Policy page
├── terms.html              # Terms of Use page
├── disclaimer.html          # Disclaimer page (independence from government, source of info)
├── robots.txt
├── sitemap.xml
├── css/
│   └── style.css           # all styles: design tokens, components, dark mode, responsive rules
├── js/
│   └── script.js           # mobile menu, dark mode, search filter, FAQ accordion, scroll
│                             reveal, back-to-top, newsletter form (frontend only)
└── assets/
    ├── logo-mark.svg        # original logo mark (also used as favicon)
    ├── favicon-32.png
    ├── favicon-180.png
    ├── favicon-512.png
    ├── og-image.jpg         # 1200×630 social share image (Open Graph / Twitter Card)
    └── fonts/                # Hind Siliguri .ttf files — used ONLY to generate og-image.jpg
                                locally; the live site loads fonts from Google Fonts CDN, so
                                these two files are not required for deployment and can be
                                deleted from the repo if you want a smaller footprint.
```

## Design system

| Token | Value |
|---|---|
| Primary Blue | `#0A4D8C` |
| Dark Navy | `#08315C` |
| Government Green | `#138A36` |
| Accent Orange | `#F39C12` |
| White | `#FFFFFF` |
| Light Gray | `#F5F7FA` |
| Display font | Noto Serif Bengali (headings — editorial/gazette feel) |
| Body font | Hind Siliguri (body copy, UI, buttons) |

All colors, spacing, radii, and shadows are defined as CSS custom properties at the top of
`css/style.css` under `:root` (and overridden under `[data-theme="dark"]`). Change a value there
and it updates everywhere.

## Accessibility notes

- **Text contrast**: the brand green (`#138A36`) fails WCAG AA (4.5:1) when used as text on our
  light backgrounds — it measures 3.5–4.4:1 depending on where it sits, in both light and dark
  mode. It's still used as-is for icons, dots, and tinted badge backgrounds (those only need the
  3:1 non-text minimum, which it clears comfortably). But anywhere it's actual text — section
  eyebrow labels, the navbar tagline, the "WhatsApp Channel" button, article category tags — it
  now uses a dedicated `--color-green-text` token instead (`#10742D` in light mode, `#17A942` in
  dark mode), verified ≥4.5:1 against every background it actually appears on.
- **Focus trap**: the mobile menu and search overlay both trap Tab/Shift+Tab focus while open
  (see `trapFocus()` in `js/script.js`), so keyboard users can't tab out into the page hidden
  behind them. Escape closes either and returns focus to the button that opened it; clicking a
  link inside lets focus move naturally to the destination instead of snapping back.

## Deployment status

1. **Domain**: set to `https://mahammadsad.github.io/sarkari-tathya-kendra/` across `index.html`
   (canonical, Open Graph, Twitter Card, both JSON-LD blocks), `privacy.html`, `terms.html`,
   `disclaimer.html`, `robots.txt`, and `sitemap.xml`. This assumes the GitHub repo is named
   `sarkari-tathya-kendra` under the `mahammadsad` account — **if you create the repo under a
   different name, or move to a custom domain later, all of the same 6 files need the URL updated
   again** (a simple find-and-replace for the old string works either way).
2. **Contact email**: set to `contact.mahammadsad@gmail.com` in the Contact section of
   `index.html`.
3. **Newsletter form**: still frontend-only by choice — shows a simulated success message but
   sends nothing anywhere yet. The full loading/success/error flow (including a proper error
   message if a request fails, and keeping the visitor's typed email so they don't retype it) is
   already built and tested — it's just gated behind an empty `NEWSLETTER_ENDPOINT` constant near
   the top of the newsletter section in `js/script.js`. Set that to your provider's submit URL
   (Mailchimp, Buttondown, Formspree, etc.) whenever you're ready and the real flow activates
   automatically.

## Deploying to GitHub Pages

1. Create a GitHub repository named `sarkari-tathya-kendra` under the `mahammadsad` account (the
   domain throughout this project already assumes that exact name — see "Deployment status"
   above). If you use a different repo name or a custom domain instead, update the 6 files listed
   above to match.
2. Push this folder to that repository.
3. Repo → Settings → Pages → Source: deploy from the `main` branch, root folder.
4. Your site will be live at `https://mahammadsad.github.io/sarkari-tathya-kendra/`.

## Extending later (future-ready structure)

The original brief scoped this build to the homepage + supporting SEO/legal files. Not yet built,
but designed to slot in cleanly later:

- Individual article pages, category pages, tag pages, an archive page, and a dedicated search page
- Breadcrumbs, author byline, related-posts, share buttons, reading-progress bar, and a
  table-of-contents component for long-form articles
- A real backend/CMS (if you outgrow static Markdown-style articles) — the CSS is written in
  plain, componentized classes specifically so it's easy to port into Astro, Next.js, or Hugo
  later without a redesign.

## Optional: persist dark mode across visits

Dark mode currently defaults to the visitor's system preference each time the page loads (it
doesn't persist a manual toggle). To persist it on your live, self-hosted site, replace the
`setTheme` calls in `js/script.js` with:

```js
localStorage.setItem('theme', mode); // when setting
localStorage.getItem('theme');       // when reading on load
```

(Not included by default because it isn't reliable inside sandboxed preview environments — but
works normally on real GitHub Pages hosting.)
