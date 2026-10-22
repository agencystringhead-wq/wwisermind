import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import SocialLinks from '@/components/SocialLinks';
import { freebiePath, getFreebie, isLive } from '@/lib/freebies';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/therapyindex/config';
import styles from './footer.module.css';

type FooterCity = { slug: string; name: string; href: string };

/** The free tools, by the name the footer gives them. A link appears only once its page is live; with none live the column is left out. */
const TOOLS = [
  { label: 'website scorecard', slug: 'website-scorecard-for-therapists' },
  { label: 'Local Visibility Assessment', slug: 'ai-visibility-report' },
] as const;

/**
 * The Therapy Index's footer, used in place of the site's on its pages: deep navy, light text, no clocks and no office address.
 * Research-property style: what the index is, where to go next, whose it is, and the plain terms it runs on.
 */
export default function TiFooter({ cities, date }: { cities: FooterCity[]; date: string }) {
  const hub = routes.therapyIndex.hub;
  const tools = TOOLS.flatMap((tool) => {
    const freebie = getFreebie(tool.slug);
    return freebie && isLive(freebie) ? [{ label: tool.label, href: freebiePath(freebie) }] : [];
  });

  return (
    <footer className={styles.footer}>
      <div className={styles.frame}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href={hub} prefetch={false} className={styles.brand} aria-label="Therapy Index home">
              <svg className={styles.ring} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" fill="none" stroke="#ffffff" strokeWidth="3.2" />
              </svg>
              <span className={styles.wordmark}>therapy index.</span>
            </Link>
            <p className={styles.lede}>Independent research on how therapy practices are found on Google, Maps and AI.</p>
            <p className={styles.updated}>Updated monthly. Latest snapshot: {date}.</p>
          </div>

          <nav className={styles.columns} aria-label="Therapy Index footer">
            <div className={styles.column}>
              <h2 className={styles.colTitle}>
                <span>01</span> / Cities
              </h2>
              <ul>
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.href} prefetch={false} className={styles.link}>
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={`${CONTACT_MAILTO}?subject=${encodeURIComponent('Request a city for the Therapy Index')}`} className={styles.link}>
                    Request your city
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.column}>
              <h2 className={styles.colTitle}>
                <span>02</span> / Understand
              </h2>
              <ul>
                <li>
                  <Link href={`${hub}#process`} prefetch={false} className={styles.link}>
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href={routes.therapyIndex.methodology} prefetch={false} className={styles.link}>
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href={`${hub}#faq`} prefetch={false} className={styles.link}>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href={`${hub}#searches`} prefetch={false} className={styles.link}>
                    Searches we track
                  </Link>
                </li>
              </ul>
            </div>

            {tools.length ? (
              <div className={styles.column}>
                <h2 className={styles.colTitle}>
                  <span>03</span> / Free tools
                </h2>
                <ul>
                  {tools.map((tool) => (
                    <li key={tool.href}>
                      <Link href={tool.href} prefetch={false} className={styles.link}>
                        {tool.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={styles.column}>
              <h2 className={styles.colTitle}>
                <span>{tools.length ? '04' : '03'}</span> / Get help
              </h2>
              <ul>
                <li>
                  <CtaLink href={routes.contactBook} className={styles.link}>
                    Free consultation
                  </CtaLink>
                </li>
                <li>
                  <Link href={routes.services.localSeo} prefetch={false} className={styles.link}>
                    Local SEO for therapists
                  </Link>
                </li>
                <li>
                  <Link href={routes.services.customWebsite} prefetch={false} className={styles.link}>
                    Website design for therapists
                  </Link>
                </li>
                <li>
                  <Link href={routes.contact} prefetch={false} className={styles.link}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className={styles.property}>
          <p className={styles.propertyText}>The Therapy Index is a research property of</p>
          <Link href={routes.home} className={styles.logoLink} aria-label="wwisermind, homepage">
            <Image src="/images/therapyindex/wwisermind-logo-white.webp" alt="wwisermind" width={1389} height={244} className={styles.logo} />
          </Link>
          <p className={styles.propertyLine}>Websites and marketing for therapists and psychologists.</p>
        </div>

        <p className={styles.disclaimer}>
          <strong>Independent research.</strong> The Therapy Index is not affiliated with, or endorsed by, any practice listed. Every
          practice gets a do-follow link to its own website. Scores come only from public search data, and nobody can pay to rank. To have
          a practice removed, email <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>, no questions asked.
        </p>

        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 wwisermind</p>
          <ul className={styles.legal}>
            <li>
              <Link href={routes.privacyPolicy} prefetch={false}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={routes.termsAndConditions} prefetch={false}>
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href={routes.cookiePolicy} prefetch={false}>
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href={routes.sitemap} prefetch={false}>
                Sitemap
              </Link>
            </li>
          </ul>
          <SocialLinks className={styles.social} linkClassName={styles.socialLink} />
        </div>
      </div>
    </footer>
  );
}
