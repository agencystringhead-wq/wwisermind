---
name: full-caseload-plan-guide-pipeline
description: Where the 2027 Full-Caseload Plan PDF, cover and landing page come from and how to rebuild them.
metadata:
  type: project
---

The lead magnet is built from `scripts/guides/full-caseload-plan/guide.html` (images in `img/`, JPG q85 max 2000px) by `npm run guide:pdf` (`build-pdf.mjs`, Playwright). It writes `public/guides/wwisermind-2027-full-caseload-plan.pdf` (10 pages, ~1.6MB, limit 6MB) and `public/images/full-caseload-plan-cover.webp` (900px, screenshot of page 1 in print media). Both outputs are committed, so rerun and commit them after any edit to guide.html.

The landing page is the first entry in `lib/freebies.ts` (slug `2027-full-caseload-plan-for-therapists`, `direct` mode: download button plus a booking link, no email form). The hub, mega menu, sitemap and llms.txt read from that list. The hero guide block and homepage Freebies card live in `lib/site.ts`.

**Why:** guide.html was uploaded by the user separately (it arrived once as `guide.html.html`; check the name). Count PDF pages after rebuilding (should be 10).
**How to apply:** change copy in guide.html or lib/freebies.ts, not the generated files. Booking links in the guide use `https://wwisermind.com/contact/#book-a-call`. See [[booking-links-use-ctalink]].
