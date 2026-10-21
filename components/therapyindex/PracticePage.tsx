import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import { LOW_VISIBILITY_BELOW } from '@/lib/therapyindex/config';
import { bestMapRank, cleanUrl, mapsUrl, practiceLabels, scoreText, searchLabel, type MarketView } from '@/lib/therapyindex/data';
import { MIN_REVIEWS_FOR_RANKING } from '@/lib/therapyindex/markets';
import type { Practice } from '@/lib/therapyindex/types';
import { Disclaimer, SectionHead, SectionLabel, TiButton } from './Primitives';
import m from './market.module.css';
import ti from './ti.module.css';

const labelClass = { chain: ti.tagChain, medical: ti.tagMedical, nonprofit: ti.tagNonprofit, few: ti.tagFew, nomap: ti.tag } as const;

/** Why a practice has no rank, in neutral words. */
function notRankedReason(p: Practice): string | null {
  if (p.isChain) return 'National chains and networks are listed but not ranked against independent practices.';
  if (p.isMedical) return 'Medical and psychiatry-only clinics are listed but not ranked against therapy practices.';
  if (p.isNonprofit) return 'Nonprofit and community organisations are listed but not ranked against private practices.';
  if (p.fewReviews) return `A practice needs ${MIN_REVIEWS_FOR_RANKING} Google reviews to be ranked. This one has ${p.reviewCount ?? 0}.`;
  return null;
}

const lighthouseTone = (n: number) => (n >= 90 ? m.lhGood : n >= 50 ? m.lhOk : m.lhPoor);

