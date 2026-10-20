# Claude Code prompt: build the 5 footer pages for wwisermind

Paste everything below the line into Claude Code, from the repo root (`E:\code\wwisermind`).

Before you paste, search for `[CONFIRM` and fill in or delete each one. There are only a few, and they're things I couldn't verify from the live site.

---

## Task

The footer's bottom row links (Privacy Policy, Terms & Conditions, Cookie Policy, Refer wwisermind, Sitemap) currently point to hash anchors (`#privacy`, `#terms`, `#cookies`, `#refer`, `#sitemap`) with no content. Build five real pages, wire the footer to them, and add a proper XML sitemap.

Work on a new branch: `feat/footer-legal-pages`.

### 1. Routes

Create these static routes (App Router, static export compatible, trailing slash as the rest of the site uses):

| Page | Route |
|---|---|
| Privacy Policy | `/privacy-policy/` |
| Terms & Conditions | `/terms-and-conditions/` |
| Cookie Policy | `/cookie-policy/` |
| Refer wwisermind | `/refer-wwisermind/` |
| Sitemap (human) | `/sitemap/` |

### 2. Data architecture

Follow the existing `lib/` pattern. Create `lib/legal.ts` exporting the three legal documents as typed data:

```ts
type LegalSection = { id: string; heading: string; body: (string | { list: string[] })[] };
type LegalDoc = { slug: string; title: string; metaTitle: string; metaDescription: string; lastUpdated: string; intro: string; sections: LegalSection[] };
```

Create `lib/sitemap.ts` that builds the grouped page list for the human sitemap AND the XML sitemap from one source. Pull service, pricing and freebie entries from the existing data modules (`lib/services.ts`, pricing data, `lib/footer.ts`, nav/mega-menu data) wherever they already exist, so new pages show up automatically. Only hardcode what has no data source yet.

### 3. Layout

Build one shared `LegalPage` component (CSS Module) used by Privacy, Terms and Cookies:

- Simple light hero: small eyebrow ("Legal"), H1 title, "Last updated: 20 October 2026" line, the intro paragraph.
- Two-column body on desktop: sticky table of contents on the left (links to each section `id`, active section highlighted on scroll via IntersectionObserver), content on the right with a readable measure (~68ch).
- Single column on mobile, TOC collapses into a `<details>` "On this page" block above the content.
- Headings semibold 600, matching site typography tokens. No entrance animations (house rule: nothing above the fold animates on entrance). If any motion is needed, LazyMotion with `domAnimation` only.
- End each legal page with a small contact card: "Questions about this policy? Email admin@wwisermind.com" plus the Pune office address.

Refer and Sitemap get their own simple layouts (specs below), reusing site tokens.

### 4. Footer + SEO wiring

- In `lib/footer.ts`, change the five bottom-row hrefs from hash anchors to the new routes.
- Add `metadata` (title, description, canonical, OG) to each page using the values below.
- Add `app/sitemap.ts` (with `export const dynamic = 'force-static'` for static export) generating `/sitemap.xml` from `lib/sitemap.ts`. Exclude hash-only links and "Soon" tools.
- Add or update `app/robots.ts` to reference the sitemap URL. Use the site URL from `lib/site.ts`.
- Add the Cookie Policy link next to any cookie or consent notice if one exists.

### 5. House rules (apply to all copy and code)

- Product and brand names always lowercase: wwisermind.
- No em dashes or en dashes anywhere in copy.
- No invented stats or numbers.
- Keep copy exactly as written below; don't "improve" it.

### 6. When done, report

- Every file created or changed.
- Any CSS values you set for the new layout (TOC width, gap, content max-width, sticky top offset, font sizes), as a before/after list where you changed existing values, so I can fine-tune by number.
- Confirm `npm run build` passes and `/sitemap.xml` is in the export output.

---

## PAGE COPY

### A. Privacy Policy

**metaTitle:** Privacy Policy | wwisermind
**metaDescription:** How wwisermind collects, uses and protects your information when you visit our site, book a call or work with us.

**Intro:**
This policy explains what information wwisermind collects, why we collect it, and what we do with it. wwisermind is a brand of Stringhead Technologies Private Limited, a company registered in India. When this policy says "we", "us" or "our", it means Stringhead Technologies Private Limited trading as wwisermind. If anything here is unclear, email us and we'll explain.

**1. Who we are** (`id: who-we-are`)
Stringhead Technologies Private Limited, trading as wwisermind.
Registered office: 1st Floor, Indialand Global Tech Park, Hinjawadi Rd, Phase 1, Pune, Maharashtra, India.
Email: admin@wwisermind.com
Phone: +91-91754 14055
We are the data controller (or "data fiduciary" under Indian law) for personal information collected through this website.

