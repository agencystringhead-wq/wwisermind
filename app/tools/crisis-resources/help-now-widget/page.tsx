import type { Metadata } from 'next';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import HelpNowGenerator from '@/components/crisis/HelpNowGenerator';
import local from '@/components/pricing/LocalSeo.module.css';
import LocalSeoFaq from '@/components/pricing/LocalSeoFaq';
import Accordion from '@/components/ui/Accordion';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getStatesWithCounties, STATE_NAMES } from '@/lib/crisis-resources';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import styles from '@/components/crisis/HelpNowWidget.module.css';

const title = 'Help Now Widget for Therapist Websites | wwisermind';
const description =
  'A free help now widget that puts 911, 988 and other verified US helplines on your practice website. Pick a state, copy the code, paste it in. We keep the numbers current.';
const url = absUrl(routes.tools.helpNowWidget);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: 'website', siteName: 'wwisermind', title, description, url },
  twitter: { card: 'summary', title, description },
};

const states = Object.entries(STATE_NAMES)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const disclaimer =
  "The help now widget shares public helpline information. It doesn't replace your own emergency procedures or any requirements from your licensing board.";

const noCodeNote =
  'If you do not see this option, your plan may not allow custom code. Contact us and we will help.';

const guides = [
  {
    title: 'WordPress',
    body: 'Use a Custom HTML block on any page or post, or in your footer.',
    steps: [
      'Edit the page where you want the help to appear.',
      'Add a block and choose Custom HTML.',
      'Paste your code into the block.',
      'Use Preview to check it, then update the page.',
    ],
  },
  {
    title: 'Squarespace',
    body: 'Use a Code block.',
    steps: [
      'Edit the page and click where you want the help to appear.',
      'Add a Code block.',
      'Paste your code into it and make sure Display Source is off.',
      'Save the page and view it to check it.',
    ],
  },
  {
    title: 'Wix',
    body: 'Use an Embed HTML element.',
    steps: [
      'In the editor, open Add Elements and choose Embed Code, then Embed HTML.',
      'Choose Enter Code and paste your code in.',
      'Drag the box taller until the whole list shows.',
      'Publish the site and check the page.',
    ],
  },
  {
    title: 'Other platforms',
    body: 'Any HTML embed area works. If your platform blocks scripts, paste just the paragraph inside the code, or contact us.',
    steps: [
      'Find the HTML, code or embed option for the page.',
      'Paste your code where you want the help to appear.',
      'Save, then view the live page to check it.',
    ],
  },
];

const faqs = [
  {
    title: 'Does it slow my site?',
    body: 'It is one small file that loads after your page, so it does not hold up anything else.',
  },
  {
    title: 'Does it track my visitors?',
    body: 'No. It sets no cookies, stores nothing in your visitor’s browser and runs no analytics. Like any file loaded from a website, loading it is a request to our server, and it asks for the list of numbers and nothing else.',
  },
  {
    title: 'What if wwisermind’s site is down?',
    body: 'The paragraph inside your code is what visitors see, and it always names 911 and 988.',
  },
  {
    title: 'Who updates the numbers?',
    body: 'We do. Each entry is checked against its official source, and the widget shows the month it was last verified.',
  },
];

export default function Page() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Add the help now widget to your practice website</h1>
          <p className={styles.intro}>
            It is free and takes a couple of minutes. We keep the numbers current, so you do not have
            to.
          </p>
        </div>
      </section>

      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Crisis Resources by State', href: routes.tools.crisisResources },
          { label: 'Help now widget', href: routes.tools.helpNowWidget },
        ]}
      />

      <div className={`container ${styles.content}`}>
        <HelpNowGenerator states={states} countyStates={getStatesWithCounties()} />

        <section className={styles.section} aria-labelledby="widget-guides">
          <h2 className={styles.sectionTitle} id="widget-guides">
            How to add it to your site
          </h2>
          <Accordion items={guides} numbered defaultOpen={0} />
          <p className={styles.note}>{noCodeNote}</p>
          <p className={styles.note}>{disclaimer}</p>
          <p className={styles.note}>
            Want to see the numbers first? They are on our{' '}
            <Link href={routes.tools.crisisResources}>crisis resources page</Link>.
          </p>
        </section>

        <div className={styles.cta}>
          <div className={local.band}>
            <div>
              <h2 className={local.bandTitle}>Rather we set it up for you?</h2>
            </div>
            <CtaLink href={routes.contactBook} className={local.buttonBlue}>
              Book a free 30-minute call
            </CtaLink>
          </div>
        </div>
      </div>

      <LocalSeoFaq copy={{ eyebrow: 'Questions', title: 'Quick answers', sub: '' }} items={faqs} />
    </>
  );
}
