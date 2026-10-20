# Crisis Resources by State + help now widget

Two prompts. Run Prompt 1, check the pages, then run Prompt 2.

---

## PROMPT 1: Data file + Crisis Resources pages

We're adding a new free tool to the wwisermind site under Tools: **Crisis Resources by State**. It's a public, US crisis and mental health helpline directory for people visiting therapist websites. Later (Prompt 2) the same data will power an embeddable widget that therapists add to their own sites. So the data file is the single source of truth and must be built first.

Work on a new branch: `feature/crisis-resources`.

### House rules (non-negotiable)
- No em dashes or en dashes anywhere in copy or comments
- Never use the phrase "plain English" or "in plain words"
- No fabricated stats, numbers, or claims. Do not add any helpline, phone number, text code, hours, or URL that is not in the data below. Do not invent state-level resources.
- Nothing above the fold animates on entrance. If you use motion anywhere, LazyMotion with domAnimation only. Honestly, this page should have almost no animation at all.
- Product names lowercase ("help now widget")
- Font weight semibold 600 where we use bold, matching the rest of the site
- Follow the existing `lib/` data pattern, CSS Modules, TypeScript, static export

### 1. Data file

Create `lib/crisis-resources.json` (the source of truth) and `lib/crisis-resources.ts` (types + helpers that import the JSON).

Schema per resource:
```ts
type CrisisResource = {
  id: string;            // kebab-case
  name: string;
  category: "emergency" | "crisis" | "lgbtq" | "veterans" | "violence" | "substance-use" | "maternal" | "eating-disorders" | "support";
  audience: string;      // who it's for, short
  call?: string;         // display format
  callHref?: string;     // tel: link
  text?: string;         // e.g. "Text HOME to 741741"
  textHref?: string;     // sms: link (number only, no body param)
  tty?: string;
  chatUrl?: string;
  hours: string;
  languages?: string;
  notes?: string;
  source: string;        // official URL used to verify
  verified: string;      // YYYY-MM-DD
  needsCheck?: boolean;  // true = not yet verified against official site, do not render publicly
};
```

Top-level shape:
```json
{ "updated": "2026-10-21", "national": [ ... ], "states": {} }
```
`states` stays empty for now, keyed by two-letter code (e.g. "IL"). We will fill states one at a time after manual verification.

Helpers in `lib/crisis-resources.ts`: `getNationalResources()` (filters out `needsCheck: true`), `getStateResources(code)`, `getStatesWithData()`, `formatVerifiedDate()` (returns "October 2026" style).

Seed `national` with exactly these entries:

| id | name | category | call | text | other | hours | source | needsCheck |
|---|---|---|---|---|---|---|---|---|
| emergency-911 | Emergency services | emergency | 911 | | | 24/7 | https://www.911.gov | false |
| lifeline-988 | 988 Suicide & Crisis Lifeline | crisis | 988 | Text 988 | chat: https://988lifeline.org/chat ; languages: English, Spanish (press 2, or text AYUDA to 988) | 24/7 | https://988lifeline.org | false |
| crisis-text-line | Crisis Text Line | crisis | | Text HOME to 741741 | | 24/7 | https://www.crisistextline.org | false |
| veterans-crisis-line | Veterans Crisis Line | veterans | 988, then press 1 | Text 838255 | chat: https://www.veteranscrisisline.net | 24/7 | https://www.veteranscrisisline.net | false |
| trevor-project | The Trevor Project | lgbtq | 1-866-488-7386 | Text START to 678-678 | audience: LGBTQ+ young people ages 13 to 24 | 24/7 | https://www.thetrevorproject.org | false |
| trans-lifeline | Trans Lifeline | lgbtq | 1-877-565-8860 | | audience: trans and questioning people, peer support | Limited hours, see website | https://translifeline.org | true |
| domestic-violence-hotline | National Domestic Violence Hotline | violence | 1-800-799-7233 | Text START to 88788 | TTY 1-800-787-3224 ; chat: https://www.thehotline.org | 24/7 | https://www.thehotline.org | false |
| rainn | RAINN National Sexual Assault Hotline | violence | 1-800-656-4673 | | chat: https://hotline.rainn.org | 24/7 | https://www.rainn.org | true |
| childhelp | Childhelp National Child Abuse Hotline | violence | 1-800-422-4453 | Text 1-800-422-4453 | | 24/7 | https://www.childhelphotline.org | true |
| samhsa-helpline | SAMHSA National Helpline | substance-use | 1-800-662-4357 | Text your ZIP code to 435748 | TTY 1-800-487-4889 ; English and Spanish ; treatment referral, not a crisis line | 24/7 | https://www.samhsa.gov/find-help/helplines/national-helpline | false |
| maternal-mental-health | National Maternal Mental Health Hotline | maternal | 1-833-852-6262 (1-833-TLC-MAMA) | Text 1-833-852-6262 | English and Spanish ; not an emergency line | 24/7 | https://mchb.hrsa.gov/national-maternal-mental-health-hotline | false |
| eating-disorders-alliance | National Alliance for Eating Disorders Helpline | eating-disorders | 1-866-662-1235 | | staffed by licensed therapists ; referrals | Mon to Fri, 9am to 7pm ET | https://www.allianceforeatingdisorders.com | false |
| nami-helpline | NAMI HelpLine | support | 1-800-950-6264 | | information and peer support, not a crisis line | Weekdays, see website | https://www.nami.org/help | true |
| disaster-distress | Disaster Distress Helpline | support | 1-800-985-5990 | Text 1-800-985-5990 | | 24/7 | https://www.samhsa.gov/find-help/disaster-distress-helpline | true |