**2. What we collect** (`id: what-we-collect`)
We only collect what we need to answer you and do the work.
- Information you give us: your name, email, practice name, practice website, whether you're a solo or group practice, and anything you write in a message, form, ticket or booking.
- Booking details: when you book a call, our scheduling provider collects your name, email, chosen time and timezone, and any answers you give to booking questions.
- Client project information: if you hire us, we handle the content, logins and assets you share so we can build and look after your website and marketing.
- Technical information: basic device and browser data, IP address, and pages visited, collected by our hosting provider and any analytics we use. See our Cookie Policy for detail.
- Messages on other channels: if you contact us on WhatsApp, phone, LinkedIn, Facebook, Instagram or X, we keep the conversation so we can reply.

**3. What we don't collect** (`id: what-we-dont-collect`)
Our website is for therapists and practice owners, not their clients. Please don't send us any client's health information, session notes or other clinical records through our forms, email or chat. We don't need it to do our work and we don't want to hold it. If a project ever involves protected health information, we'll agree how it's handled in writing before any work starts.

**4. How we use your information** (`id: how-we-use`)
- To reply to your enquiry and run the calls you book.
- To prepare proposals, deliver the services you buy, and support you afterwards.
- To send invoices and keep financial records.
- To send occasional updates about our work, but only if you've agreed to it. You can unsubscribe any time.
- To keep the site secure, fix problems and understand which pages are useful.
We never sell your personal information, and we don't share it with advertisers.

**5. Legal basis** (`id: legal-basis`)
Depending on where you are, we rely on: your consent (for example, marketing emails and non-essential cookies); taking steps to enter or perform a contract with you; our legitimate interest in running and improving our business, where that doesn't override your rights; and meeting legal obligations such as tax and accounting rules.

**6. Who we share it with** (`id: sharing`)
We share information only with service providers who help us run the business, and only what they need:
- Website hosting and security: Cloudflare.
- Call booking: Cal.com.
- Email and documents: our business email and productivity provider. [CONFIRM: e.g. Google Workspace]
- Form handling: [CONFIRM: the service that receives the contact form, or delete this line if it goes straight to email]
- Analytics: [CONFIRM: e.g. Google Analytics or Cloudflare Web Analytics, or delete if none]
- Payments: our payment processor and bank. [CONFIRM: e.g. Stripe, PayPal, Wise]
- Messaging: WhatsApp (Meta), if you choose to contact us there.
We may also share information if the law requires it, or to protect our rights, or as part of a sale or restructure of the business (in which case this policy would still apply).

**7. International transfers** (`id: international-transfers`)
We're based in India and most of our clients are in the US, UK, Ireland, Australia and the UAE. That means your information will be processed in India and by providers who may store data in other countries, including the US and EU. Where the law requires it, we use appropriate safeguards such as standard contractual clauses with our providers.

**8. How long we keep it** (`id: retention`)
- Enquiries that don't become projects: up to 24 months, then deleted.
- Client project records and correspondence: for the length of the engagement plus up to 3 years, so we can support you and handle any questions.
- Invoices and financial records: as long as Indian tax law requires, currently 8 years.
- Logins and passwords you share with us for a project: deleted or handed back when the project or care plan ends.
You can ask us to delete your information sooner (see your rights below).

**9. How we protect it** (`id: security`)
We use encrypted connections (HTTPS) across the site, limit access to the people who need it, use two-factor authentication on our business accounts, and store shared credentials in a password manager rather than in email. No system is perfectly secure, but we take this seriously and will tell you promptly if a breach affects your information.

**10. Your rights** (`id: your-rights`)
Depending on where you live (for example under India's Digital Personal Data Protection Act, the EU and UK GDPR, or US state privacy laws such as California's), you may have the right to:
- see the personal information we hold about you;
- correct it if it's wrong;
- ask us to delete it;
- object to or restrict how we use it;
- withdraw consent at any time, where we rely on consent;
- get a copy in a portable format;
- complain to your local data protection authority.
To use any of these rights, email admin@wwisermind.com. We'll reply within 30 days and may need to confirm your identity first. We don't charge for this.

**11. Grievance officer** (`id: grievance-officer`)
For India, our grievance officer is SrikaantH, Founder, reachable at admin@wwisermind.com. [CONFIRM name/title]

**12. Children** (`id: children`)
Our services are for businesses. We don't knowingly collect information from anyone under 18.

