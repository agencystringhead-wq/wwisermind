# Wisermind — Project Memory

Living notes for this build. Update it at the end of every frame/section.

## 1. Project

- **Stack:** Next.js 15 (App Router) + React 19 + TypeScript, plain CSS Modules (no UI framework).
- **Root:** `E:\mywork\1_work\claudecoding\2026\wwisermind`
- **Method:** the design is built **frame by frame** from screenshots the user provides, one section per round.
- **Commands**
  - `npm run dev` — local dev server (http://localhost:3000)
  - `npm run build` — production build
  - `npm run images` — convert `/images/*.png|jpg` → `/public/images/*.webp`

## 2. Hard rules (from the user)

1. **Container width is `1300px` for the whole site**, every frame/section. Token: `--container-width`, helper class `.container` (adds `20px` side gutters).
2. **Images must be WebP only.** Source PNG/JPG go in `/images`; `npm run images` converts them into `/public/images` as `.webp` (quality 90, alpha preserved, skips up-to-date files). Never reference a png/jpg in components.
3. Match the provided screenshot as closely as possible.
4. **Never commit the `images/` folder.** Source photos and the design screenshots in
   `images/designframes/` are local build material — they stay on disk but are git-ignored,
   so the public repo never carries them. Only the converted `public/images/*.webp` is
   committed, and that is all Cloudflare needs to serve the site.

## 3. Design tokens — `app/globals.css`

| Token | Value | Use |
| --- | --- | --- |
| `--container-width` | `1300px` | site container |
| `--container-gutter` | `20px` | side padding |
| `--color-black` / `--color-ink` | `#000000` | text, CTA background |
| `--color-white` | `#ffffff` | header background |
| `--color-cream` | `#f4f1eb` | announcement top bar |
| `--color-brand` | `#146ef5` | logo blue (sampled from `images/logo.png`), CTA hover |
| `--color-brand-dark` | `#0d55c9` | pressed/dark brand state |
| `--color-line` | `#e9e6e0` | hairline borders |
| `--color-muted` | `#5a5a5a` | secondary text |
| `--color-divider` | `#e0d9d3` | frame-02 hairline rule (sampled) |
| `--color-surface` | `#f5f5f5` | frame-04 grey block (sampled) |
| `--color-heading-muted` | `#939393` | greyed half of the section h2s (sampled) |
| `--color-body-muted` | `#808080` | frame-05 card captions (sampled) |
| `--color-brand-deep` | `#006fda` | frame-06 blue field + frame-04 dot (sampled) |
| `--color-brand-line` | `#2786f2` | frame-06 row outlines (sampled) |
| `--radius-pill` | `999px` | pill buttons |
| `--topbar-height` | `42px` | announcement bar |
| `--header-height` | `104px` | main header |

### Typography (global — applies to every frame)

**Typeface: `Inter` for the whole site** — loaded once in `app/layout.tsx` via
`next/font/google` (weights 400/500/600/700, `display: swap`) and exposed as
`--font-inter`; `--font-sans` points at it and `body` inherits it. Never import another
font in a section.

| Token | Value | Use |
| --- | --- | --- |
| `--fw-regular` | `400` | **all paragraph / body copy** |
| `--fw-medium` | `500` | nav links, small labels, top bar |
| `--fw-semibold` | `600` | buttons, and headings when the design looks 600 |
| `--fw-bold` | `700` | default heading weight |
| `--fw-heading` | `var(--fw-bold)` | what `h1`–`h6` use |
| `--fs-body` | `15px` | **global body / paragraph size** (set on `body`, `p`, `li`, `label`, `figcaption`) |
| `--fs-nav` | `15px` | header nav links + `Contact Us` |
| `--fs-topbar` | `14px` | announcement bar copy |
| `--lh-body` | `1.6` | body line-height |
| `--lh-heading` | `1.1` | heading line-height |
| `--tracking-heading` | `-0.02em` | heading letter-spacing (Inter needs the tightening) |

Global rules already set in `globals.css`:

- `body`, `p`, `li`, `label`, `figcaption` → **15px / regular (400)**, line-height 1.6
- Header nav + `Contact Us` → 15px (`--fs-nav`); announcement top bar → 14px (`--fs-topbar`);
  the black CTA pill stays 16px / semibold
- ⚠️ Because `p` carries an explicit `font-size`, inheriting from a wrapper won't work — set the
  size on the text element itself in a section module (see `.text` in `TopBar.module.css`)
- `h1`–`h6` → **bold (700)** by default, line-height 1.1, letter-spacing -0.02em, `text-wrap: balance`
- **Per-design override:** when a heading reads semibold in the screenshot, add the global
  helper class `fw-semibold` (helpers: `fw-regular`, `fw-medium`, `fw-semibold`, `fw-bold`)
  or set `font-weight: var(--fw-semibold)` in that section's module. Don't hardcode numbers.

## 4. File map

```
app/
  globals.css        design tokens + reset + .container
  layout.tsx         html shell, font, TopBar + Header + main
  page.tsx           home page — sections added frame by frame
components/layout/
  TopBar.tsx(.module.css)   cream announcement bar
  Header.tsx(.module.css)   logo + nav + actions (client: mobile menu)
components/sections/
  HeroTop.tsx(.module.css)     frame 02 — h1 + glow + rule + 3-col row
  HeroBanner.tsx(.module.css)  frame 03 — full-bleed banner + testimonial card
  HomeIntro.tsx(.module.css)   frame 04 — grey block, two-tone h2, project slider
  Problems.tsx(.module.css)    frame 05 — 3-up card slider with arrow controls
  Services.tsx(.module.css)    frame 06 — blue field, three outlined service rows
lib/site.ts          siteConfig, announcement copy, mainNav items
scripts/convert-images.mjs  png/jpg -> webp
images/              SOURCE images (png/jpg) — user drops files here
images/designframes/ design reference screenshots — NOT converted, NOT shipped
public/images/       generated webp — referenced by components
```

## 5. Frames built

### ✅ Frame 01 — Header (done)

Two stacked parts:

- **Top bar** — cream `#f4f1eb`, full-bleed background, content inside the 1300 container,
  centred 14px text (`--fs-topbar`, `--fw-medium` on the label + link): `New : We are accepting new clients for month of September 26 . Read`
  ("Read" is a link, underline on hover).
- **Main header** — white, `position: sticky; top: 0`, 3-column grid
  `auto minmax(0, 1fr) auto` = **logo | nav | actions**. The nav is centred inside the
  middle column, so the gap to the left of the nav always equals the gap to its right
  (don't go back to `1fr auto 1fr` — that centres the nav on the page and pushes it right
  because the actions column is wider than the logo):
  - logo `public/images/logo.webp`, 52px tall, links to `/`
  - nav: Services · Results · Who We Help · Pricing · About · Freebies · Tools — 15px (`--fs-nav`) / `--fw-medium`,
    36px gap, underline sweep on hover
  - actions: `Contact Us` text link + `Book Your Free Call` black pill
    (56px tall, 32px side padding, 16px / `--fw-semibold`; hover → brand blue + 1px lift)
- **Responsive:** ≤1180px tightens gaps/sizes; ≤1023px hides nav + actions, shows an
  animated burger and a drop-down panel (Escape closes, body scroll locked while open).

### ✅ Frame 02 — Hero top (done)

Source: `images/designframes/002herosectiontop.jpg` (reference only — the `designframes`
folder is skipped by `npm run images`). Built as
`components/sections/HeroTop.tsx` + `.module.css`, copy in `lib/site.ts` → `heroTop`.

**Design frame is 1912px wide with a 1639px container** (measured from the hairline rule,
which spans the container exactly). We rebuild it at **1300** → every horizontal value is
that design value × 0.793, expressed in % where possible. Vertical spacing is kept as
designed.

Structure inside `.container`:

1. **H1**, two lines (explicit `<br>`, hidden ≤640px):
   "Therapist websites and marketing / that quietly grow your practice."
   `clamp(30px, 4.2vw, 46px)` · 700 · line-height 1.2 · letter-spacing **-0.035em** · black.
2. **Glow** — the "shadow pattern": a soft blue radial blob behind line 2, centred at
   **22% of the container**, 70px below the section top, 400×160 with
   `rgba(120,200,255,.6)` core → transparent, `blur(18px)`. Sampled from the design:
   core `rgb(173,222,255)` on white ≡ `rgba(120,200,255,0.6)`. The design's asset also has a
   faint hard-edged rectangle around the blob (285→799px) — that is a PNG artifact and was
   deliberately not reproduced.
3. **Rule** — 1px `--color-divider` (`#e0d9d3`, sampled), full container width,
   40px above / 44px below.
4. **3-column row** — `grid-template-columns: 50% 25% 25%` (design measures 50.15 / 24.35 /
   25.5), no gap; the copy never fills a column:
   - **col 1** — uppercase label 15px/400 ("Calm, credible websites and marketing for"),
     then 13px uppercase links "Solo Therapists │ Group Practices." in `--color-brand`
     with a black pipe (`text-transform: uppercase` on sentence-case source text).
   - **col 2** — blue pill badge "Free Guide" (12px/700, 20px tall, 12px side padding —
     renders 95×20 vs the design's 96×20), then a 17px/700 heading, line-height 1.2.
   - **col 3** — 14px/400 paragraph, line-height 1.25, then an underlined 14px brand-blue
     link "Get the Free Guide".

**Known, accepted deltas from the design** (the design's display face is ~12% narrower than
Inter):

- H1 line 1 covers 54.8% of the container vs 51.4% in the design (line 2: 50.2% vs 46.6%).
  Font size was pulled 48px → 46px and tracking to -0.035em to close most of the gap.
- Col 3's paragraph wraps to 4 lines where the design (in a 418px column) has 3. Expected —
  the column is 325px at a 1300 container.
- The design copy is missing the closing quote in `a "content creator.` — added it.

### ✅ Frame 03 — Hero bottom banner (done)

Source: `images/designframes/003herosectionbottom.jpg` (1920px frame; the banner inside it
is **1904 × 975** with ~8px side margins and a ~28px radius — the frame *is* the whole
banner, cropped flush at its top edge). Built as `components/sections/HeroBanner.tsx`,
copy in `lib/site.ts` → `heroBanner`.

- **Banner** — full-bleed, `padding-inline: 10px` on the section, `border-radius: 20px`,
  `aspect-ratio: 1904 / 975`, `overflow: hidden`. Background is
  `public/images/hero-bg.webp` (from `images/hero-bg.jpg`, 555 kB → **83 kB**) via
  `next/image` `fill` + `object-fit: cover` + `priority`.
- **Everything inside is positioned in % of the banner**, so it scales with the banner at
  any width. Verified against the design:

  | | design | built |
  | --- | --- | --- |
  | banner aspect | 1.953 | 1.953 |
  | heading top (from banner top) | 60.6% | 60.2% |
  | link block bottom | 21.3% | 21.25% |
  | card right inset | 1.94% | 1.95% |
  | card bottom inset | 7.5% | 7.5% |
  | card size | 548×349 → 425×271 at 1512 | 425×275 |

- **Left column** — bottom-anchored (`bottom: 21%`) and horizontally aligned to the site
  container (in the design the text sits at the container's left edge too — 139px vs the
  container's 140.5px). h3 24px/600, line-height 1.22, white, 3 designed line breaks via
  `<br>` (dropped ≤1023px); "wwisermind" is an underlined link. Then
  `READ MY STORY` — 17px/600 uppercase, underlined, 5px offset, 30px below the heading.
- **Testimonial card** — 20px radius, 28px padding, 1px `rgba(255,255,255,.09)` border,
  `backdrop-filter: blur(8px)` and a two-layer gradient sampled off the design (translucent
  steel-blue at the top, near-opaque `rgba(4,14,34,.94)` at the bottom, plus a radial darkener
  at the bottom centre). Inside: 5 × 20px SVG stars in **#7f83ff** (sampled) with a 17px
  slanted double-bar quote SVG opposite, a 15px/1.65 quote 74px below, then a 44px avatar +
  16px/700 name + 15px role.
- **Avatar caveat** — no avatar asset was supplied, so `images/testimonial-chance.png` is
  **extracted from the design JPEG** (59px source upscaled to 176px). Replace it with a real
  photo when there is one; the pipeline picks it up automatically.

**Deltas from the design:** the h3 renders ~19% wider than the design's line (Inter is wider
than the design's display face), so line 2 covers 42.9% of the banner vs 34.8%. The text's
left inset is 5.99% of the banner instead of 6.88% — a consequence of the site container
being 1300 where the design's was 1639; container alignment was kept deliberately.

### ✅ Frame 04 — Homepage section 1 / recent launches (done)

Source: `images/designframes/004homepagesection1.jpg` (1920 frame, 1639 container).
Built as `components/sections/HomeIntro.tsx` (client component — the slider needs state),
copy in `lib/site.ts` → `homeIntro`.

- **Block** — `#f5f5f5` (`--color-surface`), inset 10px like the banner, radius 20px,
  padding 90px top / 128px bottom. It sits **2px** under the hero banner — in the design the
  banner ends at y=49 and the grey starts at y=51, so they all but touch.
- **Row 1 — h2** — pushed right: starts at **42.6%** of the container, **57.4%** wide (matches
  the design exactly). Two-tone: the lead sentence in black, the rest in
  `--color-heading-muted` (`#939393`, sampled). `clamp(24px, 2.6vw, 34px)` / 700 / 1.2 /
  -0.02em → renders the same **5 lines** as the design.
- **Row 2 — meta** — 153px below the heading. Left: a 13px brand dot with a 2px gap and a
  1.5px brand ring (`box-shadow`) + "Recent Launches" 18px/600. Right: "VIEW ALL PROJECTS"
  15px/700, `letter-spacing: .06em`, 2px underline 6px below.
- **Row 3 — slider** — 44px below. A scroll-snap flex track, 2 cards per view,
  `gap: 28px` (design 35 × 0.793), each card a 1:1 `next/image` with a 20px radius
  (`mindora.webp` 802², `healyra.webp` 803² — the design's card boxes are exactly these).
  The two projects are **repeated 4×** (`homeIntro.slideRepeat`) so the slider has the
  design's 4 pages; swap in real projects and the dots follow automatically.
- **Stats line** under each card, 44px down: `grid-template-columns: 32% 38% 30%` — the
  design puts the name at 0%, stat 1 at ~31.5% and stat 2 at ~69.5% of the card width.
  Name 32px/700 underlined; each stat = blue location-arrow SVG + 26px/700 value +
  13px/700 label capped at 88px so it wraps to two lines like the design.
- **Dots** — 100px below, 8px, 7px gap, active `#333`, the rest a 1px outline. Clicking one
  scrolls the track by whole pages; positions are read off the rendered cards
  (`offsetLeft`), so the maths survives the breakpoint changes.

**Font-size rule of thumb established here:** the design's display face is ~12% narrower than
Inter, so a cap-height measurement and a text-width measurement disagree by ~15%. Headings
take the cap-height value (visual weight matters), compact labels take something near the
width value (fitting the box matters) — e.g. h2 34px not 38px, "VIEW ALL PROJECTS" 15px not
18px.

**Not verified in this environment:** the browser pane can't composite, so *no scrolling of
any kind works* there (window or element) — the slider's snap/scroll behaviour and the
lazy-loaded avatar could not be exercised. Both are standard and type-check clean; worth an
eyeball in a real browser.

### ✅ Frame 05 — "Problems we hear" 3-up slider (done)

Source: `images/designframes/005section2.jpg` (1920 frame, 1639 container, white background).
Built as `components/sections/Problems.tsx` (client component), copy in `lib/site.ts` →
`problems`.

- **Section** — white, padding 100px top / 128px bottom.
- **Header** — h2 top-left, two lines with an explicit split: lead black, second line
  `--color-heading-muted`. Same `clamp(24px, 2.6vw, 34px)` / 700 as frame 04 so both
  section headings match. Top-right: two 48px round buttons, 13px apart
  (design 60px / 16px × 0.793). Enabled = `#f2eeeb` + black glyph, disabled =
  `#faf9f7` + `#d2d1cf` — both states sampled off the design.
- **Slider** — 72px below the heading. Three equal columns, 12px gap (the design's cards are
  535/522/554 wide — the natural sizes of the three photos — with ~15px gaps). Each card is
  `aspect-ratio: 535/891` (0.6) with a 20px radius, `next/image` `fill` + cover.
  The three cards repeat **3×** (`problems.slideRepeat`).
- **Overlay** — flat `rgba(0,0,0,0.3)`. Derived by comparing the mean luminance of
  `slider1.jpg` against the same region of the design frame (ratio 0.699), and it is flat:
  the top and bottom of the card darken by the same amount.
- **Card title** — white, 25px/600, centred, sitting **28% of the card height up from the
  bottom** (design 254/890). Note this must be `position: absolute; bottom: 28%` — a
  percentage *margin* would resolve against the card's width, not its height (caught in review).
- **Caption** — 34px under the card, 15px/1.35 in `--color-body-muted` (`#808080`, sampled;
  distinct from the heading's `#939393`).
- **Responsive** — 3 per view → 2 (≤1023px) → 1 at 84% (≤640px); arrows step by a whole page,
  reading the pitch off the rendered cards so the step follows the breakpoint.

**Deltas from the design:** (1) the design shows card 3's title on two lines — its wrap box is
~73% of the card, a window only 20px wide in Inter, so the title wraps naturally instead
(one line at 1512px). (2) The design's screenshot shows the *right* arrow greyed out; the build
greys out whichever direction is actually unavailable, so at rest the *left* one is grey.
(3) Card 3's caption was missing its final full stop — added.

### ✅ Frame 06 — Services on blue (done)

Source: `images/designframes/006section3.jpg` (1920 frame, 1639 container).
Built as `components/sections/Services.tsx` (server component), copy in `lib/site.ts` →
`services`.

- **Section** — flat `#006fda` (`--color-brand-deep`), white text, padding 128px / 160px.
  Note this is **not** the logo blue: `--color-brand` (`#146ef5`) is the logo/pill blue,
  `#006fda` is the UI blue used for this field and the frame-04 dot.
- **Label** — "Services we've spent years perfecting" 18px/700 uppercase with
  `letter-spacing: .1em` (renders 467px against the design's scaled 490).
- **Rows** — 96px below the label, three of them, 25px apart. **No fill** — just a 1px
  `#2786f2` border (`--color-brand-line`) and a 20px radius, `min-height: 186px`
  (design 235 × 0.793), padding 48px / 55px.
- **Row grid** — `16% 28% 25% 24% 7%`, vertically centred. Column starts land at
  3.8 / 18.5 / 44.2 / 67.2 / 89.3% against the design's 3.7 / 18.2 / 44.0 / 67.0 / 89.0%.
  - icon `webp` at 159px wide (design 200 × 0.793), natural height
  - title 56px/600 (design ~72; stem/cap says semibold, not bold)
  - body 15px/1.25
  - "START WITH:" 13px/700 + two 13px arrow links + an underlined "SEE ALL …" link
  - a long 87×39 arrow SVG, 2.4px stroke
- **Small type kept at design px, not scaled** — the list would be 10px if scaled by 0.793.
  Same rule as frame 02: display type scales, small text stays readable.
- **Responsive** — ≤1023px the row becomes a stacked flex column (icon 120px, arrow left
  aligned); ≤640px title 34px, label 15px.

**Delta:** the body copy sets on 3 lines instead of the design's 4 — our 25% column is 299px
where the design's was ~190px scaled.

### ⬜ Next frames

- Whatever follows the services rows — awaiting the next frame.
- (earlier note) Whatever follows the banner — awaiting the next frame. The gap between `HeroTop` and the
  banner is currently just `HeroTop`'s 56px bottom padding (the frame is cropped at the
  banner's top edge, so the real gap is unknown).

## 6. Conventions

- Copy and nav links live in `lib/site.ts`, not hardcoded in components — sections reuse them.
- One folder per layout area: `components/layout` for chrome, `components/sections` for page frames.
- Every section is full-bleed background + `.container` inner wrapper.
- Keep components server components unless interactivity is needed (`Header` is `'use client'`).
- Placeholder links use `#anchor` ids until the real routes exist.

## 7. Gotchas

- Don't run `npm run build` while `npm run dev` is running — they share `.next` and the dev
  server starts throwing `Cannot find module './xxx.js'` / 500s. Fix: stop dev, `rm -rf .next`,
  start dev again.

## 8. Deployment

- **GitHub:** https://github.com/agencystringhead-wq/wwisermind (public, `main`).
- **Build:** the site is fully static — `next.config.mjs` sets `output: 'export'` and
  `images.unoptimized: true`, so `npm run build` writes plain HTML to `out/` (~1.6 MB).
  Every image is already WebP and correctly sized by `npm run images`, and Inter is
  self-hosted into `_next/static/media`, so nothing is lost by turning the optimizer off
  and the page makes no third-party requests.
- **Node:** pinned to 22 via `.node-version` (Cloudflare Pages reads it).
- **Cloudflare Pages settings** (Connect to Git → this repo):

  | Setting | Value |
  | --- | --- |
  | Framework preset | Next.js (Static HTML Export) |
  | Build command | `npm run build` |
  | Build output directory | `out` |
  | Production branch | `main` |

  Wrangler is installed but its token is expired; connecting Pages needs an interactive
  `wrangler login` or the dashboard.
