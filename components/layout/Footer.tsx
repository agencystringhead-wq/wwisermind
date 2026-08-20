import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { footerCta, footerMain } from '@/lib/site';
import CtaBadge from './CtaBadge';
import FooterClocks from './FooterClocks';
import FooterDotText from './FooterDotText';
import FooterTabs from './FooterTabs';
import styles from './Footer.module.css';

function CalendarIcon() {
  return (
    <svg className={styles.ctaIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 14h2v2h-2zM11 14h2v2h-2zM14.5 14h2v2h-2z" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  const { headingLines, bodyLines, badge } = footerCta;
  const {
    tagline,
    logo,
    social,
    navColumns,
    cta,
    tabs,
    thumbnail,
    contact,
    love,
    clocks,
    legal,
    media,
  } = footerMain;

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
        <div className={`container ${styles.grid}`}>
          {/* --- row 1: tagline over its own short rule ------------------------- */}
          <p className={styles.tagline}>
            {tagline[0]}
            <br />
            {tagline[1]}
          </p>

          <span className={styles.ruleShort} aria-hidden="true" />
          <span className={styles.ruleLong} aria-hidden="true" />

          {/* --- row 2: brand rail, link columns, schedule-a-call --------------- */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logoLink} aria-label={logo.alt}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className={styles.logo}
              />
            </Link>

            <nav className={styles.social} aria-label="Social">
              {social.map((item) => (
                <a
                  href={item.href}
                  key={item.label}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image src={item.icon} alt={item.label} width={40} height={40} />
                </a>
              ))}
            </nav>
          </div>

          <nav className={styles.navColumns} aria-label="Footer">
            {navColumns.map((column) => (
              <div className={styles.navColumn} key={column[0].label}>
                {column.map((item) => (
                  <Link href={item.href} className={styles.navLink} key={item.label}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.ctaBlock}>
            <Link href={cta.href} className={styles.ctaButton}>
              <CalendarIcon />
              {cta.label}
            </Link>

            <p className={styles.ctaNote}>
              {cta.note.lead}
              <Link href={cta.note.href}>{cta.note.linkLabel}</Link>
              {cta.note.tail}
            </p>
          </div>

          {/* --- row 3: tabbed services list over its own rule ------------------ */}
          <FooterTabs tabs={tabs} />
          <span className={styles.ruleTabs} aria-hidden="true" />

          {/* --- row 4: thumbnail, contact detail, love note + world clock ------ */}
          <Image
            src={thumbnail.src}
            alt={thumbnail.alt}
            width={thumbnail.width}
            height={thumbnail.height}
            className={styles.thumbnail}
          />

          <div className={styles.detailOffice}>
            <p className={styles.detailLabel}>{contact.headOffice.label}</p>
            <p className={styles.detailValue}>
              {contact.headOffice.lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </p>
            <a className={styles.detailLink} href={contact.headOffice.link.href} target="_blank" rel="noreferrer">
              <span className={styles.detailArrow} aria-hidden="true">
                &#8627;
              </span>
              {contact.headOffice.link.label}
            </a>
          </div>

          <div className={styles.detailReach}>
            <div>
              <p className={styles.detailLabel}>{contact.email.label}</p>
              <p className={styles.detailValue}>
                <a href={contact.email.href}>{contact.email.value}</a>
              </p>
            </div>

            <div>
              <p className={styles.detailLabel}>{contact.hotline.label}</p>
              <p className={styles.detailValue}>
                <a href={contact.hotline.href}>{contact.hotline.value}</a>
              </p>
            </div>
          </div>

          <div className={styles.detailAccepting}>
            <p className={styles.detailLabel}>{contact.accepting.label}</p>
            <p className={styles.detailValue}>{contact.accepting.value}</p>
          </div>

          <div className={styles.detailHours}>
            <p className={styles.detailLabel}>{contact.hours.label}</p>
            <p className={styles.detailValue}>{contact.hours.value}</p>
          </div>

          <div className={styles.aside}>
            <p className={styles.love}>
              {love.lead}
              <Image
                src={love.icon}
                alt={love.iconAlt}
                width={40}
                height={40}
                className={styles.loveIcon}
              />
              {love.tail}
            </p>

            <FooterClocks clocks={clocks} />
          </div>

          {/* --- row 5: legal -------------------------------------------------- */}
          <span className={styles.ruleFull} aria-hidden="true" />

          <p className={styles.copyright}>
            <span>{legal.copyright}</span>
            <span>{legal.rights}</span>
          </p>

          <nav className={styles.legalLinks} aria-label="Legal">
            {legal.links.map((item) => (
              <Link href={item.href} key={item.label}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* --- closing panel: looping video, dotted headline, clipped word -------- */}
      <section className={styles.media}>
        <video
          className={styles.mediaVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          {media.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>

        <span className={styles.mediaWash} aria-hidden="true" />

        {/* A plain space between the words: the plus sign's own side bearings already open
            the gap the reference shows. */}
        <FooterDotText text={media.headline.join(' ')} />

        <div className={`container ${styles.watermarkBox}`} aria-hidden="true">
          <div className={styles.watermark}>
            <span className={styles.watermarkWord}>{media.watermark}</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
