---
name: booking-links-use-ctalink
description: How "book a call" links must be built on wwisermind so they open the Cal.com pop-up, and how to audit and test them.
metadata:
  type: project
---

Any "book a call" link must render through `components/booking/CtaLink.tsx` (it swaps in `BookCallButton` for `routes.contactBook` / `#book` / `#book-a-call`). A plain `<Link>` or `<a>` to `/contact/#book` has no `data-cal-*` attributes, so it just navigates to the contact page.

- `#book` is the real anchor of the inline calendar on /contact/ (set via `contactPage.anchors.booking`, not a literal `id="book"`); `#book-a-call` is kept as the old anchor. Both land correctly. Don't conclude an anchor is missing from a literal grep.
- On /contact/ itself the hero button uses on-page `#book` to scroll to the inline calendar on purpose, so `ContactHero` only uses the pop-up for the full `/contact/#book`.
- Audit method: build, then scan `out/**/*.html` for `<a>` with href ending `#book`/`#book-a-call` and no `data-cal-link`. Source grep only shows data, not how it renders.
- Live test: a cold click can fall through to /contact/#book because `BookCallButton` waits only 3s for Cal's embed. Hover first (starts the embed), then click; success is a `cal-modal-box` with `loaded` state and an `app.cal.com/wwisermind/30min` iframe. The preview pane can't show the overlay visually.

**Why:** the PDF guide's landing page link and several hero/sitemap links were plain links until fixed (commits a805ce6, 2e06263).
**How to apply:** when adding a CTA to booking, use CtaLink or data with `routes.contactBook`; see [[pages-dev-deploy-lag]] before debugging a "not live yet" report, and [[wwisermind-preview-pane-cannot-verify-motion]] for pane limits.