Set `verified: "2026-10-21"` on all entries. Build `callHref` as `tel:` with digits only (`tel:988`, `tel:18664887386`). Build `textHref` as `sms:` with the number only. For keyword texts (HOME, START) show the keyword clearly in the button label since sms body params behave differently on iOS and Android.

Important: do NOT include the old 1-800-273-8255 number or any "press 3" option. Both are retired.

### 2. Pages

- `/tools/crisis-resources` (main page)
- `/tools/crisis-resources/[state]` via `generateStaticParams` from `getStatesWithData()`. Slug is the full lowercase state name ("illinois"). Since `states` is empty, no state pages build yet, but the route and template must exist and work when data is added.

If a `/tools` index page or Tools nav group exists, add this tool to it. Add a link in `lib/footer.ts` under the AI Tools side of the footer toggle (or the closest existing tools group). Tell me where you put it.

**Main page layout, top to bottom:**
1. Emergency banner, first thing on the page, static, high contrast: "If you or someone else is in immediate danger, call 911 or go to the nearest emergency room." Next to it a large tap target: "Call or text 988". No animation, no hero video, no decorative imagery before this.
2. H1: Crisis Resources by State. One short intro paragraph: free, confidential US helplines, organized by need, checked against official sources.
3. Category sections (Crisis and suicide, Veterans, LGBTQ+, Violence and abuse, Substance use, Pregnancy and new parents, Eating disorders, Information and support). Each resource as a card: name, audience line, hours, then buttons for Call / Text / Chat that exist for that entry. Buttons are real links (`tel:`, `sms:`, `https:`), min 44px tall.
4. State selector: a list of states that have data (empty state message for now: "State and local resources are being added state by state.").
5. "For therapists" block: one paragraph explaining practices can add these resources to their own site for free with the help now widget, link to `/tools/crisis-resources/help-now-widget` (we build it in Prompt 2, leave the link).
6. Footer note: "Last verified: {Month YYYY}. Each resource links to its official source. wwisermind is not a crisis service and does not answer calls. Spotted something out of date? Email us." Use the existing site contact email from `lib/site.ts`.

**State page template:** same emergency banner, H1 "Crisis Resources in {State}", state resources first, then the national list below.

**SEO:** title "Crisis Resources by State | wwisermind", meta description in our voice. Canonical URLs. No FAQ or medical schema, keep it simple.

**Privacy:** no analytics events, pixels, or tracking scripts on these routes beyond whatever is already site-wide. If anything site-wide fires a marketing pixel, tell me before shipping so we can exclude these routes.

**Accessibility:** WCAG AA contrast, buttons have accessible names like "Call 988 Suicide & Crisis Lifeline", works with keyboard, readable at 320px wide.

