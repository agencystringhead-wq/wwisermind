import { routes, type Route } from '@/lib/routes';

/* ==========================================================================
   The three legal documents: Privacy Policy, Terms & Conditions, Cookie Policy.

   One data file, one shared template (components/legal/LegalPage.tsx), the same pattern as
   lib/services.ts. Every word on those pages is read from here, and the copy is the owner's,
   so it is not edited in code.

   Three lines of the source copy carried a [CONFIRM] note for a fact that could not be
   checked from the repo, and they are left out rather than guessed: the form-handling
   provider (the contact form has no backend yet), the analytics tool (the site loads none),
   and the cookie policy's analytics group. Add them back here, in the section they came
   from, when they are real. The "e.g." examples that rode along on the email, payments and
   referral lines are dropped too.

   Nothing here is a statistic. No em dashes or en dashes.
   ========================================================================== */

/** One piece of a section: a paragraph, a bulleted list, a small run-in heading, or a
    paragraph that ends in a link to another page. */
export type LegalBlock =
  | string
  | { list: string[] }
  | { subheading: string }
  | { lead: string; link: { label: string; href: Route }; trail?: string };

export type LegalSection = { id: string; heading: string; body: LegalBlock[] };

export type LegalDoc = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

/** The date shown on all three, and the date the pages were written. */
const LAST_UPDATED = '20 October 2026';

/* --- A. Privacy Policy ---------------------------------------------------------------- */

