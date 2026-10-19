import CtaLink from '@/components/booking/CtaLink';
import { CheckIcon } from '@/components/ui/icons';
import type { FinalCta } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 9, shared: the closing call to action, with plain promises under the button when
    the page has any. */
export default function LocalSeoCta({
  cta,
  secondary,
}: {
  cta: FinalCta;
  /** A second, quieter button beside the first. */
  secondary?: { label: string; href: string };
}) {
  return (
    <section className={styles.cta}>
      <div className={`container ${styles.ctaInner}`}>
        <h2 className={styles.ctaTitle}>{cta.title}</h2>
        <p className={styles.ctaSub}>{cta.sub}</p>
        <div className={styles.ctaButtons}>
          <CtaLink href={cta.button.href} className={styles.buttonBlue}>
            {cta.button.label}
          </CtaLink>
          {secondary ? (
            <CtaLink href={secondary.href} className={styles.ctaGhost}>
              {secondary.label}
            </CtaLink>
          ) : null}
        </div>
        {cta.items && cta.items.length > 0 ? (
          <ul className={styles.ctaItems}>
            {cta.items.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