**13. Links to other sites** (`id: other-sites`)
Our site links to other websites, including client sites and directories like Psychology Today. We're not responsible for how those sites handle your information, so check their policies.

**14. Changes to this policy** (`id: changes`)
If we change this policy, we'll update the date at the top of this page. If the change is significant, we'll let current clients know by email.

---

### B. Terms & Conditions

**metaTitle:** Terms & Conditions | wwisermind
**metaDescription:** The terms that apply when you use the wwisermind website or buy website, SEO, AI and marketing services from us.

**Intro:**
These terms apply when you use this website or buy services from wwisermind, a brand of Stringhead Technologies Private Limited ("we", "us", "our"). If you sign a proposal or statement of work with us, that document sits alongside these terms. If the two ever disagree, the signed proposal wins.

**1. Using this website** (`id: using-the-site`)
You're welcome to read, share and link to our pages. Please don't copy our designs, copy or code for your own commercial use, try to break or overload the site, or use it for anything unlawful. The free tools, templates and freebies are for your own practice. Don't resell them.

**2. Information on this site** (`id: site-information`)
Our articles, guides and tools give general information about marketing for therapy practices. They aren't legal, clinical, compliance or financial advice. Check anything important with a qualified professional before relying on it.

**3. Our services** (`id: our-services`)
We design, build and look after websites, and provide SEO, AEO, GEO, AI search optimisation, copywriting, Meta ads and related services for therapists and psychologists. What's included in each service is set out on its service or pricing page, or in your proposal.

**4. Quotes and prices** (`id: prices`)
Prices on our site are in US dollars unless stated otherwise. They don't include taxes, payment processor fees, or third-party costs such as domains, premium plugins, stock images or ad spend, unless the page says they do. A quote is valid for 30 days.

**5. Payment** (`id: payment`)
- One-time projects: paid as set out in your proposal, usually a deposit to book your slot and the balance before launch.
- Monthly plans: billed in advance each month.
- Annual plans (for example Hyper Growth Marketing): billed yearly in advance.
- Plans with a set commitment (for example the One-Week Website on the 12-month monthly option): you agree to pay for the full commitment period.
Invoices are due within 7 days. If a payment is more than 14 days late we may pause work until it's settled.

**6. Contracts and cancelling** (`id: cancelling`)
Most monthly plans have no long-term contract. You can cancel with 30 days' written notice by emailing admin@wwisermind.com. The exceptions are plans that say they have a fixed term or are paid annually; those run for the term you signed up for. Fees already paid for work we've started or months already begun aren't refundable, unless the law says otherwise.

**7. What we need from you** (`id: your-responsibilities`)
To hit timelines (especially the one-week build), we need your content, photos, approvals and access on time. If something we need is late, the timeline moves by the same amount. You confirm that anything you give us (text, images, logos, testimonials) is yours to use or that you have permission, and that it's accurate.

**8. Health information and compliance** (`id: compliance`)
You are responsible for how your practice handles client information and for meeting the rules that apply to you, such as HIPAA in the US or GDPR in the UK and EU. We build forms and sites with privacy in mind, but we're not your compliance adviser. If your project needs a Business Associate Agreement or a similar contract, tell us before we start and we'll confirm in writing whether we can sign one. Please don't send us client health records.

**9. Revisions and approvals** (`id: revisions`)
Each service includes the rounds of revisions listed on its page or in your proposal. Extra changes, or new work outside the agreed scope, are quoted separately before we do them.

**10. Ownership** (`id: ownership`)
Once you've paid in full for a website or other deliverable, you own the final design, copy and content we created for you. We keep ownership of our own tools, templates, frameworks and know-how, and we give you a permanent licence to use whatever of those is built into your site. Third-party items (themes, plugins, fonts, stock images) stay under their own licences. We may show your project in our portfolio unless you ask us not to.

**11. Results** (`id: results`)
We work hard to improve your visibility and enquiries, but search engines, AI tools and ad platforms are outside our control. We can't guarantee specific rankings, AI recommendations, traffic, leads or bookings.

**12. Third-party services** (`id: third-parties`)
Our work often relies on other platforms, such as hosting, WordPress, Google, Meta, Cal.com and AI tools. We're not responsible if those services change, go down or change their rules, though we'll help you work around it.

**13. Limitation of liability** (`id: liability`)
To the extent the law allows, we're not liable for indirect losses such as lost profits, lost data or lost business. Our total liability for any claim is limited to the fees you paid us in the 3 months before the claim. Nothing here limits liability that can't be limited by law.

