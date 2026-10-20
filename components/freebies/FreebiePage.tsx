import Link from 'next/link';
import Image from 'next/image';
import local from '@/components/pricing/LocalSeo.module.css';
import LocalSeoFaq from '@/components/pricing/LocalSeoFaq';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CheckIcon } from '@/components/ui/icons';
import {
  FORM_ENDPOINT,
  eyebrowFor,
  formCopy,
  freebiePath,
  pageCopy,
  privacyPolicyHref,
  signatureCopy,
  signatureGuide,
  type Freebie,
} from '@/lib/freebies';
import { routes } from '@/lib/routes';
import EmailSignature from './EmailSignature';
import FreebieForm from './FreebieForm';
import SignatureGuide from './SignatureGuide';
import styles from './Freebies.module.css';

/**
 * The one page every freebie shares, read from lib/freebies.ts: a text hero, a breadcrumb row, then
 * two columns (what is inside and a note on the left; a preview and the get-it box on the right),
 * the related service band and a small FAQ. Below 1024px the columns stack with the get-it box
 * straight after "What's inside". The get-it box is the email form for a gated freebie and a
 * "tell me when it's ready" form for a coming-soon one. The code freebie is the signature
 * generator: it takes the full width in one box, with a short guide under it, and no columns.
 * A freebie can set its own H1 and the line under it (`heading`, `sub`). A `direct` freebie has no
 * form: its get-it box is the download button and a second link.
 */
export default function FreebiePage({ freebie }: { freebie: Freebie }) {
  const soon = freebie.status === 'comingSoon';
  const isCode = freebie.type === 'code';
  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  const faqData =
    freebie.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: freebie.faq.map((item) => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: { '@type': 'Answer', text: item.body },
          })),
        }
      : null;

  const formProps = {
    freebie: freebie.title,
    endpoint: FORM_ENDPOINT,
    privacyHref: privacyPolicyHref,
    copy: formCopy,
    assetUrl: freebie.assetUrl,
    assetLabel: freebie.assetLabel,
    askPhone: freebie.askPhone ?? false,
  };

  return (
    <>
      {faqData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      ) : null}

      <section className={local.section}>
        <div className={`container ${styles.pageHero}`}>
          <p className={local.eyebrow}>{soon ? 'Coming soon' : eyebrowFor(freebie)}</p>
          <h1 className={local.heroTitle}>{freebie.heading ?? freebie.title}</h1>
          <p className={`${local.heroSub} ${styles.lede}`}>{freebie.sub ?? freebie.longDescription}</p>
        </div>
      </section>

      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Freebies', href: routes.freebies.hub },
          { label: freebie.title, href: freebiePath(freebie) },
        ]}
      />

      <section className={local.section}>
        <div className="container">
          {isCode ? (
            <div className={`${styles.box} ${styles.boxWide}`}>
              <EmailSignature copy={signatureCopy} />
            </div>
          ) : (
          <div className={styles.main}>
            <div className={styles.inside}>
              {freebie.whatsInside.length > 0 ? (
                <>
                  <h2 className={styles.insideTitle}>{pageCopy.insideTitle}</h2>
                  <ul className={styles.insideList}>
                    {freebie.whatsInside.map((item) => (
                      <li key={item}>
                        <CheckIcon />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {freebie.pageNote ? <p className={styles.note}>{freebie.pageNote}</p> : null}
            </div>

            <div className={styles.preview}>
              {freebie.previewImage ? (
                <Image
                  src={freebie.previewImage.src}
                  alt={freebie.previewImage.alt}
                  width={freebie.previewImage.width}
                  height={freebie.previewImage.height}
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.previewSlot}>{pageCopy.previewPlaceholder}</div>
              )}
            </div>

            <div className={styles.box}>
              {freebie.direct ? (
                <div className={styles.direct}>
                  <a href={freebie.assetUrl} className={styles.assetButton} download>
                    {freebie.assetLabel}
                  </a>
                  <Link href={freebie.direct.secondaryHref} className={styles.directLink}>
                    {freebie.direct.secondaryLabel}
                  </Link>
                </div>
              ) : (
                <FreebieForm mode={soon ? 'notify' : 'gated'} {...formProps} />
              )}
            </div>
          </div>
          )}

          {isCode ? <SignatureGuide guide={signatureGuide} /> : null}

          <div className={styles.relatedWrap}>
            <div className={local.band}>
              <div>
                <h3 className={local.bandTitle}>{freebie.relatedService.text}</h3>
              </div>
              <Link href={freebie.relatedService.href} className={local.buttonBlue}>
                {freebie.relatedService.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {faqData ? <LocalSeoFaq copy={pageCopy.faqCopy} items={freebie.faq} /> : null}
    </>
  );
}
