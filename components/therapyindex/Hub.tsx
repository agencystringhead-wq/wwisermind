import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import CountUp from '@/components/ui/CountUp';
import Reveal from '@/components/ui/Reveal';
import { ChatIcon, ClipboardIcon, GlobeIcon, MapPinIcon, SearchCheckIcon, SpeedometerIcon, StarIcon, TargetIcon, TrendUpIcon } from '@/components/ui/icons';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO, FOUNDER_PHOTO, SEARCH_GROUPS, SOURCES } from '@/lib/therapyindex/config';
import { displayName, getHubStats, getMarketViews, searchLabel } from '@/lib/therapyindex/data';
import HeroArt from './HeroArt';
import MarketsSection, { type MarketCardData } from './MarketsSection';
import PracticeSearch from './PracticeSearch';
import { Disclaimer, ReviewButton, SectionHead, SectionLabel, TiButton } from './Primitives';
import Ring, { Bar } from './Ring';
import TiFaq, { type FaqRow } from './TiFaq';
import UsBase from './UsBase';
import styles from './hub.module.css';
import ti from './ti.module.css';

const pct = (n: number) => `${Math.round(n)}%`;
const num = (n: number) => n.toLocaleString('en-US');

/** "Houston, Austin and Denver" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** One accent per measure, in the order the icon cards run. */
const AREAS = [
  { icon: MapPinIcon, tone: styles.toneBlue, title: 'The map pack', text: 'Who appears in the three places Google shows first, and where everyone else sits in the Maps list.' },
  { icon: SearchCheckIcon, tone: styles.toneCoral, title: 'Website rankings', text: 'Which sites reach the first page of Google search, and how many of those are directories rather than practices.' },
  { icon: ChatIcon, tone: styles.toneTeal, title: 'AI assistants', text: 'Whether ChatGPT and Claude name a practice when someone asks for a therapist, and who they name instead.' },
  { icon: StarIcon, tone: styles.toneAmber, title: 'Reviews', text: 'Google rating and review count. A practice needs ten reviews to be ranked, so a score reflects real patient feedback.' },
  { icon: SpeedometerIcon, tone: styles.toneViolet, title: 'Site speed', text: 'A Lighthouse check of how fast and accessible each website is on a phone. Shown on each profile; it does not change the score.' },
];

const GROUP_TONES = [styles.pillBlue, styles.pillTeal, styles.pillCoral, styles.pillViolet, styles.pillAmber];

