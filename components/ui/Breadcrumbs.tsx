import Link from 'next/link';
import { absUrl } from '@/lib/site';
import styles from './Breadcrumbs.module.css';

export type Crumb = { label: string; href: string };

/** The BreadcrumbList structured data for a trail, Home first and the current page last. Every
    page except the homepage carries one; the pricing and service pages also show the row. */
export function BreadcrumbJsonLd({ trail }: { trail: Crumb[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absUrl(crumb.href),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}

/** The visible breadcrumb row and its structured data, from one trail so they cannot differ.
    `related` is the pricing page's link to its service, or the service's link to its pricing. */
export default function Breadcrumbs({
  trail,
  related,
}: {
  trail: Crumb[];
  related?: Crumb;
}) {
  return (
    <>
      <BreadcrumbJsonLd trail={trail} />
      <div className={styles.bar}>
        <div className={`container ${styles.inner}`}>
          <nav aria-label="Breadcrumb">
            <ol className={styles.crumbs}>
              {trail.map((crumb, index) => (
                <li key={crumb.href}>
                  {index === trail.length - 1 ? (
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {related ? (
            <Link href={related.href} className={styles.related}>
              {related.label}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
