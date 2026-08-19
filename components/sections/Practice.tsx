import Image from 'next/image';
import Link from 'next/link';
import { practice } from '@/lib/site';
import styles from './Practice.module.css';

function UpArrow() {
  return (
    <svg className={styles.metricArrow} viewBox="0 0 24 32" fill="currentColor" aria-hidden="true">
      <path d="M12 0l10.5 12.5H16V32H8V12.5H1.5L12 0z" />
    </svg>
  );
}

function LinkArrow() {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 5h11" />
      <path d="M8.5 1.5L12 5l-3.5 3.5" />
    </svg>
  );
}

export default function Practice() {
  const { headingLead, headingRest, metric, rows } = practice;
  const [metricLead, ...metricRest] = metric.label.split(' ');

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading}>
          {headingLead}
          <span className={styles.headingMuted}>{headingRest}</span>
        </h2>

        <div className={styles.rows}>
          {rows.map((row) => (
            <div
              className={`${styles.row} ${row.photoFirst ? styles.rowReverse : ''}`}
              key={row.title}
            >
              <div className={styles.panel}>
                <div className={styles.panelInner}>
                  <div className={styles.widget}>
                    <span className={styles.widgetBack} aria-hidden="true" />

                    <div className={styles.widgetBody}>
                      <p className={styles.metricLabel}>
                        <strong>{metricLead}</strong> {metricRest.join(' ')}
                      </p>
                      <p className={styles.metric}>
                        <UpArrow />
                        <span className={styles.metricValue}>{metric.value}</span>
                        <span className={styles.metricUnit}>{metric.unit}</span>
                      </p>
                      <span className={styles.bar} aria-hidden="true" />
                      <span className={`${styles.bar} ${styles.barShort}`} aria-hidden="true" />
                    </div>

                    <Image
                      src="/images/arrow.webp"
                      alt=""
                      width={128}
                      height={128}
                      className={styles.widgetIcon}
                    />
                  </div>

                  <h3 className={styles.title}>{row.title}</h3>
                  <p className={styles.body}>{row.body}</p>

                  <Link href={row.link.href} className={styles.link}>
                    <LinkArrow />
                    <span className={styles.linkText}>{row.link.label}</span>
                  </Link>
                </div>
              </div>

              <div className={styles.photo}>
                <video
                  poster={row.background.poster}
                  aria-label={row.background.alt}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  {row.background.sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