export const privacyPolicy: LegalDoc = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  metaTitle: 'Privacy Policy | wwisermind',
  metaDescription:
    'How wwisermind collects, uses and protects your information when you visit our site, book a call or work with us.',
  lastUpdated: LAST_UPDATED,
  intro:
    "This policy explains what information wwisermind collects, why we collect it, and what we do with it. wwisermind is a brand of Stringhead Technologies Private Limited, a company registered in India. When this policy says \"we\", \"us\" or \"our\", it means Stringhead Technologies Private Limited trading as wwisermind. If anything here is unclear, email us and we'll explain.",
  sections: [
    {
      id: 'who-we-are',
      heading: '1. Who we are',
      body: [
        'Stringhead Technologies Private Limited, trading as wwisermind.',
        'Registered office: 1st Floor, Indialand Global Tech Park, Hinjawadi Rd, Phase 1, Pune, Maharashtra, India.',
        'Email: admin@wwisermind.com',
        'Phone: +91-91754 14055',
        'We are the data controller (or "data fiduciary" under Indian law) for personal information collected through this website.',
      ],
    },
    {
      id: 'what-we-collect',
      heading: '2. What we collect',
      body: [
        'We only collect what we need to answer you and do the work.',
        {
          list: [
            "Information you give us: your name, email, practice name, practice website, whether you're a solo or group practice, and anything you write in a message, form, ticket or booking.",
            'Booking details: when you book a call, our scheduling provider collects your name, email, chosen time and timezone, and any answers you give to booking questions.',
            'Client project information: if you hire us, we handle the content, logins and assets you share so we can build and look after your website and marketing.',
            'Technical information: basic device and browser data, IP address, and pages visited, collected by our hosting provider and any analytics we use. See our Cookie Policy for detail.',
            'Messages on other channels: if you contact us on WhatsApp, phone, LinkedIn, Facebook, Instagram or X, we keep the conversation so we can reply.',
          ],
        },
      ],
    },
    {
      id: 'what-we-dont-collect',
      heading: "3. What we don't collect",
      body: [
        "Our website is for therapists and practice owners, not their clients. Please don't send us any client's health information, session notes or other clinical records through our forms, email or chat. We don't need it to do our work and we don't want to hold it. If a project ever involves protected health information, we'll agree how it's handled in writing before any work starts.",
      ],
    },
    {
      id: 'how-we-use',
      heading: '4. How we use your information',
      body: [
        {
          list: [
            'To reply to your enquiry and run the calls you book.',
            'To prepare proposals, deliver the services you buy, and support you afterwards.',
            'To send invoices and keep financial records.',
            "To send occasional updates about our work, but only if you've agreed to it. You can unsubscribe any time.",
            'To keep the site secure, fix problems and understand which pages are useful.',
          ],
        },
        "We never sell your personal information, and we don't share it with advertisers.",
      ],
    },
    {
      id: 'legal-basis',
      heading: '5. Legal basis',
      body: [
        "Depending on where you are, we rely on: your consent (for example, marketing emails and non-essential cookies); taking steps to enter or perform a contract with you; our legitimate interest in running and improving our business, where that doesn't override your rights; and meeting legal obligations such as tax and accounting rules.",
      ],
    },
    {
      id: 'sharing',
      heading: '6. Who we share it with',
      body: [
        'We share information only with service providers who help us run the business, and only what they need:',
        {
          list: [
            'Website hosting and security: Cloudflare.',
            'Call booking: Cal.com.',
            'Email and documents: our business email and productivity provider.',
            'Payments: our payment processor and bank.',
            'Messaging: WhatsApp (Meta), if you choose to contact us there.',
          ],
        },
        'We may also share information if the law requires it, or to protect our rights, or as part of a sale or restructure of the business (in which case this policy would still apply).',
      ],
    },
    {
      id: 'international-transfers',
      heading: '7. International transfers',
      body: [
        "We're based in India and most of our clients are in the US, UK, Ireland, Australia and the UAE. That means your information will be processed in India and by providers who may store data in other countries, including the US and EU. Where the law requires it, we use appropriate safeguards such as standard contractual clauses with our providers.",
      ],
    },
    {
      id: 'retention',
      heading: '8. How long we keep it',
      body: [
        {
          list: [
            "Enquiries that don't become projects: up to 24 months, then deleted.",
            'Client project records and correspondence: for the length of the engagement plus up to 3 years, so we can support you and handle any questions.',
            'Invoices and financial records: as long as Indian tax law requires, currently 8 years.',
            'Logins and passwords you share with us for a project: deleted or handed back when the project or care plan ends.',
          ],
        },
        'You can ask us to delete your information sooner (see your rights below).',
      ],
    },
    {
      id: 'security',
      heading: '9. How we protect it',
      body: [
        'We use encrypted connections (HTTPS) across the site, limit access to the people who need it, use two-factor authentication on our business accounts, and store shared credentials in a password manager rather than in email. No system is perfectly secure, but we take this seriously and will tell you promptly if a breach affects your information.',
      ],
    },
    {
      id: 'your-rights',
      heading: '10. Your rights',
      body: [
        'Depending on where you live (for example under India\'s Digital Personal Data Protection Act, the EU and UK GDPR, or US state privacy laws such as California\'s), you may have the right to:',
        {
          list: [
            'see the personal information we hold about you;',
            "correct it if it's wrong;",
            'ask us to delete it;',
            'object to or restrict how we use it;',
            'withdraw consent at any time, where we rely on consent;',
            'get a copy in a portable format;',
            'complain to your local data protection authority.',
          ],
        },
        "To use any of these rights, email admin@wwisermind.com. We'll reply within 30 days and may need to confirm your identity first. We don't charge for this.",
      ],
    },
    {
      id: 'grievance-officer',
      heading: '11. Grievance officer',
      body: [
        'For India, our grievance officer is SrikaantH, Founder, reachable at admin@wwisermind.com.',
      ],
    },
    {
      id: 'children',
      heading: '12. Children',
      body: [
        "Our services are for businesses. We don't knowingly collect information from anyone under 18.",
      ],
    },
    {
      id: 'other-sites',
      heading: '13. Links to other sites',
      body: [
        "Our site links to other websites, including client sites and directories like Psychology Today. We're not responsible for how those sites handle your information, so check their policies.",
      ],
    },
    {
      id: 'changes',
      heading: '14. Changes to this policy',
      body: [
        "If we change this policy, we'll update the date at the top of this page. If the change is significant, we'll let current clients know by email.",
      ],
    },
  ],
};

/* --- B. Terms & Conditions ------------------------------------------------------------- */

