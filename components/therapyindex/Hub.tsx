import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import CountUp from '@/components/ui/CountUp';
import { ArrowRightIcon, ChatIcon, ClipboardIcon, GlobeIcon, MapPinIcon, SearchCheckIcon, SpeedometerIcon, StarIcon, TargetIcon, TrendUpIcon } from '@/components/ui/icons';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO, FOUNDER_PHOTO, SEARCH_GROUPS, SOURCES } from '@/lib/therapyindex/config';
import { getHubStats, getMarketViews, searchLabel } from '@/lib/therapyindex/data';
import PracticeSearch from './PracticeSearch';
import { Disclaimer, ReviewButton, SectionHead, SectionLabel, TiButton } from './Primitives';
import TiFaq, { type FaqRow } from './TiFaq';
import styles from './hub.module.css';
import ti from './ti.module.css';

const pct = (n: number) => `${Math.round(n)}%`;

/** "Houston, Austin and Denver" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

const AREAS = [
  { icon: MapPinIcon, title: 'The map pack', text: 'Who appears in the three places Google shows first, and where everyone else sits in the Maps list.' },
  { icon: SearchCheckIcon, title: 'Website rankings', text: 'Which sites reach the first page of Google search, and how many of those are directories rather than practices.' },
  { icon: ChatIcon, title: 'AI assistants', text: 'Whether ChatGPT and Claude name a practice when someone asks for a therapist, and who they name instead.' },
  { icon: StarIcon, title: 'Reviews', text: 'Google rating and review count. A practice needs ten reviews to be ranked, so a score reflects real patient feedback.' },
  { icon: SpeedometerIcon, title: 'Site speed', text: 'A Lighthouse check of how fast and accessible each website is on a phone. Shown on each profile; it does not change the score.' },
];

export default function Hub() {
  const views = getMarketViews();
  const stats = getHubStats();
  const cityNames = views.map((v) => v.city.name);
  const cities = joinNames(cityNames);
  const institutionShare = stats.aiAnswers ? (stats.aiInstitutionAnswers / stats.aiAnswers) * 100 : 0;

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
      question: 'How do I be removed?',
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
        <div className={ti.frame}>
          <div className={styles.heroBody}>
            <SectionLabel n="01">intro</SectionLabel>
            <h1 className={styles.h1}>Who therapy patients actually find in {cities}</h1>
            <p className={styles.heroSub}>Every practice measured the same way across Google Maps, Google search and AI answers.</p>
            <PracticeSearch />
            <div className={styles.heroLinks}>
              <a href="#markets" className={ti.link}>See the cities</a>
              <a href="#process" className={ti.link}>How it works</a>
            </div>
          </div>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dd className={styles.statValue}>{stats.practices}</dd>
              <dt className={styles.statLabel}>practices measured</dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statValue}>{pct(stats.directoryShare)}</dd>
              <dt className={styles.statLabel}>of Google results held by directories</dt>
            </div>
            <div className={styles.stat}>
              <dd className={styles.statValue}>{stats.cities}</dd>
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
      <section id="markets" className={`${ti.section} ${ti.band}`}>
        <div className={ti.frame}>
          <SectionHead
            n="02"
            label="markets"
            title="Markets we've mapped"
            lede={`${stats.practices.toLocaleString('en-US')} practices measured across ${stats.cities} ${stats.cities === 1 ? 'city' : 'cities'}.`}
          />
          <div className={styles.markets}>
            {views.map((view) => (
              <article key={view.city.slug} className={styles.market}>
                <header className={styles.marketHead}>
                  <h3 className={styles.marketCity}>
                    {view.city.name}, {view.state.name}
                  </h3>
                  <p className={styles.marketArea}>{view.snapshot.market.areaLabel}</p>
                </header>
                <dl className={styles.marketFacts}>
                  <div>
                    <dt>Practices measured</dt>
                    <dd>{view.snapshot.summary.totalPractices}</dd>
                  </div>
                  <div>
                    <dt>Index leader</dt>
                    <dd>{view.leader?.name ?? 'Not yet ranked'}</dd>
                  </div>
                  <div>
                    <dt>Directory share of Google results</dt>
                    <dd>{pct(view.directoryShare)}</dd>
                  </div>
                  <div>
                    <dt>Data date</dt>
                    <dd>{view.date}</dd>
                  </div>
                </dl>
                <Link href={view.path} className={styles.marketLink}>
                  View the {view.city.name} report
                  <ArrowRightIcon className={styles.marketArrow} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 03 areas */}
      <section id="areas" className={ti.section}>
        <div className={ti.frame}>
          <SectionHead n="03" label="areas" title="What we measure" lede="Five things decide whether a patient finds a practice. We record all of them the same way for every practice." />
          <div className={styles.cards}>
            {AREAS.map((area) => (
              <div key={area.title} className={styles.card}>
                <area.icon className={styles.icon} />
                <h3 className={styles.cardTitle}>{area.title}</h3>
                <p className={styles.cardText}>{area.text}</p>
              </div>
            ))}
            <div className={`${styles.card} ${styles.cardLink}`}>
              <p className={styles.cardText}>See every weight and rule behind the score.</p>
              <TiButton href={routes.therapyIndex.methodology} tone="dark">
                How the score works
              </TiButton>
            </div>
          </div>
          <figure className={styles.quote}>
            <Image src={FOUNDER_PHOTO} alt="" width={40} height={40} className={styles.avatar} />
            <div>
              <blockquote className={styles.quoteText}>We measure everyone the same way.</blockquote>
              <figcaption className={styles.quoteBy}>SrikaantH, founder</figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* 04 process */}
      <section id="process" className={`${ti.section} ${ti.band}`}>
        <div className={ti.frame}>
          <SectionHead n="04" label="process" title="How the index works" lede="The same searches, the same steps, in every city." />
          <ol className={styles.steps}>
            {[
              { icon: ClipboardIcon, title: 'Collect', text: `${stats.searches} searches are pulled for each city from Google Maps and Google search, and ${stats.prompts} questions are put to ChatGPT and Claude.` },
              { icon: TargetIcon, title: 'Measure', text: 'Map position, website position, AI mentions, review counts and site speed are recorded for every practice that appears.' },
              { icon: TrendUpIcon, title: 'Score', text: 'Each practice gets one visibility score. The leader in each city is set to 100 and the rest are scaled against it.' },
              { icon: GlobeIcon, title: 'Publish', text: 'A monthly snapshot goes up as a city report, and every practice is linked to its own website.' },
            ].map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <step.icon className={styles.icon} />
                <h3 className={styles.cardTitle}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 results */}
      <section id="results" className={ti.section}>
        <div className={ti.frame}>
          <SectionHead n="05" label="results" title="What the first snapshot shows" />
          <div className={styles.counters}>
            <div className={styles.counter}>
              <span className={styles.counterValue}>
                <CountUp to={stats.practices} />
              </span>
              <p className={styles.counterText}>practices measured across {cities}</p>
            </div>
            <div className={styles.counter}>
              <span className={styles.counterValue}>
                <CountUp to={Math.round(stats.crowded?.share ?? 0)} />
                <small>%</small>
              </span>
              <p className={styles.counterText}>of top-6 website results in {stats.crowded?.city ?? 'the most crowded city'} go to directories</p>
            </div>
            <div className={styles.counter}>
              <span className={styles.counterValue}>
                <CountUp to={Math.round(institutionShare)} />
                <small>%</small>
              </span>
              <p className={styles.counterText}>of AI answers named a hospital, university or directory</p>
            </div>
          </div>
          <p className={styles.counterNote}>
            {stats.aiInstitutionAnswers} of {stats.aiAnswers} AI answers named one. Counted from the {stats.date} snapshot.
          </p>
        </div>
      </section>

      {/* 06 searches */}
      <section id="searches" className={`${ti.section} ${ti.band}`}>
        <div className={ti.frame}>
          <SectionHead n="06" label="searches" title="Searches we track" lede="The searches a person might type when they are looking for a therapist." />
          <div className={styles.groups}>
            {SEARCH_GROUPS.map((group) => {
              const keywords = group.keywords.filter((k) => views[0]?.snapshot.keywords.includes(k));
              return (
                <div key={group.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>{group.title}</h3>
                  <p className={styles.cardText}>{group.note}</p>
                  <ul className={styles.keywords}>
                    {keywords.map((k) => (
                      <li key={k}>{searchLabel(k)}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 07 sources */}
      <section id="sources" className={ti.section}>
        <div className={ti.frame}>
          <SectionHead n="07" label="sources" title="Where the data comes from" />
          <ul className={styles.sources}>
            {SOURCES.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 08 why trust it */}
      <section id="trust" className={`${ti.section} ${ti.band}`}>
        <div className={ti.frame}>
          <SectionHead n="08" label="why trust it" title="Why trust it" />
          <div className={styles.trust}>
            {[
              { title: 'The same method for every practice', text: 'Every practice is found, measured and scored the same way. Nobody gets a different test.' },
              { title: 'No paid placements', text: 'Scores come only from the measurements. There is no way to buy a higher position.' },
              { title: 'Updated monthly', text: 'Each city is re-measured as a new monthly snapshot, and the date is on every report.' },
              { title: 'A link for every practice', text: 'Every practice gets a do-follow link to its own website, and can ask to be removed at any time.' },
            ].map((item) => (
              <div key={item.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 next steps */}
      <section id="next" className={ti.section}>
        <div className={ti.frame}>
          <SectionHead n="09" label="next steps" title="What to do with your result" />
          <div className={styles.plans}>
            <div className={styles.plan}>
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
            <div className={`${styles.plan} ${styles.planFeatured}`}>
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
            <div className={styles.plan}>
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
      </section>

      {/* 10 FAQ */}
      <section id="faq" className={`${ti.section} ${ti.band}`}>
        <div className={ti.frame}>
          <SectionHead n="10" label="faq" title="Questions" lede="The questions practices ask us most about the index." />
          <div className={styles.faqWrap}>
            <TiFaq items={faqRows} />
            <p className={styles.faqAsk}>
              Got another question?{' '}
              <a href={CONTACT_MAILTO} className={ti.link}>
                Send a message
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* 11 closing call to action */}
      <section id="contact" className={ti.section}>
        <div className={ti.frame}>
          <div className={styles.closing}>
            <SectionLabel n="11">contact</SectionLabel>
            <h2 className={styles.closingTitle}>Don&apos;t see your city?</h2>
            <p className={ti.lede}>Book a free 30-minute visibility review, or email us to ask for your city to be added.</p>
            <div className={ti.btnRow}>
              <ReviewButton tone="accent">Book a free review</ReviewButton>
              <a href={CONTACT_MAILTO} className={`${ti.btn} ${ti.btnLight}`}>
                Email us
              </a>
            </div>
            <p className={styles.closingMeta}>
              <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
              <Link href={routes.therapyIndex.methodology}>Methodology</Link>
            </p>
            <Disclaimer />
          </div>
        </div>
      </section>
    </>
  );
}
