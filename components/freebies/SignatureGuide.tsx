import local from '@/components/pricing/LocalSeo.module.css';
import type { signatureGuide } from '@/lib/freebies';
import styles from './Freebies.module.css';

/** "What to include in a therapist email signature": a short intro and six compact cards, read from
    lib/freebies.ts. Sits under the generator on the email signature page. */
export default function SignatureGuide({ guide }: { guide: typeof signatureGuide }) {
  return (
    <section className={styles.guide} aria-labelledby="signature-guide-title">
      <p className={local.eyebrow}>{guide.eyebrow}</p>
      <h2 className={styles.guideTitle} id="signature-guide-title">
        {guide.title}
      </h2>
      <p className={styles.guideIntro}>{guide.intro}</p>

      <ul className={styles.guideGrid}>
        {guide.items.map((item, index) => (
          <li className={styles.guideCard} key={item.title}>
            <span className={styles.guideNum} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={styles.guideCardTitle}>{item.title}</h3>
            <p className={styles.guideCardBody}>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
