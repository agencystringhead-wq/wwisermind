import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { footerMain } from '@/lib/site';
import type { LegalBlock, LegalDoc } from '@/lib/legal';
import type { Route } from '@/lib/routes';
import LegalToc from './LegalToc';
import styles from './LegalPage.module.css';

/** `code` in the copy becomes <code>; nothing else is interpreted. */
function inline(text: string): ReactNode {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p>{inline(block)}</p>;
  if ('list' in block) {
    return (
      <ul>
        {block.list.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>
    );
  }
  if ('subheading' in block) return <h3>{block.subheading}</h3>;
  return (
    <p>
      {block.lead}
      <Link href={block.link.href}>{block.link.label}</Link>
      {block.trail}
    </p>
  );
}

/**
 * The one template for the Privacy Policy, the Terms & Conditions and the Cookie Policy.
 *
 * A plain light hero (eyebrow, title, date, intro), then two columns on desktop: the table of
 * contents on the left, the text on the right at a reading measure. Below 960px the contents
 * fold into a disclosure above the text. Nothing animates on entrance. The header, footer and
 * the floating contact bar come from the root layout.
 */
export default function LegalPage({ doc, path }: { doc: LegalDoc; path: Route }) {
  const { headOffice, email } = footerMain.contact;

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: '/' },
          { label: doc.title, href: path },
        ]}
      />

      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>{doc.title}</h1>
          <p className={styles.updated}>Last updated: {doc.lastUpdated}</p>
          <p className={styles.intro}>{doc.intro}</p>
        </div>
      </section>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.toc}>
          <LegalToc items={doc.sections.map(({ id, heading }) => ({ id, heading }))} />
        </aside>

        <article className={styles.content}>
          {doc.sections.map((section) => (
            <section id={section.id} key={section.id} className={styles.section}>
              <h2>{section.heading}</h2>
              {section.body.map((block, index) => (
                <Block block={block} key={index} />
              ))}
            </section>
          ))}

          <aside className={styles.contact}>
            <p className={styles.contactTitle}>Questions about this policy?</p>
            <p>
              Email <a href={email.href}>{email.value}</a>
            </p>
            <p className={styles.contactAddress}>
              {headOffice.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </aside>
        </article>
      </div>
    </>
  );
}
