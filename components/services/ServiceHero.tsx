import CtaLink from '@/components/booking/CtaLink';
import Link from 'next/link';
import { contactPage, siteConfig } from '@/lib/site';
import { getTool } from '@/lib/tools';
import type { Service } from '@/lib/services';
import BackgroundVideo from '@/components/ui/BackgroundVideo';
import styles from './ServiceHero.module.css';

/**
 * A service page's opening frame: the contact hero's dark ground, clip and veil, with the
 * page's own centred stack over it — the breadcrumb, the yellow h1, the outcome line and
 * the one button, every one of them on the page's centre axis.
 *
 * The breadcrumb is a real list with the category as the current step. "Services" is not
 * a link because there is no index page for it to reach yet; the arrow between the two is
 * decoration and hidden from a screen reader, which hears "Services, Website Design".
 *
 * `withMosaic` adds the gallery's overlap to the bottom padding, exactly as the contact
 * hero does, so the mosaic straddles the dark edge; without a gallery the frame keeps
 * its own foot.
 */
export default function ServiceHero({
  service,
  withMosaic,
}: {
  service: Service;
  withMosaic: boolean;
}) {
  const { background } = contactPage.hero;
  const [source] = background.sources;
  const tool = service.relatedTool ? getTool(service.relatedTool) : null;

  return (
    <section className={`${styles.section} ${withMosaic ? styles.sectionMosaic : ''}`}>
      <BackgroundVideo
        src={source.src}
        type={source.type}
        poster={background.poster}
        className={styles.video}
      />
      <span className={styles.veil} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumb}>
            <li>Services</li>
            <li aria-current="page">
              <span className={styles.crumbArrow} aria-hidden="true">
                ↳
              </span>
              {service.category}
            </li>
          </ol>
        </nav>

        <h1 className={styles.heading}>{service.name}</h1>
        <p className={styles.outcome}>{service.heroOutcome}</p>

        <CtaLink href={siteConfig.bookingPage} className={styles.button}>
          Book a free call
        </CtaLink>
        {tool?.heroLink ? (
          <Link
            href={tool.route}
            className={styles.toolLink}
            data-tool={tool.id}
            data-placement="service-hero-link"
          >
            {tool.heroLink}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
