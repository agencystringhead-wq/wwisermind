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
4. **Never commit the `/images/` folder** (leading slash — a bare `images/` rule also
   swallows `public/images/`, silently keeping new webp assets out of the deploy). Source photos and the design screenshots in
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
  Practice.tsx(.module.css)    frame 07 — gradient panels + metric widget + photo
  Process.tsx(.module.css)     frame 08 — process steps, fitted blobs, arrow pattern
  WhyUs.tsx(.module.css)       frame 09 — navy block, three numbered rows
  Founder.tsx(.module.css)     frame 10 — grey band, portrait + founder quote
  Freebies.tsx(.module.css)    frame 11 — badge + h2 + three-row list beside a photo
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

### ✅ Frame 07 — "Built around how you practice" (done)

Source: `images/designframes/007section4.jpg` (1920 frame, 1639 container, white page).
Built as `components/sections/Practice.tsx` (server component), copy in `lib/site.ts` →
`practice`.

- **Section** — padding 140px / 116px, h2 two-tone (same 34px clamp as the other sections),
  rows 116px below it, 17px apart.
- **Row** — `grid-template-columns: minmax(0,1fr) 32.8%`, gap 13px, `align-items: stretch`
  so the photo always matches the panel's height (design: both 761px). Row 2 mirrors via
  swapped columns + `order`, and its gradient stops swap too.
- **Panel gradient** — sampled on a 5×5 grid: the corners are `#cce6fd` (blue) and
  `#fefdf9` (warm white), and the measured centre (231,241,251) matches the midpoint of a
  straight two-stop `linear-gradient(to top right, …)` almost exactly (229,241,251).
  **The blue corner always faces the photo** — row 1 blue-right, row 2 blue-left.
- **Metric widget** — 538×198 (design 678×250), centred in the panel
  (design left/right padding 205/202 → genuinely centred), everything else in the panel
  aligns to its left edge:
  - a **back card** peeking 17px above, inset 11px each side, `rgba(255,255,255,.45)`
  - the front card is a fading white wash —
    `rgba(255,255,255,.8)` → `.06` top to bottom (measured: the widget lifts the background
    by ~15 luminance at its top and by nothing at its bottom) — plus a soft
    `0 18px 40px rgba(38,90,160,.1)` shadow
  - "AI" bold + "Search Visibility" medium, 16px `#2d3548`; a green `#2aba02` arrow;
    "159" 44px `#06152a`; "%" 21px
  - two pill bars, 96% and 54% of the content box, 8px tall
  - `arrow.webp` (the supplied 128px blue circle, glow included) at 97px, hanging
    39px past the widget's right edge and 5px below its bottom
