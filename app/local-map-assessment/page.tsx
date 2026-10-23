import type { Metadata } from 'next';
import MapPackMock from '@/components/local-map/MapPackMock';
import ReportPreview from '@/components/local-map/ReportPreview';
import RunReportLink from '@/components/local-map/RunReportLink';
import SampleReport from '@/components/local-map/SampleReport';
import SearchBox from '@/components/local-map/SearchBox';
import { CheckIcon } from '@/components/ui/icons';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import {
  LMA_DESCRIPTION,
  LMA_OG,
  LMA_TITLE,
  LMA_URL,
  faqJsonLd,
  faqs,
  realityCards,
  reportParts,
  stats,
  statsNote,
  steps,
  trustTicks,
} from '@/lib/local-map-assessment';
import { siteConfig } from '@/lib/site';
import styles from '@/components/local-map/lma.module.css';

export const metadata: Metadata = {
  title: LMA_TITLE,
  description: LMA_DESCRIPTION,
  alternates: { canonical: LMA_URL },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: LMA_TITLE,
    description: LMA_DESCRIPTION,
    url: LMA_URL,
    images: [{ url: LMA_OG, width: 1200, height: 630, alt: 'Local Map Assessment for therapists, a free tool by wwisermind' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    title: LMA_TITLE,
    description: LMA_DESCRIPTION,
    images: [LMA_OG],
  },
};

function Ticks({ dark = false }: { dark?: boolean }) {
  return (
    <ul className={`${styles.ticks} ${dark ? styles.ticksDark : ''}`}>
      {trustTicks.map((t) => (
        <li key={t}>
          <CheckIcon className={styles.tick} />
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function LocalMapAssessmentPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* 1. Hero */}
      <section className={styles.hero} aria-labelledby="lma-h1">
        <Reveal className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrowDark} data-reveal="0">Free tool for therapists</p>
            <h1 id="lma-h1" className={styles.h1} data-reveal="0">
              Are you losing new clients to practices that rank higher on Google Maps?
            </h1>
            <p className={styles.sub} data-reveal="1">See which practices outrank you in each part of town, and why.</p>
            <div data-reveal="2">
              <SearchBox primary />
              <Ticks dark />
            </div>
          </div>
          <div className={styles.heroVisual} data-reveal="2">
            <SampleReport />
          </div>
        </Reveal>
      </section>

      {/* 2. The local search reality */}
      <section className={styles.section} aria-labelledby="lma-reality">
        <Reveal className="container">
          <div className={styles.realityGrid}>
            <div>
              <p className={styles.eyebrow} data-reveal="0">The local search reality</p>
              <h2 id="lma-reality" className={styles.h2} data-reveal="0">Someone is searching &ldquo;therapist near me&rdquo; right now.</h2>
              <p className={styles.lead} data-reveal="1">What you see on Google is not what they see.</p>
              <ol className={styles.cards}>
                {realityCards.map((c, i) => (
                  <li key={c.title} className={styles.card} data-reveal="2">
                    <span className={styles.cardNum}>{i + 1}</span>
                    <div>
                      <h3>{c.title}</h3>
                      <p>{c.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.realityVisual} data-reveal="2">
              <MapPackMock />
              <p className={styles.smallNote}>The lower a practice sits in the map pack, the fewer people contact it.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 3. Why it matters */}
      <section className={`${styles.section} ${styles.band}`} aria-labelledby="lma-why">
        <Reveal className="container">
          <p className={styles.eyebrow} data-reveal="0">Why it matters</p>
          <h2 id="lma-why" className={styles.h2} data-reveal="0">The map pack is where many new clients first choose.</h2>
          <ul className={styles.stats}>
            {stats.map((s) => (
              <li key={s.label} className={styles.stat} data-reveal="1">
                <b className={styles.statBig}>{s.big}</b>
                <span className={styles.statLabel}>{s.label}</span>
                <p>{s.body}</p>
              </li>
            ))}
          </ul>
          <p className={styles.footnote} data-reveal="2">{statsNote}</p>
        </Reveal>
      </section>

      {/* 4. What is in your report */}
      <section className={styles.section} aria-labelledby="lma-report">
        <Reveal className="container">
          <p className={styles.eyebrow} data-reveal="0">What is in your report</p>
          <h2 id="lma-report" className={styles.h2} data-reveal="0">4 things your report shows you</h2>
          <p className={styles.lead} data-reveal="1">A clear picture of your Google Maps visibility across your whole area, with a short list of what to fix first.</p>
          <div className={styles.reportGrid}>
            <div className={styles.reportMain} data-reveal="2">
              <ReportPreview />
            </div>
            <ol className={styles.parts} data-reveal="2">
              {reportParts.map((p) => (
                <li key={p.n}>
                  <span className={styles.partNum}>{p.n}</span>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </li>
              ))}
              <li className={styles.partsCta}>
                <RunReportLink className={styles.btnPrimary}>Get my free assessment</RunReportLink>
              </li>
            </ol>
          </div>
        </Reveal>
      </section>

      {/* 5. How it works */}
      <section className={`${styles.section} ${styles.band}`} aria-labelledby="lma-how">
        <Reveal className="container">
          <p className={styles.eyebrow} data-reveal="0">How it works</p>
          <h2 id="lma-how" className={styles.h2} data-reveal="0">Three steps. Under 4 minutes.</h2>
          <ol className={styles.steps}>
            {steps.map((s) => (
              <li key={s.n} className={styles.step} data-reveal="1">
                <span className={styles.stepNum}>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.center} data-reveal="2">
            <RunReportLink className={styles.btnPrimary}>Get my free ranking report</RunReportLink>
          </div>
        </Reveal>
      </section>

      {/* 6. FAQ */}
      <section className={styles.section} aria-labelledby="lma-faq">
        <Reveal className={`container ${styles.faqWrap}`}>
          <h2 id="lma-faq" className={styles.h2} data-reveal="0">Frequently asked questions</h2>
          <div data-reveal="1">
            <Accordion items={[...faqs]} numbered />
          </div>
        </Reveal>
      </section>

      {/* 7. Closing call to action */}
      <section className={`${styles.hero} ${styles.closing}`} aria-labelledby="lma-close">
        <Reveal className={`container ${styles.closingInner}`}>
          <h2 id="lma-close" className={styles.h1} data-reveal="0">Right now, someone nearby may be booking with another practice.</h2>
          <p className={styles.sub} data-reveal="1">It is worth knowing where you stand, and what would change it. Your report is free and takes under 4 minutes.</p>
          <div data-reveal="2">
            <SearchBox />
            <Ticks dark />
          </div>
        </Reveal>
      </section>
    </>
  );
}