export const termsAndConditions: LegalDoc = {
  slug: 'terms-and-conditions',
  title: 'Terms & Conditions',
  metaTitle: 'Terms & Conditions | wwisermind',
  metaDescription:
    'The terms that apply when you use the wwisermind website or buy website, SEO, AI and marketing services from us.',
  lastUpdated: LAST_UPDATED,
  intro:
    'These terms apply when you use this website or buy services from wwisermind, a brand of Stringhead Technologies Private Limited ("we", "us", "our"). If you sign a proposal or statement of work with us, that document sits alongside these terms. If the two ever disagree, the signed proposal wins.',
  sections: [
    {
      id: 'using-the-site',
      heading: '1. Using this website',
      body: [
        "You're welcome to read, share and link to our pages. Please don't copy our designs, copy or code for your own commercial use, try to break or overload the site, or use it for anything unlawful. The free tools, templates and freebies are for your own practice. Don't resell them.",
      ],
    },
    {
      id: 'site-information',
      heading: '2. Information on this site',
      body: [
        "Our articles, guides and tools give general information about marketing for therapy practices. They aren't legal, clinical, compliance or financial advice. Check anything important with a qualified professional before relying on it.",
      ],
    },
    {
      id: 'our-services',
      heading: '3. Our services',
      body: [
        "We design, build and look after websites, and provide SEO, AEO, GEO, AI search optimisation, copywriting, Meta ads and related services for therapists and psychologists. What's included in each service is set out on its service or pricing page, or in your proposal.",
      ],
    },
    {
      id: 'prices',
      heading: '4. Quotes and prices',
      body: [
        "Prices on our site are in US dollars unless stated otherwise. They don't include taxes, payment processor fees, or third-party costs such as domains, premium plugins, stock images or ad spend, unless the page says they do. A quote is valid for 30 days.",
      ],
    },
    {
      id: 'payment',
      heading: '5. Payment',
      body: [
        {
          list: [
            'One-time projects: paid as set out in your proposal, usually a deposit to book your slot and the balance before launch.',
            'Monthly plans: billed in advance each month.',
            'Plans with a minimum term (for example Hyper Growth Marketing, 12 months, or the One-Week Website on the 12-month monthly option): billed monthly, and you agree to pay for the full minimum term.',
          ],
        },
        "Invoices are due within 7 days. If a payment is more than 14 days late we may pause work until it's settled.",
      ],
    },
    {
      id: 'cancelling',
      heading: '6. Contracts and cancelling',
      body: [
        "Most monthly plans have no long-term contract. You can cancel with 30 days' written notice by emailing admin@wwisermind.com. The exceptions are plans that say they have a fixed or minimum term; those run for the term you signed up for. Fees already paid for work we've started or months already begun aren't refundable, unless the law says otherwise.",
      ],
    },
    {
      id: 'your-responsibilities',
      heading: '7. What we need from you',
      body: [
        "To hit timelines (especially the one-week build), we need your content, photos, approvals and access on time. If something we need is late, the timeline moves by the same amount. You confirm that anything you give us (text, images, logos, testimonials) is yours to use or that you have permission, and that it's accurate.",
      ],
    },
    {
      id: 'compliance',
      heading: '8. Health information and compliance',
      body: [
        "You are responsible for how your practice handles client information and for meeting the rules that apply to you, such as HIPAA in the US or GDPR in the UK and EU. We build forms and sites with privacy in mind, but we're not your compliance adviser. If your project needs a Business Associate Agreement or a similar contract, tell us before we start and we'll confirm in writing whether we can sign one. Please don't send us client health records.",
      ],
    },
    {
      id: 'revisions',
      heading: '9. Revisions and approvals',
      body: [
        'Each service includes the rounds of revisions listed on its page or in your proposal. Extra changes, or new work outside the agreed scope, are quoted separately before we do them.',
      ],
    },
    {
      id: 'ownership',
      heading: '10. Ownership',
      body: [
        "Once you've paid in full for a website or other deliverable, you own the final design, copy and content we created for you. We keep ownership of our own tools, templates, frameworks and know-how, and we give you a permanent licence to use whatever of those is built into your site. Third-party items (themes, plugins, fonts, stock images) stay under their own licences. We may show your project in our portfolio unless you ask us not to.",
      ],
    },
    {
      id: 'results',
      heading: '11. Results',
      body: [
        "We work hard to improve your visibility and enquiries, but search engines, AI tools and ad platforms are outside our control. We can't guarantee specific rankings, AI recommendations, traffic, leads or bookings.",
      ],
    },
    {
      id: 'third-parties',
      heading: '12. Third-party services',
      body: [
        "Our work often relies on other platforms, such as hosting, WordPress, Google, Meta, Cal.com and AI tools. We're not responsible if those services change, go down or change their rules, though we'll help you work around it.",
      ],
    },
    {
      id: 'liability',
      heading: '13. Limitation of liability',
      body: [
        "To the extent the law allows, we're not liable for indirect losses such as lost profits, lost data or lost business. Our total liability for any claim is limited to the fees you paid us in the 3 months before the claim. Nothing here limits liability that can't be limited by law.",
      ],
    },
    {
      id: 'confidentiality',
      heading: '14. Confidentiality',
      body: [
        "We keep your business information, logins and anything you mark as confidential private, and only use it to do the work. We ask you to do the same with our proposals and pricing that aren't public.",
      ],
    },
    {
      id: 'termination',
      heading: '15. Ending the relationship',
      body: [
        "Either of us can end an engagement if the other seriously breaks these terms and doesn't fix it within 14 days of being told. When we part ways, we'll hand over your files and access, provided all invoices are paid.",
      ],
    },
    {
      id: 'referral-program',
      heading: '16. Referral program',
      body: [
        'If you refer a practice to us through our Refer wwisermind page, these rules apply.',
        {
          list: [
            "A referral counts when the practice wasn't already talking to us, becomes a client within 6 months of your referral, and pays at least $1,000 with us.",
            "Your reward is $250 paid to you, or $300 credit on your wwisermind plan if you're already a client. We pay it within 30 days of the referred practice reaching $1,000 in payments.",
            'Cash rewards are sent by PayPal or Wise. Any transfer fees or taxes on your side are yours to handle.',
            'The practice you refer gets 10% off their first project.',
            "One reward per new client. Self-referrals and referrals of existing clients don't qualify.",
            'We may change or end the program at any time. Referrals already submitted will be honoured under the rules in place when you sent them.',
          ],
        },
      ],
    },
    {
      id: 'governing-law',
      heading: '17. Governing law',
      body: [
        "These terms are governed by the laws of India. If a dispute comes up, we'll first try to sort it out by talking. If that doesn't work, the courts of Pune, Maharashtra will have jurisdiction.",
      ],
    },
    {
      id: 'changes',
      heading: '18. Changes',
      body: [
        'We may update these terms from time to time. The version on this page on the day you sign a proposal applies to that engagement.',
      ],
    },
    {
      id: 'contact',
      heading: '19. Contact',
      body: [
        'Stringhead Technologies Private Limited (wwisermind), 1st Floor, Indialand Global Tech Park, Hinjawadi Rd, Phase 1, Pune, India. admin@wwisermind.com, +91-91754 14055.',
      ],
    },
  ],
};