**14. Confidentiality** (`id: confidentiality`)
We keep your business information, logins and anything you mark as confidential private, and only use it to do the work. We ask you to do the same with our proposals and pricing that aren't public.

**15. Ending the relationship** (`id: termination`)
Either of us can end an engagement if the other seriously breaks these terms and doesn't fix it within 14 days of being told. When we part ways, we'll hand over your files and access, provided all invoices are paid.

**16. Governing law** (`id: governing-law`)
These terms are governed by the laws of India. If a dispute comes up, we'll first try to sort it out by talking. If that doesn't work, the courts of Pune, Maharashtra will have jurisdiction.

**17. Changes** (`id: changes`)
We may update these terms from time to time. The version on this page on the day you sign a proposal applies to that engagement.

**18. Contact** (`id: contact`)
Stringhead Technologies Private Limited (wwisermind), 1st Floor, Indialand Global Tech Park, Hinjawadi Rd, Phase 1, Pune, India. admin@wwisermind.com, +91-91754 14055.

---

### C. Cookie Policy

**metaTitle:** Cookie Policy | wwisermind
**metaDescription:** Which cookies and similar technologies the wwisermind website uses, why, and how to control them.

**Intro:**
This page explains the cookies and similar technologies used on the wwisermind website. We keep them to a minimum.

**1. What cookies are** (`id: what-are-cookies`)
Cookies are small text files a website stores in your browser. Some are needed for a site to work. Others help the site owner understand how people use it. Similar technologies, like local storage, work in much the same way, and this policy covers them too.

**2. Cookies we use** (`id: cookies-we-use`)
Strictly necessary
These keep the site secure and working. They don't need your consent.
- Cloudflare (for example `__cf_bm`, `cf_clearance`): protect the site from bots and abuse. Expire within 30 minutes to a year.

Functional
- Cal.com: set when you open or use the booking calendar, so it remembers your timezone and booking details.
- Local storage on our site: remembers small preferences, such as a dismissed announcement bar. Stays until you clear your browser data.

Analytics [CONFIRM: keep only if you use analytics, and name the tool]
- [e.g. Google Analytics `_ga`, `_ga_*`]: show us which pages people visit, in aggregate, so we can improve the site. Expire after up to 2 years. We only set these with your consent where the law requires it.

Embedded content
- Videos, maps or social links may set cookies from those providers (for example Google Maps, LinkedIn, Facebook, Instagram, X) if you interact with them. Their own cookie policies apply.

We don't use advertising or retargeting cookies on this site. [CONFIRM: if you add the Meta Pixel later, move it into a new "Marketing" category here and turn on a consent banner.]

**3. Managing cookies** (`id: managing-cookies`)
You can block or delete cookies in your browser settings. Here's where to find them in Chrome, Safari, Firefox and Edge: Settings, then Privacy (or Privacy and Security), then Cookies. Blocking strictly necessary cookies may stop parts of the site, like booking a call, from working.

**4. Changes** (`id: changes`)
If we add or remove cookies, we'll update this page and the date at the top.

**5. Contact** (`id: contact`)
Questions about cookies? Email admin@wwisermind.com. For more on how we handle personal information, see our Privacy Policy (link to `/privacy-policy/`).

---

### D. Refer wwisermind

**metaTitle:** Refer a Therapist to wwisermind | Referral Program
**metaDescription:** Know a therapist or group practice who needs a better website or more visibility? Refer them to wwisermind and say thanks in a way that helps you both.

**Layout:** Hero, three-step strip, reward cards, short FAQ accordion (reuse the numbered accordion component), then a referral form. CTA buttons in the site's primary style.

**Hero**
Eyebrow: Refer wwisermind
H1: Know a therapist who deserves to be found?
Sub: Most of our best clients came from one therapist telling another. If you know a practice that's hard to find online, introduce us. If they become a client, we'll thank you properly.
Button: Refer a practice (scrolls to `#refer-form`)

**How it works** (three steps)
1. Tell us who. Fill in the short form below with their name and practice. Let them know you're passing their details on.
2. We reach out gently. One friendly email, mentioning you. No pressure, no chasing, no sales sequences.
3. You both get a thank you. When they sign up and pay their first invoice, you get your reward and they get a welcome discount.

**Rewards**
Card 1, For you: [CONFIRM reward, e.g. "$200 credit on your wwisermind plan, or $150 paid to you"]
Card 2, For them: [CONFIRM reward, e.g. "10% off their first project or first 3 months"]
Card 3, No limit: Refer as many practices as you like. Every one that becomes a client counts.

