import { Fragment } from 'react';
import Link from 'next/link';
import { footerCta, footerMain, type FooterGroup } from '@/lib/site';
import CtaBadge from './CtaBadge';
import styles from './Footer.module.css';

function LinkGroup({ group }: { group: FooterGroup }) {
  return (
    <div>
      {group.title ? <p className={styles.groupTitle}>{group.title}</p> : null}
      {group.title2 ? (
        <p className={`${styles.groupTitle} ${styles.groupTitleSecond}`}>{group.title2}</p>
      ) : null}

      {group.links ? (
        <div className={styles.links}>
          {group.links.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`${styles.link} ${group.uppercaseLinks ? styles.linkUpper : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      {group.lines ? (
        <p className={styles.lines}>
          {group.lines.map((line, index) => (
            <span key={line}>
              {line}
              {index < group.lines!.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export default function Footer() {
  const { headingLines, bodyLines, badge } = footerCta;
  const { headline, contactLabel, email, copyright, rows, social, watermark } = footerMain;

  return (
    <footer>
      <section className={styles.cta}>
        <span className={styles.ripples} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className={styles.ripple} />
          ))}
        </span>

        <CtaBadge lines={badge.lines} href={badge.href} className={styles.badge} />

        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.heading}>
            {headingLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? (
                  <>
                    {' '}
                    <br />
                  </>
                ) : null}
                {line}
              </Fragment>
            ))}
          </h2>

          <p className={styles.body}>
            {bodyLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? (
                  <>
                    {' '}
                    <br className={styles.bodyBreak} />
                  </>
                ) : null}
                {line}
              </Fragment>
            ))}
          </p>

          <Link href={badge.href} className={styles.pill}>
            {badge.pillLabel}
          </Link>
        </div>
      </section>

      <section className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div>
                <p className={styles.headline}>
                  {headline[0]}
                  <br />
                  {headline[1]}
                </p>

                <p className={styles.contact}>
                  {contactLabel}
                  <br />
                  <a href={`mailto:${email}`}>{email}</a>
                </p>
              </div>

              <p className={styles.copyright}>
                {copyright.lead}
                <Link href="/">{copyright.brand}</Link>
                {copyright.tail}
              </p>
            </div>

            {rows.flat().map((group, index) => (
              <LinkGroup group={group} key={group.title ?? `group-${index}`} />
            ))}
          </div>

          <nav className={styles.social} aria-label="Social">
            {social.map((item) => (
              <Link href={item.href} className={styles.socialLink} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.watermarkBox} aria-hidden="true">
            <div className={styles.watermark}>
              <span className={styles.watermarkWord}>{watermark}</span>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