export default function PracticePage({ view, practice: p }: { view: MarketView; practice: Practice }) {
  const { snapshot, city, state } = view;
  const rank = view.rankOf.get(p.slug) ?? null;
  const reason = rank === null ? notRankedReason(p) : null;
  const website = cleanUrl(p.website);
  const maps = mapsUrl(p);
  const labels = practiceLabels(p);
  const best = bestMapRank(p);
  const answers = p.aiMentions.chatgpt + p.aiMentions.claude;
  const location = [p.address ?? p.city, !p.address ? state.name : null].filter(Boolean).join(', ');

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Therapy Index', href: routes.therapyIndex.hub },
          { label: city.name, href: view.path },
          { label: p.name, href: routes.therapyIndex.practice(state.slug, city.slug, p.slug) },
        ]}
      />

      <header className={`${m.top} ${ti.lines}`}>
        <div className={ti.headerBg} aria-hidden="true" />
        <div className={ti.frame}>
          <div className={m.topBody}>
            <SectionLabel n="TI">{city.name} profile</SectionLabel>
            <h1 className={m.h1} style={{ maxWidth: '24ch' }}>{p.name}</h1>
            <p className={m.dek}>
              {[p.category, location].filter(Boolean).join(' · ')}
            </p>
            {labels.length > 0 ? (
              <span className={ti.tags}>
                {labels.map((l) => (
                  <span key={l.id} className={`${ti.tag} ${labelClass[l.id]}`}>{l.text}</span>
                ))}
              </span>
            ) : null}
            <p className={m.meta}>
              <span>ID {view.snapshotId}</span>
              <span>Data date {view.date}</span>
            </p>
          </div>
        </div>
      </header>

      {/* 01 score */}
      <section id="score" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="01" label="score" title="Where this practice stands" />
          <div className={m.profileFacts}>
            <div className={m.fact}>
              <strong>{p.visibilityScore < LOW_VISIBILITY_BELOW ? 'Low' : p.visibilityScore}</strong>
              <span>{p.visibilityScore < LOW_VISIBILITY_BELOW ? 'visibility' : 'visibility score'}</span>
              <p>{p.visibilityScore < LOW_VISIBILITY_BELOW ? `Score ${p.visibilityScore} of 100. The leader in ${city.name} is 100.` : `Out of 100. The leader in ${city.name} is 100.`}</p>
            </div>
            <div className={m.fact}>
              <strong>{rank !== null ? `#${rank}` : '–'}</strong>
              <span>rank in {city.name}</span>
              <p>{rank !== null ? `Of ${view.eligible.length} ranked practices.` : reason ?? 'Not ranked.'}</p>
            </div>
            <div className={m.fact}>
              <strong>{best !== null ? `#${best}` : '–'}</strong>
              <span>best map position</span>
              <p>{best !== null ? 'Across the tracked searches in Google Maps.' : 'Not in the Google Maps results we collected.'}</p>
            </div>
            <div className={m.fact}>
              <strong>{p.rating !== null ? p.rating.toFixed(1) : '–'}</strong>
              <span>Google rating</span>
              <p>{p.rating !== null ? `${p.reviewCount ?? 0} reviews.` : 'No Google reviews yet.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 searches */}
      <section id="searches" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="02" label="searches" title="Position for each search" lede={`Where this practice appeared in Google Maps and in Google search for the ${snapshot.keywords.length} searches we track.`} />
          <div className={ti.tableWrap}>
            <table className={ti.table}>
              <thead>
                <tr>
                  <th scope="col">Search</th>
                  <th scope="col" className={ti.num}>Google Maps</th>
                  <th scope="col" className={ti.num}>Google search</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.keywords.map((k) => {
                  const untested = (snapshot.organicNotTested ?? []).includes(k);
                  return (
                    <tr key={k}>
                      <td>{searchLabel(k)}</td>
                      <td className={ti.num}>{p.mapRankBySearch[k] !== undefined ? `#${p.mapRankBySearch[k]}` : '–'}</td>
                      <td className={ti.num}>{untested ? 'Not tested' : p.organicRankBySearch[k] !== undefined ? `#${p.organicRankBySearch[k]}` : '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={m.dirNote}>A dash means the practice did not appear: beyond the first 100 Maps results, or outside the first six website results.</p>
        </div>
      </section>

      {/* 03 AI */}
      <section id="ai" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="03" label="ai assistants" title="ChatGPT and Claude" />
          <div className={m.aiStats}>
            <div className={m.aiStat}><strong>{p.aiMentions.chatgpt}</strong><span>ChatGPT answers naming it</span></div>
            <div className={m.aiStat}><strong>{p.aiMentions.claude}</strong><span>Claude answers naming it</span></div>
            <div className={m.aiStat}><strong>{view.aiAnswers}</strong><span>answers collected in {city.name}</span></div>
          </div>
          {answers > 0 ? (
            <ul className={m.questions}>
              {p.aiMentions.prompts.map((x, i) => (
                <li key={`${x.provider}-${i}`}>{x.provider === 'chatgpt' ? 'ChatGPT' : 'Claude'}: “{x.prompt}”</li>
              ))}
            </ul>
          ) : (
            <p className={m.dirNote}>Neither assistant named this practice in the {view.aiAnswers} answers collected for {city.name}.</p>
          )}
          {p.people.length > 0 ? <p className={m.dirNote}>Named alongside it: {p.people.join(', ')}.</p> : null}
        </div>
      </section>

      {/* 04 site speed */}
      <section id="speed" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="04" label="site speed" title="Website speed and access" lede="A Lighthouse check of the home page on a phone. It is shown here for information and does not change the score." />
          {p.lighthouse ? (
            <div className={m.lighthouse}>
              <div className={m.lhItem}><strong className={lighthouseTone(p.lighthouse.performance)}>{p.lighthouse.performance}</strong><span>Performance</span></div>
              <div className={m.lhItem}><strong className={lighthouseTone(p.lighthouse.seo)}>{p.lighthouse.seo}</strong><span>Search basics (SEO)</span></div>
              <div className={m.lhItem}><strong className={lighthouseTone(p.lighthouse.accessibility)}>{p.lighthouse.accessibility}</strong><span>Accessibility</span></div>
            </div>
          ) : (
            <p className={m.dirNote}>Not tested in this snapshot.</p>
          )}
        </div>
      </section>

      {/* 05 links and next step */}
      <section id="links" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="05" label="links" title="Visit this practice" />
          <div className={m.links}>
            {website ? (
              <a href={website} target="_blank" rel="noopener" className={`${ti.btn} ${ti.btnDark}`}>
                Website
              </a>
            ) : null}
            {maps ? (
              <a href={maps} target="_blank" rel="noopener" className={`${ti.btn} ${ti.btnLight}`}>
                Google Maps listing
              </a>
            ) : null}
            <Link href={view.path} className={`${ti.btn} ${ti.btnLight}`}>
              Back to the {city.name} report
            </Link>
          </div>
        </div>
      </section>

      <section id="next" className={`${ti.section} ${ti.dark} ${ti.lines}`}>
        <div className={ti.frame}>
          <div className={ti.split}>
            <div className={ti.rail}>
              <SectionLabel n="06">is this you?</SectionLabel>
            </div>
            <div className={m.cta}>
              <h2 className={m.ctaTitle}>Is this your practice?</h2>
              <p className={ti.lede}>Get a free walkthrough of what this means. 30 minutes, no obligation.</p>
              <div>
                <TiButton href={routes.contactBook} tone="accent">Get a free walkthrough</TiButton>
              </div>
              <Disclaimer />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