**FAQ**
- Do I need to be a wwisermind client? No. Therapists, supervisors, practice consultants and anyone else who knows the field can refer.
- When do I get the reward? Within 30 days of the referred practice paying their first invoice.
- What counts as a successful referral? A practice we weren't already talking to, who becomes a paying client within 6 months of your referral.
- Will you spam the person I refer? No. We send one email, and if they're not interested, that's the end of it.
- Is there anything you won't accept? Self-referrals and referrals of existing clients don't qualify. We may change or end the program, but any referral already submitted will be honoured under the rules at the time.

**Form** (`id="refer-form"`; same field styling and submission handling as the contact form)
Section heading: Make an introduction
- Your name*
- Your email*
- Are you a wwisermind client?* (Yes / No)
- Their name*
- Their practice name*
- Their email or website*
- Solo or group practice? (Solo practice / Group practice / Not sure)
- Anything we should know? (optional textarea)
- Checkbox*: "I've let them know I'm passing on their details."
Submit button: Send referral
Success message: Thank you. We'll reach out to them this week and let you know how it goes.

Small print under form: Rewards are paid once per new client. Full rules are in our Terms & Conditions.

---

### E. Sitemap (human-readable page)

**metaTitle:** Sitemap | wwisermind
**metaDescription:** Every page on the wwisermind website in one place: services, pricing, free tools, resources and company pages.

**Layout:** Light hero (H1 "Sitemap", sub "Every page on our site, in one place."), then a responsive grid of grouped link columns (4 columns desktop, 2 tablet, 1 mobile). Group headings semibold 600. Plain text links with the site's link hover style. Build from `lib/sitemap.ts`.

Groups and pages (pull from existing data modules where possible; this is the current list from the live nav):

**Main**
Home `/`, Results `/results/`, Reviews `/reviews/`, Contact `/contact/`, Book a free call `/contact/#book`

**Website design**
One Week Website `/services/one-week-website-for-therapists/`
Custom Website Design `/services/custom-website-design-for-therapists/`
Website Hosting `/services/website-hosting-for-therapists/`
Website Care Plans `/services/wordpress-care-plans-for-therapists/`

**Online marketing**
Local SEO `/services/local-seo-for-therapists/`
SEO Audit `/services/seo-audit-for-therapists/`
One Time SEO `/services/one-time-seo-for-therapists/`
Ongoing SEO / AEO / GEO `/services/seo-for-therapists/`
Copywriting `/services/copywriting-for-therapists/`
Meta Ads `/services/meta-ads-for-therapists/`

**AI services**
AI Search Optimization `/services/ai-search-optimization-for-therapists/`
AI Website Design `/services/ai-website-design-for-therapists/`
AI Chatbot `/services/ai-chatbot-for-therapists/`

**Pricing**
All pricing `/pricing/`
Hyper Growth Marketing `/pricing/hyper-growth-marketing-for-therapists/`
One-Week Website `/pricing/one-week-website-for-therapists/`
Custom Website Design `/pricing/custom-website-design-for-therapists/`
WordPress Care Plans `/pricing/wordpress-care-plans-for-therapists/`
SEO Audit `/pricing/seo-audit-for-therapists/`
One-Time SEO `/pricing/one-time-seo-for-therapists/`
Ongoing SEO, AEO & GEO `/pricing/seo-for-therapists/`
Local SEO Packages `/pricing/local-seo-for-therapists/`

**Who we help**
Group Practices `/who-we-help/group-practices/`
Solo Practices `/who-we-help/solo-practices/`

**Free resources**
Freebies `/freebies/`
Psychology Today Profile Kit `/freebies/psychology-today-profile-kit-for-therapists/`
Google Business Profile Checklist `/freebies/google-business-profile-checklist-for-therapists/`
30 Days of Social Media Posts `/freebies/social-media-posts-for-therapists/`
Business Card Template `/freebies/business-card-template-for-therapists/`
Email Signature for Therapists `/freebies/email-signature-for-therapists/`

**Studio**
About Us `/about/`
Our Process `/process/`
Blog `/blog/`
FAQs `/faq/`
Refer wwisermind `/refer-wwisermind/`

**Legal**
Privacy Policy `/privacy-policy/`
Terms & Conditions `/terms-and-conditions/`
Cookie Policy `/cookie-policy/`
XML sitemap `/sitemap.xml`

Rules for the sitemap:
- Skip any route that doesn't exist yet in the build (check the app directory) and list what you skipped in your report.
- Skip tools marked "Soon" until they launch, but make it a one-line flag change in `lib/sitemap.ts` to include them.
- If blog posts exist as data, list them under Blog (latest 20) in the human sitemap and all of them in `sitemap.xml`.
