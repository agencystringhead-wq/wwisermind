import { absUrl } from '@/lib/site';

/* Words for the Good Faith Estimate generator's page: metadata, the privacy line, the short explainer and the FAQs. */

export const GFE_PATH = '/free-tools/good-faith-estimate/';
export const GFE_URL = absUrl(GFE_PATH);
export const GFE_TITLE_TAG = 'Free Good Faith Estimate Generator for Therapists | wwisermind';
export const GFE_DESCRIPTION =
  'Make a Good Faith Estimate PDF for a self-pay therapy client in a few minutes. Free, follows the CMS form, and your client’s details never leave your browser.';

export const PRIVACY_LINE = 'Your client’s details never leave your browser. We don’t see or store them.';
export const PRIVACY_DETAIL =
  'The PDF is built on your device. The only things we receive are your first name, email, practice name and city, so we can send you the link back to this tool.';

export const explainer = {
  heading: 'What a Good Faith Estimate is, and who needs one',
  paragraphs: [
    'A Good Faith Estimate (GFE) is a written estimate of what a client can expect to pay for your services. It comes from the federal No Surprises Act, and it applies when a client has no insurance or is choosing not to use it for their care.',
    'If you see self-pay clients, you are expected to give each one a GFE when they schedule, or within 3 business days if they ask for one. It should list your fees, the services you expect to provide and the dates, in writing, before care begins.',
    'It is an estimate, not a contract. If the final bill ends up $400 or more above the estimate, the client can start a dispute process with the federal government. Keeping the estimate close to what you really expect to charge protects both of you.',
  ],
};

export const faqs = [
  {
    title: 'Who has to give a Good Faith Estimate?',
    body: 'Providers who see clients who are uninsured or who are paying out of pocket instead of using insurance. That includes solo therapists and group practices. Clients who are using their insurance get an Explanation of Benefits from their plan instead.',
  },
  {
    title: 'When does the client need to receive it?',
    body: 'If the first session is at least 10 business days away, the estimate is due within 3 business days of scheduling. If it is 3 to 9 business days away, it is due within 1 business day. If a client asks for one before they book, it is due within 3 business days of the request.',
  },
  {
    title: 'How long is the estimate good for?',
    body: 'For ongoing weekly or monthly sessions, a single estimate can cover up to 12 months. After that, or if the client’s care changes a lot, you issue a new one. If your fee changes, it is worth updating the estimate too.',
  },
  {
    title: 'Do you store my client’s information?',
    body: 'No. The PDF is made in your browser, so your client’s name, date of birth and diagnosis code stay on your device. We only receive your first name, email, practice name and city when you download.',
  },
  {
    title: 'Is this legal advice?',
    body: 'No. This tool follows the layout and wording of the standard CMS form, but we are a marketing agency, not a law firm. If you are unsure whether a client needs a GFE or how to fill one in for an unusual case, check with your licensing board, professional association or a compliance adviser.',
  },
] as const;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.title, acceptedAnswer: { '@type': 'Answer', text: f.body } })),
};

export const toolJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Good Faith Estimate Generator for Therapists',
  url: GFE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: GFE_DESCRIPTION,
};