/* --- C. Cookie Policy ------------------------------------------------------------------ */

export const cookiePolicy: LegalDoc = {
  slug: 'cookie-policy',
  title: 'Cookie Policy',
  metaTitle: 'Cookie Policy | wwisermind',
  metaDescription:
    'Which cookies and similar technologies the wwisermind website uses, why, and how to control them.',
  lastUpdated: LAST_UPDATED,
  intro:
    'This page explains the cookies and similar technologies used on the wwisermind website. We keep them to a minimum.',
  sections: [
    {
      id: 'what-are-cookies',
      heading: '1. What cookies are',
      body: [
        'Cookies are small text files a website stores in your browser. Some are needed for a site to work. Others help the site owner understand how people use it. Similar technologies, like local storage, work in much the same way, and this policy covers them too.',
      ],
    },
    {
      id: 'cookies-we-use',
      heading: '2. Cookies we use',
      body: [
        { subheading: 'Strictly necessary' },
        "These keep the site secure and working. They don't need your consent.",
        {
          list: [
            'Cloudflare (for example `__cf_bm`, `cf_clearance`): protect the site from bots and abuse. Expire within 30 minutes to a year.',
          ],
        },
        { subheading: 'Functional' },
        {
          list: [
            'Cal.com: set when you open or use the booking calendar, so it remembers your timezone and booking details.',
            'Local storage on our site: remembers small preferences, such as a dismissed announcement bar. Stays until you clear your browser data.',
          ],
        },
        { subheading: 'Embedded content' },
        {
          list: [
            'Videos, maps or social links may set cookies from those providers (for example Google Maps, LinkedIn, Facebook, Instagram, X) if you interact with them. Their own cookie policies apply.',
          ],
        },
        "We don't use advertising or retargeting cookies on this site.",
      ],
    },
    {
      id: 'managing-cookies',
      heading: '3. Managing cookies',
      body: [
        "You can block or delete cookies in your browser settings. Here's where to find them in Chrome, Safari, Firefox and Edge: Settings, then Privacy (or Privacy and Security), then Cookies. Blocking strictly necessary cookies may stop parts of the site, like booking a call, from working.",
      ],
    },
    {
      id: 'changes',
      heading: '4. Changes',
      body: [
        "If we add or remove cookies, we'll update this page and the date at the top.",
      ],
    },
    {
      id: 'contact',
      heading: '5. Contact',
      body: [
        {
          lead: 'Questions about cookies? Email admin@wwisermind.com. For more on how we handle personal information, see our ',
          link: { label: 'Privacy Policy', href: routes.privacyPolicy },
          trail: '.',
        },
      ],
    },
  ],
};

export const legalDocs = [privacyPolicy, termsAndConditions, cookiePolicy] as const;