### 3. Report back
- Files created and changed
- Where the nav and footer links went
- Screenshot-ready local URLs
- Any entry you couldn't build an href for

---

## PROMPT 2: help now widget + install page

Same branch. Build the embeddable **help now widget** that therapists paste into their own websites, plus the page that generates their snippet.

### 1. Publish the data for outside sites
- Add `scripts/build-crisis-data.mjs` that copies `lib/crisis-resources.json` to `public/data/crisis-resources.json`, stripping entries with `needsCheck: true`. Hook it into `prebuild` (and `predev`) in package.json.
- Add or update `public/_headers` (Cloudflare Pages):
  - `/data/crisis-resources.json`: `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=3600`
  - `/widget/*`: `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=3600`

### 2. The widget file
`public/widget/help-now.js`. Hand-written vanilla JS, no framework, no dependencies, under 10KB unminified if possible. Works in all modern browsers.

Embed code a therapist pastes:
```html
<div class="wwiser-help-now" data-state="IL" data-color="#1f4d3a">
  <p><strong>If you are in immediate danger, call 911.</strong> For crisis support, call or text 988 (Suicide & Crisis Lifeline), available 24/7.</p>
</div>
<script src="https://wwisermind.com/widget/help-now.js" async></script>
```

Behaviour:
- Finds every `.wwiser-help-now` on the page.
- Fetches `https://wwisermind.com/data/crisis-resources.json` once (shared across instances).
- On success, replaces the fallback with the full rendered list inside a **Shadow DOM** so the host site's CSS can't break it and ours can't leak out.
- On any failure (network, blocked, bad JSON), leaves the fallback HTML untouched. Never show an empty box or an error message to a visitor.
- Attributes: `data-state` (optional, two-letter code, shows that state's resources first), `data-color` (accent, validate it's a hex color, else default), `data-compact="true"` (shows only 911, 988, Crisis Text Line, plus state entries), `data-heading` (optional, default "Need help now?").
- Inherits the host site's font family (`font-family: inherit` on the shadow root host).
- Layout: emergency line on top, then cards with Call / Text / Chat links, same rules as the site (real tel/sms/https links, 44px tap targets, accessible names).
- Bottom line: "Last verified {Month YYYY} · Resources maintained by wwisermind" where "wwisermind" links to `https://wwisermind.com/tools/crisis-resources` with `target="_blank" rel="noopener"`. Keep it small and muted. Nothing else promotional.
- Absolutely no cookies, localStorage, analytics, beacons, or third-party requests. The only network call is the JSON fetch.

### 3. Install page: `/tools/crisis-resources/help-now-widget`
- H1: Add the help now widget to your practice website
- Short intro: free, takes a couple of minutes, we keep the numbers current so you don't have to.
- Generator: state dropdown (all 50 states + DC; note under it that states without local data show national resources only), accent color picker, compact toggle, heading text field.
- Live preview that loads the real `help-now.js` with the chosen settings.
- Code box with the generated snippet and a Copy button (with "Copied" confirmation).
- Install guides as accordions (use our existing numbered accordion style): WordPress (Custom HTML block), Squarespace (Code block), Wix (Embed HTML element), Other platforms (any HTML embed area; if your platform blocks scripts, paste just the fallback paragraph or contact us). Keep each guide to 3 to 5 short steps. Don't claim plan requirements for Squarespace or Wix; just say "if you don't see this option, your plan may not allow custom code, contact us."
- CTA block: "Rather we set it up for you? Book a free 30-minute call" linking to our Cal.com link (`wwisermind/30min`, use however the site already links it).
- FAQ (short, honest): Does it slow my site? (one small file, loads async) Does it track my visitors? (no) What if wwisermind's site is down? (the fallback text with 911 and 988 always shows) Who updates the numbers? (we do, each entry is checked against its official source)

### 4. Test before reporting
- Create `public/widget/test.html` (dev only, add to `.gitignore` or delete before merge) that embeds the widget twice with different settings, plus once with a bad JSON URL to prove the fallback stays.
- Run `npm run build` and confirm static export succeeds and `out/data/crisis-resources.json` and `out/widget/help-now.js` exist.

### 5. Report back
- Files created and changed
- Widget file size
- Screenshots of: widget default, widget compact, fallback state, install page
- Anything you were unsure about
