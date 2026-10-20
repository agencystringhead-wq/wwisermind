import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import { sitemapGroups, type SitemapLink } from '@/lib/sitemap';
import styles from './SitemapPage.module.css';

export const sitemapPage = {
  title: 'Sitemap',
  sub: 'Every page on our site, in one place.',
};

function Links({ links }: { links: SitemapLink[] }) {
  return (
    <ul className={styles.list}>
      {links.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={styles.link}>
            {item.label}
          </Link>
          {item.children && item.children.length > 0 ? (
            <Links links={item.children} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * /sitemap/ — the human one. A light hero, then the groups from lib/sitemap.ts in columns:
 * four on desktop, two on a tablet, one on a phone. The same list writes /sitemap.xml.
 */
export default function SitemapPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: sitemapPage.title, href: routes.sitemap },
        ]}
      />

      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>{sitemapPage.title}</h1>
          <p className={styles.sub}>{sitemapPage.sub}</p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.columns}`}>
          {sitemapGroups().map((group) => (
            <nav className={styles.group} key={group.title} aria-labelledby={`sitemap-${group.title}`}>
              <h2 className={styles.heading} id={`sitemap-${group.title}`}>
                {group.title}
              </h2>
              <Links links={group.links} />
            </nav>
          ))}
        </div>
      </section>
    </>
  );
}
