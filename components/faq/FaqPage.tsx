import ContactHero from '@/components/sections/ContactHero';
import { faqPage, readyItems } from '@/lib/faq';
import FaqAsk from './FaqAsk';
import FaqBody from './FaqBody';
import FaqSearch from './FaqSearch';
import { FaqSearchProvider } from './FaqSearchContext';

/**
 * /faq — header, footer, the floating contact bar and the two yellow bars come from the root
 * layout, and the footer's own "ready to move faster?" block is the closing CTA, as on every
 * other page.
 *
 * Grounds, down the page: dark hero (the only dark frame in the body), white for the
 * questions, a soft blue-grey tint for the ask, then the footer's CTA. The frame above the
 * footer is light, so the two never read as the same background.
 *
 * The FAQPage JSON-LD is built from the ready items only, and its answers are the very
 * strings the accordion prints, so the markup always matches the visible text.
 */
export default function FaqPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: readyItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <FaqSearchProvider>
        <ContactHero
          hero={{
            eyebrow: faqPage.hero.eyebrow,
            heading: faqPage.hero.heading,
            lead: faqPage.hero.lead,
            primary: faqPage.hero.primary,
          }}
          tabs={null}
          overlap={false}
        >
          <FaqSearch />
        </ContactHero>
        <FaqBody />
      </FaqSearchProvider>
      <FaqAsk />
    </>
  );
}