export default function Hub() {
  const views = getMarketViews();
  const stats = getHubStats();
  const cityNames = views.map((v) => v.city.name);
  const cities = joinNames(cityNames);
  const institutionShare = stats.aiAnswers ? (stats.aiInstitutionAnswers / stats.aiAnswers) * 100 : 0;
  const most = Math.max(...views.map((v) => v.snapshot.summary.totalPractices), 1);

  const marketCards: MarketCardData[] = views.map((v) => ({
    slug: v.city.slug,
    city: v.city.name,
    state: v.state.name,
    area: v.snapshot.market.areaLabel,
    practices: v.snapshot.summary.totalPractices,
    leader: v.leader ? displayName(v.leader.name) : 'Not yet ranked',
    directoryShare: v.directoryShare,
    date: v.date,
    href: v.path,
  }));

  const faq: { question: string; text: string; node: React.ReactNode }[] = [
    {
      question: 'How often is it updated?',
      text: 'Each city is measured as a monthly snapshot. The date and the snapshot ID are printed on every report, so you can see exactly when the numbers were taken.',
      node: 'Each city is measured as a monthly snapshot. The date and the snapshot ID are printed on every report, so you can see exactly when the numbers were taken.',
    },
    {
      question: 'How does the score work?',
      text: 'A practice earns points for where it shows in Google Maps, where its website ranks in Google search, and whether ChatGPT or Claude name it, plus a smaller share for review strength. The best practice in each city is set to 100 and the rest are scaled against it. The methodology page lists every weight.',
      node: (
        <>
          A practice earns points for where it shows in Google Maps, where its website ranks in Google search, and whether ChatGPT or Claude name it, plus a smaller share for review strength. The best practice in each city is set to 100 and the rest are scaled against it. The{' '}
          <Link href={routes.therapyIndex.methodology} className={ti.link}>
            methodology page
          </Link>{' '}
          lists every weight.
        </>
      ),
    },
    {
      question: "Why isn't my practice listed?",
      text: 'The index starts from what Google Maps shows for the searches we track. A practice can be missing because its listing does not appear for those searches, it sits in a category we do not count, such as massage or physical therapy, or it is outside the cities covered. If you think we missed you, email us and we will check.',
      node: (
        <>
          The index starts from what Google Maps shows for the searches we track. A practice can be missing because its listing does not appear for those searches, it sits in a category we do not count, such as massage or physical therapy, or it is outside the cities covered. If you think we missed you,{' '}
          <a href={CONTACT_MAILTO} className={ti.link}>
            email us
          </a>{' '}
          and we will check.
        </>
      ),
    },
    {
      question: 'How can I have my practice removed?',
      text: `Email ${CONTACT_EMAIL} with the practice name and city, and we will take it out of the index.`,
      node: (
        <>
          Email{' '}
          <a href={CONTACT_MAILTO} className={ti.link}>
            {CONTACT_EMAIL}
          </a>{' '}
          with the practice name and city, and we will take it out of the index.
        </>
      ),
    },
    {
      question: 'Will you add my city?',
      text: `We cover ${cities} for now and plan to add more. Tell us which city you would like to see; we cannot promise dates.`,
      node: <>We cover {cities} for now and plan to add more. Tell us which city you would like to see; we cannot promise dates.</>,
    },
    {
      question: 'Is anyone paying to rank?',
      text: 'No. There are no paid placements. Scores come only from the measurements on the methodology page, applied the same way to every practice.',
      node: 'No. There are no paid placements. Scores come only from the measurements on the methodology page, applied the same way to every practice.',
    },
  ];

  const faqRows: FaqRow[] = faq.map((f) => ({ question: f.question, answer: <p>{f.node}</p> }));
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.text } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      {/* 01 intro */}
      <section id="intro" className={`${ti.section} ${styles.hero}`}>
        <HeroArt />
        <div className={ti.frame}>
          <div className={styles.heroBody}>
            <div className={styles.rise} style={{ '--i': 0 } as React.CSSProperties}>
              <SectionLabel n="01">intro</SectionLabel>
            </div>
            <h1 className={`${styles.h1} ${styles.rise}`} style={{ '--i': 1 } as React.CSSProperties}>
              Who therapy patients <span className={ti.gradText}>actually find</span> in {cities}
            </h1>
            <p className={`${styles.heroSub} ${styles.rise}`} style={{ '--i': 2 } as React.CSSProperties}>
              Every practice measured the same way across Google Maps, Google search and AI answers.
            </p>
            <div className={`${styles.searchSlot} ${styles.rise}`} style={{ '--i': 3 } as React.CSSProperties}>
              <PracticeSearch />
            </div>
            <div className={`${styles.heroLinks} ${styles.rise}`} style={{ '--i': 4 } as React.CSSProperties}>
              <a href="#markets" className={ti.link}>See the cities</a>
              <a href="#process" className={ti.link}>How it works</a>
            </div>
          </div>
          <dl className={`${styles.stats} ${styles.rise}`} style={{ '--i': 5 } as React.CSSProperties}>
            <div className={styles.stat}>
              <dd className={`${styles.statValue} ${ti.nBlue}`}>
                <CountUp to={stats.practices} commas />
              </dd>
              <dt className={styles.statLabel}>practices measured</dt>
            </div>
            <div className={styles.stat}>
              <dd className={`${styles.statValue} ${ti.nCoral}`}>
                <CountUp to={Math.round(stats.directoryShare)} />%
              </dd>
              <dt className={styles.statLabel}>of Google results held by directories</dt>
            </div>
            <div className={styles.stat}>
              <dd className={`${styles.statValue} ${ti.nTeal}`}>
                <CountUp to={stats.cities} />
              </dd>
              <dt className={styles.statLabel}>cities covered</dt>
            </div>
            <div className={styles.stat}>
              <dd className={`${styles.statValue} ${styles.statDate}`}>{stats.date}</dd>
              <dt className={styles.statLabel}>data date</dt>
            </div>
          </dl>
        </div>
      </section>

      {/* 02 markets we've mapped */}
      <section id="markets" className={`${ti.section} ${ti.bandTint}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead
                n="02"
                label="markets"
                title="Markets we've mapped"
                lede={
                  <>
                    <b className={ti.nBlue}>{num(stats.practices)} practices</b> measured across <b className={ti.nTeal}>{stats.cities} {stats.cities === 1 ? 'city' : 'cities'}</b>.
                  </>
                }
              />
            </div>
            <MarketsSection cities={marketCards}>
              <UsBase />
            </MarketsSection>
          </Reveal>
        </div>
      </section>

      {/* 03 areas */}
      <section id="areas" className={ti.section}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="03" label="areas" title="What we measure" lede="Five things decide whether a patient finds a practice. We record all of them the same way for every practice." />
            </div>
            <div className={styles.cards}>
              {AREAS.map((area, i) => (
                <div key={area.title} className={styles.slot} data-reveal={(i % 3) + 1}>
                  <div className={`${styles.card} ${styles.lift}`}>
                    <span className={`${styles.iconBox} ${area.tone}`}>
                      <area.icon className={styles.icon} />
                    </span>
                    <h3 className={styles.cardTitle}>{area.title}</h3>
                    <p className={styles.cardText}>{area.text}</p>
                  </div>
                </div>
              ))}
              <div className={styles.slot} data-reveal="3">
                <figure className={styles.quoteCard}>
                  <Image src="/images/therapyindex/leaves.webp" alt="" fill sizes="(max-width: 720px) 100vw, 400px" className={styles.quoteImg} />
                  <div className={styles.quoteBody}>
                    <blockquote className={styles.quoteText}>We measure everyone the same way.</blockquote>
                    <figcaption className={styles.quoteBy}>
                      <Image src={FOUNDER_PHOTO} alt="" width={36} height={36} className={styles.avatar} />
                      SrikaantH, founder
                    </figcaption>
                    <TiButton href={routes.therapyIndex.methodology} tone="white">
                      How the score works
                    </TiButton>
                  </div>
                </figure>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 process */}
      <section id="process" className={`${ti.section} ${ti.bandCream}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="04" label="process" title="How the index works" lede="The same searches, the same steps, in every city." />
            </div>
            <div className={styles.steps} data-reveal="1">
              <span className={styles.stepLine} aria-hidden="true" />
              <ol className={styles.stepList}>
                {[
                  { icon: ClipboardIcon, tone: styles.toneBlue, title: 'Collect', text: `${stats.searches} searches are pulled for each city from Google Maps and Google search, and ${stats.prompts} questions are put to ChatGPT and Claude.` },
                  { icon: TargetIcon, tone: styles.toneTeal, title: 'Measure', text: 'Map position, website position, AI mentions, review counts and site speed are recorded for every practice that appears.' },
                  { icon: TrendUpIcon, tone: styles.toneCoral, title: 'Score', text: 'Each practice gets one visibility score. The leader in each city is set to 100 and the rest are scaled against it.' },
                  { icon: GlobeIcon, tone: styles.toneViolet, title: 'Publish', text: 'A monthly snapshot goes up as a city report, and every practice is linked to its own website.' },
                ].map((step, i) => (
                  <li key={step.title} className={styles.step}>
                    <span className={`${styles.stepNode} ${step.tone}`}>
                      <step.icon className={styles.icon} />
                      <b>{i + 1}</b>
                    </span>
                    <h3 className={styles.cardTitle}>{step.title}</h3>
                    <p className={styles.cardText}>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 05 results */}
      <section id="results" className={ti.section}>
        <div className={ti.frame}>
          <Reveal as="div" className={styles.panel}>
            <Image src="/images/therapyindex/closing.webp" alt="" fill sizes="100vw" className={styles.panelImg} />
            <div className={styles.panelBody}>
              <header className={`${ti.head} ${styles.onBlue}`} data-reveal="0">
                <span className={`${ti.label} ${styles.labelOnBlue}`}>
                  <span>05</span>
                  <span className={ti.labelText}>results</span>
                </span>
                <h2 className={ti.title}>What the first snapshot shows</h2>
              </header>
              <div className={styles.counters}>
                <div className={styles.counter} data-reveal="1">
                  <span className={styles.counterTag}>Measured</span>
                  <span className={`${styles.counterValue} ${styles.cBlue}`}>
                    <CountUp to={stats.practices} commas />
                  </span>
                  <p className={styles.counterText}>practices measured across {cities}</p>
                  <ul className={styles.cityBars}>
                    {views.map((v) => (
                      <li key={v.city.slug}>
                        <span>{v.city.name}</span>
                        <Bar value={(v.snapshot.summary.totalPractices / most) * 100} tone="white" />
                        <b>{num(v.snapshot.summary.totalPractices)}</b>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.counter} data-reveal="2">
                  <span className={styles.counterTag}>Directories</span>
                  <span className={styles.ringRow}>
                    <span className={`${styles.counterValue} ${styles.cCoral}`}>
                      <CountUp to={Math.round(stats.crowded?.share ?? 0)} />%
                    </span>
                    <span className={styles.bigRing}>
                      <Ring value={stats.crowded?.share ?? 0} tone="white" label={`Directories hold ${pct(stats.crowded?.share ?? 0)} of top-6 website results in ${stats.crowded?.city ?? 'the most crowded city'}`} />
                    </span>
                  </span>
                  <p className={styles.counterText}>
                    of top-6 website results in {stats.crowded?.city ?? 'the most crowded city'} go to directories
                  </p>
                </div>
                <div className={styles.counter} data-reveal="3">
                  <span className={styles.counterTag}>AI answers</span>
                  <span className={`${styles.counterValue} ${styles.cTeal}`}>
                    <CountUp to={stats.aiInstitutionAnswers} /> of <CountUp to={stats.aiAnswers} />
                  </span>
                  <p className={styles.counterText}>
                    AI answers named a hospital, university or directory (<b className={styles.cTealInline}>{pct(institutionShare)}</b>)
                  </p>
                  <Bar value={institutionShare} tone="teal" />
                </div>
              </div>
              <p className={styles.counterNote} data-reveal="4">
                Counted from the {stats.date} snapshot.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 06 searches */}
      <section id="searches" className={`${ti.section} ${ti.bandCream}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="06" label="searches" title="Searches we track" lede="The searches a person might type when they are looking for a therapist." />
            </div>
            <div className={styles.groups}>
              {SEARCH_GROUPS.map((group, gi) => {
                const keywords = group.keywords.filter((k) => views[0]?.snapshot.keywords.includes(k));
                return (
                  <div key={group.id} className={styles.slot} data-reveal={(gi % 3) + 1}>
                    <div className={`${styles.card} ${styles.lift}`}>
                      <h3 className={styles.cardTitle}>{group.title}</h3>
                      <p className={styles.cardText}>{group.note}</p>
                      <ul className={styles.keywords}>
                        {keywords.map((k) => (
                          <li key={k} className={GROUP_TONES[gi % GROUP_TONES.length]}>
                            {searchLabel(k)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 07 sources */}
      <section id="sources" className={ti.section} style={{ paddingBottom: 'clamp(48px, 6vw, 72px)' }}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="07" label="sources" title="Where the data comes from" />
            </div>
          </Reveal>
        </div>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[0, 1].map((copy) => (
              <ul className={styles.marqueeSet} key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {SOURCES.map((name, i) => (
                  <li key={name} className={`${styles.source} ${GROUP_TONES[i % GROUP_TONES.length]}`}>
                    {name}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* 08 why trust it */}
      <section id="trust" className={`${ti.section} ${ti.bandTint}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="08" label="why trust it" title="Why trust it" />
            </div>
            <div className={styles.trustWrap}>
              <div className={styles.trustImage} data-reveal="1">
                <Image src="/images/therapyindex/room.webp" alt="" fill sizes="(max-width: 960px) 100vw, 420px" className={styles.trustImg} />
              </div>
              <div className={styles.trust}>
                {[
                  { tone: styles.toneBlue, title: 'The same method for every practice', text: 'Every practice is found, measured and scored the same way. Nobody gets a different test.' },
                  { tone: styles.toneCoral, title: 'No paid placements', text: 'Scores come only from the measurements. There is no way to buy a higher position.' },
                  { tone: styles.toneTeal, title: 'Updated monthly', text: 'Each city is re-measured as a new monthly snapshot, and the date is on every report.' },
                  { tone: styles.toneViolet, title: 'A link for every practice', text: 'Every practice gets a do-follow link to its own website, and can ask to be removed at any time.' },
                ].map((item, i) => (
                  <div key={item.title} className={styles.slot} data-reveal={(i % 2) + 2}>
                    <div className={`${styles.card} ${styles.lift}`}>
                      <span className={`${styles.dotMark} ${item.tone}`} aria-hidden="true" />
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <p className={styles.cardText}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 09 next steps */}
      <section id="next" className={ti.section}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="09" label="next steps" title="What to do with your result" />
            </div>
            <div className={styles.plans}>
              <div className={styles.slot} data-reveal="1">
                <div className={`${styles.plan} ${styles.lift}`}>
                  <h3 className={styles.planTag}>Do it yourself</h3>
                  <p className={styles.planFor}>For practices that would rather work on it themselves.</p>
                  <ul className={styles.planList}>
                    <li><a href="https://business.google.com" target="_blank" rel="noopener" className={ti.link}>Google Business Profile</a></li>
                    <li><a href="https://search.google.com/search-console" target="_blank" rel="noopener" className={ti.link}>Google Search Console</a></li>
                    <li><a href="https://pagespeed.web.dev" target="_blank" rel="noopener" className={ti.link}>PageSpeed Insights</a></li>
                    <li><Link href={routes.freebies.hub} className={ti.link}>Free guides from wwisermind</Link></li>
                  </ul>
                  <TiButton href={routes.freebies.hub} tone="light">See the free guides</TiButton>
                </div>
              </div>
              <div className={styles.slot} data-reveal="2">
                <div className={`${styles.plan} ${styles.planFeatured} ${styles.lift}`}>
                  <h3 className={styles.planTag}>
                    Free visibility review <span className={styles.planBadge}>Start here</span>
                  </h3>
                  <p className={styles.planFor}>For practices that want a clear picture first.</p>
                  <ul className={styles.planList}>
                    <li>30 minutes with someone at wwisermind</li>
                    <li>Your map, website and AI results in your city</li>
                    <li>A short list of what to look at first</li>
                    <li>No obligation to hire us</li>
                  </ul>
                  <CtaLink href={routes.contactBook} className={`${ti.btn} ${ti.btnDark}`}>
                    Book the free review
                  </CtaLink>
                </div>
              </div>
              <div className={styles.slot} data-reveal="3">
                <div className={`${styles.plan} ${styles.lift}`}>
                  <h3 className={styles.planTag}>Done for you</h3>
                  <p className={styles.planFor}>For practices that want it handled.</p>
                  <ul className={styles.planList}>
                    <li>Google Business Profile set up and kept current</li>
                    <li>Local SEO for your city and specialties</li>
                    <li>Reporting against the same measures</li>
                  </ul>
                  <TiButton href={routes.pricing.localSeo} tone="light">See Local SEO packages</TiButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10 FAQ */}
      <section id="faq" className={`${ti.section} ${ti.bandCream}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="10" label="faq" title="Questions" lede="The questions practices ask us most about the index." />
            </div>
            <div className={styles.faqWrap} data-reveal="1">
              <TiFaq items={faqRows} />
              <p className={styles.faqAsk}>
                Got another question?{' '}
                <a href={CONTACT_MAILTO} className={ti.link}>
                  Send a message
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 closing call to action */}
      <section id="contact" className={ti.section}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div className={`${styles.panel} ${styles.closingPanel}`} data-reveal="0">
              <Image src="/images/therapyindex/closing.webp" alt="" fill sizes="100vw" className={`${styles.panelImg} ${styles.closingImg}`} />
              <div className={`${styles.panelBody} ${styles.closing}`}>
                <span className={`${ti.label} ${styles.labelOnBlue}`}>
                  <span>11</span>
                  <span className={ti.labelText}>contact</span>
                </span>
                <h2 className={styles.closingTitle}>Don&apos;t see your city?</h2>
                <p className={styles.closingLede}>Book a free 30-minute visibility review, or email us to ask for your city to be added.</p>
                <div className={ti.btnRow}>
                  <ReviewButton tone="white">Book a free review</ReviewButton>
                  <a href={CONTACT_MAILTO} className={`${ti.btn} ${styles.btnGhost}`}>
                    Email us
                  </a>
                </div>
                <p className={styles.closingMeta}>
                  <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
                  <Link href={routes.therapyIndex.methodology}>Methodology</Link>
                </p>
              </div>
            </div>
            <div className={styles.disclaimerSlot} data-reveal="1">
              <Disclaimer />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
