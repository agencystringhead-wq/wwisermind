import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import { finalCta } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 9: the closing call to action, with three plain promises under the button. */
export default function LocalSeoCta() {
  return (
    <section className={styles.cta}>
      <div className={`container ${styles.ctaInner}`}>
        <h2 className={styles.ctaTitle}>{finalCta.title}</h2>
        <p className={styles.ctaSub}>{finalCta.sub}</p>
        <Link href={finalCta.button.href} className={styles.buttonBlue}>
          {finalCta.button.label}
        </Link>
        <ul className={styles.ctaItems}>
          {finalCta.items.map((item) => (
            <li key={item}>
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