- **Copy block** — title 36px/700, body 15px/**600** (the design's body here is visibly
  heavier than other sections), link 13px/700 uppercase in `--color-brand-deep` with an
  arrow glyph and an underlined label.
- **Responsive** — ≤1023px the row stacks (photo gets `aspect-ratio: 538/500`); ≤640px the
  panel copy goes full width and the circle shrinks to 74px.

**Delta:** the panel renders 651px tall against the design's scaled 603px — our body copy
wraps to more lines in the same column. The photo stretches to match, so the row stays flush.

### ✅ Frame 08 — "Our process", three steps (done)

Source: `images/designframes/008section5.jpg` (1920 frame, 1639 container, white page).
Built as `components/sections/Process.tsx`, copy in `lib/site.ts` → `processSection`
(named that, not `process`, so it never shadows the Node global).

- **Section** — padding **88px** / 162px, `position: relative; overflow: hidden`.
  (Design says 116px top, and frame 07 says 116px bottom, but the two stacked to a 232px
  white gap on the page — each frame is cropped separately so neither shows the real
  seam. Trimmed to 72 + 88 = **160px**, in line with the other white section seams
  (128–140px), at the user's request.)
- **Row 1** — a `#cce6fd` pill badge (36px tall, 13px/700 uppercase), then the two-tone h2
  17px below. `max-width: 750px` reproduces the design's 6-line wrap (the design block is
  ~950px of a 1639 container); without it the copy ran to 10 lines.
- **Arrow pattern** — `arrow-up.webp` (supplied). The design places the 349×258 asset at
  its natural size with its **right edge flush on the frame edge**, top at y=424 — measured
  by isolating low-saturation greys above the cards. Built as `right: 0; top: 336px;
  width: 277px` (349 × 0.793), hidden below 1024px.
- **Row 2 — two step cards**, 135px down, `1fr 1fr` with a 14px gap, `min-height: 477px`
  (design 601 × 0.793):
  - card 1 `#f5f5f5`, content **top**-aligned, padding 58/47
  - card 2 `#f2f7fb`, content **bottom**-aligned, padding-left 205px — the design runs the
    two blocks diagonally, top-left in card 1 and bottom-right in card 2
  - both `overflow: hidden`; copy column 373px; titles 28px/700, body 15px/1.4, link 13px
    uppercase in `--color-brand-deep`
- **Decorative blobs** — `pattern2.webp` in card 1, `pattern1.webp` in card 2. Placement was
  solved from **colour-feature centroids**: the teal and purple centroids of the source art
  are matched to the same centroids measured in the design frame, which gives a scale and
  offset directly. Average-pixel-error fitting was tried first and got card 2 badly wrong
  (it parked the art half outside the card so its hard edge showed) — the centroid solve is
  the one to trust, and a rendered side-by-side confirmed it.
  - card 1: **195% wide, left −0.6%, top 62.4%**, full strength
  - card 2: **64% wide (its natural size), top-left corner, `opacity: .5`** — the design
    fades the art to half strength (measured 0.49 mean / 0.51 peak deviation from the card
    colour, against the raw art)
  - both need `max-width: none`; the global reset caps images at 100% and silently pinned
    the first blob to the card width
- **Row 3** — the photo at `aspect-ratio: 1641/919` with a white card overlapping the
  bottom-left: `left: 4.9%; width: 34%; bottom: 0`, radius `20px 20px 0 0` (the design's
  bottom corners sit flush on the photo edge).
- **Responsive** — ≤1023px cards stack, card 2 loses its big indent, and the launch card
  drops below the photo instead of overlapping.

**Delta:** the launch card renders 331px tall against the design's scaled 259 — our body copy
takes more lines in the same width.

### ✅ Frame 09 — "Why practices choose us" navy block (done)

Source: `images/designframes/009section6.jpg` (1920 frame; the block is 1904 × 1628 with
8px side margins — the same inset as the hero banner). Built as
`components/sections/WhyUs.tsx`, copy in `lib/site.ts` → `whyUs`.

- **Block** — full-bleed with the hero's 10px inset and a 20px radius, base `#172444`,
  with `why-choose-us.webp` as a `next/image` `fill` + cover backdrop (the supplied art is
  1905 × 1629 — exactly the design block, so it is the background, not decoration).
  372 kB jpg → **22 kB** webp.
- **Label** — 18px/700 uppercase at `letter-spacing: .1em`, same as the frame-06 label.
- **Rows** — three, `grid-template-columns: 45.5% 24.3% 30.2%`, `align-items: center`,
  62px of padding either side of a 1px `#265490` rule. The rule sits **below** every row
  including the last, and never above the first — matching the frame.
  - the number and title share the first cell as a flex row (`align-items: flex-start`,
    59px apart) because the design tops the number against the title's first line
  - number 24px/600 in `#32578b` (sampled), title 34px/700 (design 48 × 0.793 lands at 38,
    but 34 keeps the two-line wrap and matches the other section headings)
  - image `aspect-ratio: 398/237` with a 20px radius and a soft drop shadow
  - body 15px/1.4 with `padding-left: 73px`, which puts the text at **75.4%** of the
    container — exactly where the design starts it
- **Responsive** — ≤1023px each row stacks to one column (title, image capped at 420px,
  then body); ≤640px the label and number step down.

**Copy fix:** the design reads "in yourtimezone" — set as "in your timezone".

### ✅ Frame 10 — Founder quote (done)

Source: `images/designframes/010section7.jpg` (1920 frame, 1639 container). Built as
`components/sections/Founder.tsx`, copy in `lib/site.ts` → `founder`.

- **Band** — a **full-bleed grey strip**: no 10px inset and no radius, unlike the hero and
  navy blocks (measured x 0→1919). `--color-surface`, 80px clear of the navy block above,
  padding 111px / 144px.
- **Grid** — `25% 75%`. Portrait at its natural 274px (→ 217px build, 20px radius) topping
  111px into the band; the quote column starts 84px lower so the mark lands at 195px,
  matching the design.
- **Quote mark** — the design uses squared commas, not a typographic glyph, so it is an SVG
  (86×63 → 68×50): a block with a tail tapering down-left.
- **Quote** — 34px/700 two-tone, black lead + `--color-heading-muted` remainder, capped at
  975px so it wraps to 7 lines against the design's 8.
- **Attribution** — the design sets this line in a **monospace** face, the only non-Inter
  type in the build. Rendered with the system stack (`ui-monospace, SFMono-Regular, …`) at
  22px in the sampled `#0c1929`, which measures within a few px of the design's width.
  Swap in a webfont mono if an exact match matters.
- **Responsive** — ≤1023px stacks to one column (portrait 180px, no quote offset).

Measured against the design: mark top 195 (design 195), quote top 308 (308), section 833
tall (893 — one fewer quote line).

### ✅ Frame 11 — Freebies (done)

Source: `images/designframes/011section8.jpg` (1919 frame, 1639 container, white page).
Built as `components/sections/Freebies.tsx`, copy in `lib/site.ts` → `freebies`.

- **Section** — padding 140px / 163px, two columns
  `grid-template-columns: 52.7% 40%` with `justify-content: space-between` (the design
  leaves a 7.4% gutter between the copy and the photo).
- **Left column** — `#cce6fd` badge (30px tall here; the frame-08 badge is 36px — the
  design itself differs), then the two-tone h2 26px below, then the list 122px down.
- **List** — three rows, each `55% 45%` (title | body), 52px of padding either side of a
  1px `#abb2ba` rule. The rule sits **between** rows only — no top rule on the first, no
  bottom rule on the last, unlike frame 09.
  Titles 15px/700 (the "(2026 Edition)" tail is a muted span), bodies 15px/400, both at
  line-height 1.35 — the design sets them at the same size and separates them by weight.
- **Photo** — `freebies.webp` at its natural 656×899 → 520×713 build (40% of the
  container), 20px radius, top-aligned with the badge. 333 kB → **68 kB**.
- **Responsive** — ≤1023px the photo drops below the copy (capped at 520px); ≤640px each
  list row stacks title over body.

Measured against the design: h2 top 196 (scaled 203), list top 400 (415), photo 520×713
(520×713), section 1016 tall (1012).

### ⬜ Next frames

- Whatever follows the freebies list — awaiting the next frame.
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
