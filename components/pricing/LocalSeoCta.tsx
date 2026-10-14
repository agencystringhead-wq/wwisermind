import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import type { FinalCta } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 9, shared: the closing call to action, with plain promises under the button when
    the page has any. */
export default function LocalSeoCta({ cta }: { cta: FinalCta }) {
  return (
    <section className={styles.cta}>
      <div className={`container ${styles.ctaInner}`}>
        <h2 className={styles.ctaTitle}>{cta.title}</h2>
        <p className={styles.ctaSub}>{cta.sub}</p>
        <Link href={cta.button.href} className={styles.buttonBlue}>
          {cta.button.label}
        </Link>
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
