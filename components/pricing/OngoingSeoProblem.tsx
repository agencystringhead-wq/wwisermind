import Image from 'next/image';
import CtaLink from '@/components/booking/CtaLink';
import { problem, problemImage } from '@/lib/pricing/ongoing-seo';
import local from './LocalSeo.module.css';
import styles from './OngoingSeo.module.css';

/** Frame 2: text on the left, a picture on the right. The two-column grid and the picture
    frame are the hero's own; the lower fold, so the picture loads lazily. */
export default function OngoingSeoProblem() {
  return (
    <section className={local.section}>
      <div className={`container ${local.heroGrid}`}>
        <div>
          <p className={local.eyebrow}>{problem.eyebrow}</p>
          <h2 className={`${local.heading} ${styles.problemHeading}`}>{problem.title}</h2>
          <p className={`${local.lede} ${styles.problemBody}`}>{problem.body}</p>
          <CtaLink href={problem.button.href} className={`${local.button} ${styles.problemButton}`}>
            {problem.button.label}
          </CtaLink>
        </div>

        <div className={local.heroMedia}>
          <Image
            src={problemImage.src}
            alt={problemImage.alt}
            width={problemImage.width}
            height={problemImage.height}
            className={local.heroImage}
            loading="lazy"
            sizes="(max-width: 1023px) 100vw, 620px"
          />
        </div>
      </div>
    </section>
  );
}
