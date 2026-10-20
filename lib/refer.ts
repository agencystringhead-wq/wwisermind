import { routes } from '@/lib/routes';

/* ==========================================================================
   /refer-wwisermind/: the referral page's copy, all in one place. The words are the owner's.

   Two things in the source copy were left to confirm, and are not guessed here:

   - The reward amounts. The two reward cards say a thank you and a welcome discount will be
     confirmed, with no figure. Put the real offers in `referRewards` when they are decided.
   - The form endpoint. Like the freebie form (lib/freebies.ts) the form posts JSON to
     REFER_ENDPOINT, and while that is empty nothing is sent and the success message shows
     straight away. Point it at the form service when there is one.

   Nothing here is a number the owner has not given. No em dashes or en dashes.
   ========================================================================== */

/* TODO: the endpoint the referral form posts to (a Jotform or other form URL). While this is
   empty the form shows its success message without sending anything. */
export const REFER_ENDPOINT = '';

export const referMeta = {
  title: 'Refer a Therapist to wwisermind | Referral Program',
  description:
    'Know a therapist or group practice who needs a better website or more visibility? Refer them to wwisermind and say thanks in a way that helps you both.',
};

export const FORM_ID = 'refer-form';

export const referHero = {
  eyebrow: 'Refer wwisermind',
  heading: 'Know a therapist who deserves to be found?',
  sub: "Most of our best clients came from one therapist telling another. If you know a practice that's hard to find online, introduce us. If they become a client, we'll thank you properly.",
  button: { label: 'Refer a practice', href: `#${FORM_ID}` },
};

export const referSteps = [
  {
    title: 'Tell us who.',
    body: "Fill in the short form below with their name and practice. Let them know you're passing their details on.",
  },
  {
    title: 'We reach out gently.',
    body: 'One friendly email, mentioning you. No pressure, no chasing, no sales sequences.',
  },
  {
    title: 'You both get a thank you.',
    body: 'When they sign up and pay their first invoice, you get your reward and they get a welcome discount.',
  },
];

export const referRewards = [
  {
    title: 'For you',
    body: 'A thank you from us when your referral becomes a client. We confirm the details when you send it.',
  },
  {
    title: 'For them',
    body: 'A welcome discount on their first project. We confirm the details when we reach out.',
  },
  {
    title: 'No limit',
    body: 'Refer as many practices as you like. Every one that becomes a client counts.',
  },
];

export const referFaq = [
  {
    title: 'Do I need to be a wwisermind client?',
    body: 'No. Therapists, supervisors, practice consultants and anyone else who knows the field can refer.',
  },
  {
    title: 'When do I get the reward?',
    body: 'Within 30 days of the referred practice paying their first invoice.',
  },
  {
    title: 'What counts as a successful referral?',
    body: "A practice we weren't already talking to, who becomes a paying client within 6 months of your referral.",
  },
  {
    title: 'Will you spam the person I refer?',
    body: "No. We send one email, and if they're not interested, that's the end of it.",
  },
  {
    title: "Is there anything you won't accept?",
    body: "Self-referrals and referrals of existing clients don't qualify. We may change or end the program, but any referral already submitted will be honoured under the rules at the time.",
  },
];

export const referForm = {
  heading: 'Make an introduction',
  requiredNote: 'Required fields are marked',
  fields: {
    yourName: 'Your name',
    yourEmail: 'Your email',
    isClient: 'Are you a wwisermind client?',
    theirName: 'Their name',
    theirPractice: 'Their practice name',
    theirContact: 'Their email or website',
    practiceType: 'Solo or group practice?',
    notes: 'Anything we should know?',
    notesHint: 'optional',
    confirm: "I've let them know I'm passing on their details.",
  },
  isClientOptions: ['Yes', 'No'],
  practiceTypeOptions: ['Solo practice', 'Group practice', 'Not sure'],
  submit: 'Send referral',
  sending: 'Sending',
  error: 'Something went wrong. Please try again, or email admin@wwisermind.com.',
  success: "Thank you. We'll reach out to them this week and let you know how it goes.",
  smallPrint: {
    before: 'Rewards are paid once per new client. Full rules are in our ',
    link: { label: 'Terms & Conditions', href: routes.termsAndConditions },
    after: '.',
  },
};
