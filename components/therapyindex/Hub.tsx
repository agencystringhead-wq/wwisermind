import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import CountUp from '@/components/ui/CountUp';
import Reveal from '@/components/ui/Reveal';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO, FOUNDER_PHOTO, SEARCH_GROUPS, SOURCES } from '@/lib/therapyindex/config';
import { getHubStats, getMarketViews, searchLabel, type MarketView } from '@/lib/therapyindex/data';
import CityTabs, { type CityCase } from './CityTabs';
import { Disclaimer, ReviewButton, SectionHead, SectionLabel, TiButton } from './Primitives';
import {
  ChatIcon, CollectIcon, GaugeIcon, GroupIcon, MapPackIcon, MeasureIcon, PublishIcon, RankIcon, ScoreIcon, StarIcon,
} from './TiIcons';
import TiFaq, { type FaqRow } from './TiFaq';
import styles from './hub.module.css';
import ti from './ti.module.css';

const pct = (n: number) => `${Math.round(n)}%`;

/** "Houston, Austin and Denver" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function cityCase(view: MarketView): CityCase {
  const { snapshot } = view;
  const leader = view.leader;
  const named = view.practicesNamedByAi;
  return {
    slug: view.city.slug,
    name: view.city.name,
    href: view.path,
    intro: `${snapshot.summary.totalPractices} practices measured on ${view.date}.`,
    problem: `Directories hold ${pct(view.directoryShare)} of the top-6 website results across ${snapshot.keywords.length} searches in ${view.city.name}.`,
    found: leader
      ? `${leader.name} leads the ${view.city.name} index. ${view.eligible.length} practices have enough reviews to be ranked.`
      : `${snapshot.summary.totalPractices} practices measured.`,
    figure: String(named),
    figureNote: `${named === 1 ? 'practice was' : 'practices were'} named by ChatGPT or Claude in ${view.city.name}.`,
    meta: `${view.month} snapshot`,
    image: `/images/therapyindex/city-${view.city.slug}.webp`,
  };
}

const AREAS = [
  { icon: MapPackIcon, title: 'The map pack', text: 'Who appears in the three places Google shows first, and where everyone else sits in the Maps list.' },
  { icon: RankIcon, title: 'Website rankings', text: 'Which sites reach the first page of Google search, and how many of those are directories rather than practices.' },
  { icon: ChatIcon, title: 'AI assistants', text: 'Whether ChatGPT and Claude name a practice when someone asks for a therapist, and who they name instead.' },
  { icon: StarIcon, title: 'Reviews', text: 'Google rating and review count. A practice needs ten reviews to be ranked, so a score reflects real patient feedback.' },
  { icon: GaugeIcon, title: 'Site speed', text: 'A Lighthouse check of how fast and accessible each website is on a phone. Shown on each profile; it does not change the score.' },
];

export default function Hub() {
  const views = getMarketViews();
  const stats = getHubStats();
  const cityNames = views.map((v) => v.city.name);
  const cities = joinNames(cityNames);
  const cases = views.map(cityCase);
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
      node: (
        <>
          We cover {cities} for now and plan to add more. Tell us which city you would like to see; we cannot promise dates.
        </>
      ),
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
      <section id="intro" className={`${ti.section} ${styles.hero} ${ti.lines}`} style={{ paddingBottom: 0 }}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={ti.frame}>
          <Reveal as="div" className={styles.heroBody}>
            <div data-reveal="0">
              <SectionLabel n="01">intro</SectionLabel>
            </div>
            <div className={ti.split} data-reveal="1">
              <div />
              <div style={{ display: 'grid', gap: 'clamp(22px, 3vw, 36px)' }}>
                <h1 className={styles.h1}>Who therapy patients actually find in {cities}</h1>
                <p className={styles.heroSub}>
                  Every practice measured the same way across Google Maps, Google search and AI answers.
                </p>
                <div className={`${ti.btnRow} ${styles.heroCtas}`}>
                  <TiButton href="#cities" tone="light">See your city</TiButton>
                  <TiButton href="#process" tone="dark">How it works</TiButton>
                </div>
              </div>
            </div>
          </Reveal>
          <div className={ti.split}>
            <div />
            <div className={styles.stats}>
              <div className={`${styles.stat} ${ti.mark}`}>
                <span className={styles.statValue}>{stats.practices}</span>
                <span className={styles.statLabel}>practices measured</span>
              </div>
              <div className={`${styles.stat} ${ti.mark}`}>
                <span className={styles.statValue}>{pct(stats.directoryShare)}</span>
                <span className={styles.statLabel}>of Google results held by directories</span>
              </div>
              <div className={`${styles.stat} ${ti.mark}`}>
                <span className={styles.statValue}>{stats.cities}</span>
                <span className={styles.statLabel}>cities covered</span>
              </div>
              <div className={`${styles.stat} ${ti.mark}`}>
                <span className={styles.statValue} style={{ fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.25 }}>{stats.date}</span>
                <span className={styles.statLabel}>data date</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 areas */}
      <section id="areas" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div className={ti.split}>
              <div className={ti.rail} data-reveal="0" style={{ display: 'grid', alignContent: 'space-between', gap: 40 }}>
                <SectionHead n="02" label="areas" title="What we measure" stacked />
                <figure className={styles.quote}>
                  <div className={styles.quoteMeta}>
                    <Image src={FOUNDER_PHOTO} alt="" width={32} height={32} className={styles.avatar} />
                    <span className={styles.quoteBy}>SrikaantH, founder</span>
                  </div>
                  <blockquote className={styles.quoteText}>We measure everyone the same way.</blockquote>
                </figure>
              </div>
              <div className={ti.main} data-reveal="1">
                <div className={styles.cells}>
                  {AREAS.map((area) => (
                    <div key={area.title} className={styles.cell}>
                      <area.icon className={styles.icon} />
                      <h3 className={styles.cellTitle}>{area.title}</h3>
                      <p className={styles.cellText}>{area.text}</p>
                    </div>
                  ))}
                  <div className={`${styles.cell} ${styles.cellLink}`}>
                    <Link href={routes.therapyIndex.methodology} className={`${ti.btn} ${ti.btnDark}`}>
                      How the score works
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03 process */}
      <section id="process" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="03" label="process" title="How the index works" />
            </div>
            <div className={ti.split} data-reveal="1">
              <div className={`${ti.rail} ${styles.rail}`}>
                <p>The same searches, the same steps, in every city.</p>
              </div>
              <div className={styles.steps}>
                {[
                  { n: '01', icon: CollectIcon, title: 'Collect', row: 'searches in', text: `${stats.searches} searches are pulled for each city from Google Maps and Google search, and ${stats.prompts} questions are put to ChatGPT and Claude.` },
                  { n: '02', icon: MeasureIcon, title: 'Measure', row: 'signals', text: 'Map position, website position, AI mentions, review counts and site speed are recorded for every practice that appears.' },
                  { n: '03', icon: ScoreIcon, title: 'Score', row: 'one number', text: 'Each practice gets one visibility score. The leader in each city is set to 100 and the rest are scaled against it.' },
                  { n: '04', icon: PublishIcon, title: 'Publish', row: 'public', text: 'A monthly snapshot goes up as a city report, and every practice is linked to its own website.' },
                ].map((step) => (
                  <div key={step.n} className={styles.step}>
                    <span className={styles.stepNum}>.{step.n}</span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <div className={styles.stepRow}>
                      <step.icon className={styles.stepIcon} />
                      <span>{step.row} &gt;</span>
                    </div>
                    <p className={styles.stepText}>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 04 results */}
      <section id="results" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="04" label="results" title="What the first snapshot shows" />
            </div>
            <div className={ti.split} data-reveal="1">
              <div />
              <div className={ti.main}>
                <div className={styles.counters}>
                  <div className={`${styles.counter} ${ti.mark}`}>
                    <span className={styles.counterTag}>measured</span>
                    <span className={styles.counterValue}>
                      <CountUp to={stats.practices} />
                    </span>
                    <p className={styles.counterText}>practices measured across {cities}</p>
                  </div>
                  <div className={`${styles.counter} ${ti.mark}`}>
                    <span className={styles.counterTag}>directories</span>
                    <span className={styles.counterValue}>
                      <CountUp to={Math.round(stats.crowded?.share ?? 0)} />
                      <small>%</small>
                    </span>
                    <p className={styles.counterText}>
                      of top-6 website results in {stats.crowded?.city ?? 'the most crowded city'} go to directories
                    </p>
                  </div>
                  <div className={`${styles.counter} ${ti.mark}`}>
                    <span className={styles.counterTag}>AI answers</span>
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* 05 cities */}
      <section id="cities" className={`${ti.section} ${ti.dark} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="05" label="cities" title="The cities" />
            </div>
            <div data-reveal="1">
              <CityTabs cities={cases} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 06 searches */}
      <section id="searches" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="06" label="searches" title="Searches we track" />
            </div>
            <div className={ti.split} data-reveal="1">
              <div className={`${ti.rail} ${styles.rail}`}>
                <p>The searches a person might type when they are looking for a therapist.</p>
              </div>
              <div className={styles.groups}>
                {SEARCH_GROUPS.map((group) => {
                  const keywords = group.keywords.filter((k) => views[0]?.snapshot.keywords.includes(k));
                  return (
                    <div key={group.id} className={styles.group}>
                      <GroupIcon className={styles.icon} />
                      <h3 className={styles.groupTitle}>{group.title}</h3>
                      <p className={styles.groupNote}>{group.note}</p>
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
          </Reveal>
        </div>
      </section>

      {/* 07 sources */}
      <section id="sources" className={`${ti.section}`} style={{ paddingBottom: 0 }}>
        <div className={ti.frame}>
          <SectionHead n="07" label="sources" title="Where the data comes from" />
        </div>
        <div className={styles.marqueeBand}>
          <div className={styles.marqueeTrack}>
            {[0, 1].map((copy) => (
              <ul className={styles.marqueeSet} key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {SOURCES.flatMap((name) => [
                  <li key={name} className={styles.wordmark}>
                    {name}
                  </li>,
                  <li key={`${name}-sep`} className={styles.sep} aria-hidden="true" />,
                ])}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* 08 why trust it */}
      <section id="trust" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div className={ti.split}>
              <div className={ti.rail} data-reveal="0" style={{ display: 'grid', alignContent: 'space-between', gap: 40 }}>
                <SectionHead n="08" label="why trust it" title="Why trust it" stacked />
                <figure className={styles.quote}>
                  <div className={styles.quoteMeta}>
                    <Image src={FOUNDER_PHOTO} alt="" width={32} height={32} className={styles.avatar} />
                    <span className={styles.quoteBy}>SrikaantH, founder</span>
                  </div>
                  <blockquote className={styles.quoteText}>No practice can pay to move up.</blockquote>
                </figure>
              </div>
              <div className={ti.main} data-reveal="1">
                <div className={styles.trust}>
                  {[
                    { n: '01', title: 'The same method for every practice', text: 'Every practice is found, measured and scored the same way. Nobody gets a different test.' },
                    { n: '02', title: 'No paid placements', text: 'Scores come only from the measurements. There is no way to buy a higher position.' },
                    { n: '03', title: 'Updated monthly', text: 'Each city is re-measured as a new monthly snapshot, and the date is on every report.' },
                    { n: '04', title: 'A link for every practice', text: 'Every practice gets a do-follow link to its own website, and can ask to be removed at any time.' },
                  ].map((item) => (
                    <div key={item.n} className={styles.trustItem}>
                      <span className={styles.trustNum}>.{item.n}</span>
                      <h3 className={styles.cellTitle}>{item.title}</h3>
                      <p className={styles.cellText}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 09 next steps */}
      <section id="next" className={`${ti.section} ${ti.dark} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="09" label="next steps" title="What to do with your result" />
            </div>
            <div className={ti.split} data-reveal="1">
              <div />
              <div className={styles.plans}>
                <div className={styles.plan}>
                  <span className={styles.planTag}>do it yourself</span>
                  <p className={styles.planFor}>For practices that would rather work on it themselves.</p>
                  <ul className={styles.planList}>
                    <li>
                      <a href="https://business.google.com" target="_blank" rel="noopener" className={ti.link}>Google Business Profile</a>
                    </li>
                    <li>
                      <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className={ti.link}>Google Search Console</a>
                    </li>
                    <li>
                      <a href="https://pagespeed.web.dev" target="_blank" rel="noopener" className={ti.link}>PageSpeed Insights</a>
                    </li>
                    <li>
                      <Link href={routes.freebies.hub} className={ti.link}>Free guides from wwisermind</Link>
                    </li>
                  </ul>
                  <TiButton href={routes.freebies.hub} tone="ghostDark">See the free guides</TiButton>
                </div>
                <div className={`${styles.plan} ${styles.planFeatured}`}>
                  <span className={styles.planTag}>
                    free visibility review <span className={styles.planBadge}>start here</span>
                  </span>
                  <p className={styles.planFor}>For practices that want a clear picture first.</p>
                  <ul className={styles.planList}>
                    <li>30 minutes with someone at wwisermind</li>
                    <li>Your map, website and AI results in your city</li>
                    <li>A short list of what to look at first</li>
                    <li>No obligation to hire us</li>
                  </ul>
                  <CtaLink href={routes.contactBook} className={`${ti.btn} ${ti.btnLight}`}>
                    Book the free review
                  </CtaLink>
                </div>
                <div className={styles.plan}>
                  <span className={styles.planTag}>done for you</span>
                  <p className={styles.planFor}>For practices that want it handled.</p>
                  <ul className={styles.planList}>
                    <li>Google Business Profile set up and kept current</li>
                    <li>Local SEO for your city and specialties</li>
                    <li>Reporting against the same measures</li>
                  </ul>
                  <TiButton href={routes.pricing.localSeo} tone="ghostDark">See Local SEO packages</TiButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10 FAQ */}
      <section id="faq" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <Reveal as="div">
            <div data-reveal="0">
              <SectionHead n="10" label="faq" title="Questions" />
            </div>
            <div className={ti.split} data-reveal="1">
              <div className={`${ti.rail} ${styles.rail}`}>
                <p>The questions practices ask us most about the index.</p>
              </div>
              <div className={ti.main}>
                <TiFaq items={faqRows} />
                <div className={styles.faqAsk}>
                  <span className={ti.mono}>Got another question?</span>
                  <a href={CONTACT_MAILTO} className={`${ti.btn} ${ti.btnDark}`} style={{ justifySelf: 'start' }}>
                    Send a message
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11 closing call to action */}
      <section id="contact" className={`${ti.section} ${styles.closing} ${ti.lines}`}>
        <div className={styles.closingBg} aria-hidden="true" />
        <div className={ti.frame}>
          <div className={styles.closingBody}>
            <SectionLabel n="11">contact</SectionLabel>
            <div className={ti.split}>
              <div />
              <div style={{ display: 'grid', gap: 28 }}>
                <h2 className={styles.closingTitle}>Don&apos;t see your city?</h2>
                <p className={ti.lede}>Book a free 30-minute visibility review, or email us to ask for your city to be added.</p>
                <div className={`${ti.btnRow} ${styles.heroCtas}`}>
                  <ReviewButton tone="accent">Book a free review</ReviewButton>
                  <a href={CONTACT_MAILTO} className={`${ti.btn} ${ti.btnLight}`}>Email us</a>
                </div>
                <p className={styles.closingMeta}>
                  <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>
                  <Link href={routes.therapyIndex.methodology}>Methodology</Link>
                </p>
                <Disclaimer />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
