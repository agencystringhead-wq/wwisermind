import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import {
  bestMapRank, displayName, hasProfile, mapTopThree, practiceKind, practiceLabels, scoreText, searchLabel, type MarketView,
} from '@/lib/therapyindex/data';
import type { OrganicKind, Practice } from '@/lib/therapyindex/types';
import DirectoryTable, { type DirectoryRow } from './DirectoryTable';
import type { MapPoint } from './mapShared';
import MarketMap from './MarketMap';
import { Disclaimer, JsonLd, ReviewButton, SectionHead, SectionLabel } from './Primitives';
import RankGrid, { type RankRow } from './RankGrid';
import m from './market.module.css';
import ti from './ti.module.css';

const SECTIONS = [
  { id: 'overview', n: '01', label: 'Overview' },
  { id: 'map', n: '02', label: 'Map' },
  { id: 'map-pack', n: '03', label: 'Map pack' },
  { id: 'rank-grid', n: '04', label: 'Rank grid' },
  { id: 'website-race', n: '05', label: 'Website race' },
  { id: 'ai', n: '06', label: 'AI assistants' },
  { id: 'directory', n: '07', label: 'Directory' },
  { id: 'next', n: '08', label: 'Next step' },
];

const KIND_LABEL: Record<OrganicKind, { text: string; className: string }> = {
  'local practice': { text: 'Local practice', className: ti.tagLocal },
  'local-no-map': { text: 'Local practice, not on the map', className: ti.tagLocal },
  directory: { text: 'Directory', className: ti.tagDirectory },
  other: { text: 'Other', className: ti.tag },
};

const KIND_TYPE_LABEL = { practice: 'Practice', chain: 'National chain', medical: 'Medical', nonprofit: 'Nonprofit' } as const;

const ratingText = (p: { rating: number | null; reviewCount: number | null }) =>
  p.rating !== null ? `${p.rating} stars, ${p.reviewCount ?? 0} reviews` : 'No reviews yet';

/** Bounds for the map from the middle 95% of the dots, so one practice far out of town does not pull the view away. */
function trimmedBounds(points: { lat: number; lng: number }[]): [[number, number], [number, number]] {
  const lats = points.map((p) => p.lat).sort((a, b) => a - b);
  const lngs = points.map((p) => p.lng).sort((a, b) => a - b);
  const cut = Math.floor(points.length * 0.025);
  const pick = (values: number[]) => [values[cut] ?? values[0], values[values.length - 1 - cut] ?? values[values.length - 1]];
  const [south, north] = pick(lats);
  const [west, east] = pick(lngs);
  return [[south, west], [north, east]];
}

export default function MarketPage({ view }: { view: MarketView }) {
  const { snapshot, city, state } = view;
  const bySlug = new Map(snapshot.practices.map((p) => [p.slug, p]));
  const profile = (p: Practice | undefined | null) => (p && hasProfile(p) ? routes.therapyIndex.practice(state.slug, city.slug, p.slug) : null);

  /* --- 02 map points --- */
  const located = view.practices.filter((p): p is Practice & { lat: number; lng: number } => p.lat !== null && p.lng !== null);
  const points: MapPoint[] = located.map((p) => ({
    name: displayName(p.name),
    lat: p.lat,
    lng: p.lng,
    score: p.visibilityScore,
    kind: practiceKind(p),
    detail: `${KIND_TYPE_LABEL[practiceKind(p)]} Â· score ${scoreText(p.visibilityScore)} Â· ${ratingText(p)}`,
    href: profile(p),
  }));
  const bounds = points.length ? trimmedBounds(points) : ([[0, 0], [0, 0]] as [[number, number], [number, number]]);

  /* --- 04 rank grid rows: practices that show for at least one search (Maps top 20 or organic top 6) --- */
  const rankRows: RankRow[] = view.practices
    .filter((p) => Object.values(p.mapRankBySearch).some((r) => r <= 20) || Object.keys(p.organicRankBySearch).length > 0)
    .slice(0, 40)
    .map((p) => ({ slug: p.slug, name: displayName(p.name), href: profile(p), score: p.visibilityScore, map: p.mapRankBySearch, organic: p.organicRankBySearch }));

  /* --- 05 website race --- */
  const dirCounts = view.directories
    .map((d) => ({ name: d.name, count: Object.keys(d.organicRankBySearch).length }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  /* --- 06 AI --- */
  const named = view.practices
    .filter((p) => p.aiMentions.chatgpt + p.aiMentions.claude > 0)
    .sort((a, b) => b.aiMentions.chatgpt + b.aiMentions.claude - (a.aiMentions.chatgpt + a.aiMentions.claude) || b.visibilityScore - a.visibilityScore);
  const mentions = named.reduce((n, p) => n + p.aiMentions.chatgpt + p.aiMentions.claude, 0);
  const institutions = snapshot.aiInstitutionMentions ?? [];

  /* --- 07 directory --- */
  const directoryRows: DirectoryRow[] = view.practices.map((p) => ({
    slug: p.slug,
    name: displayName(p.name),
    href: profile(p),
    location: p.address ?? p.city ?? city.name,
    rating: p.rating,
    reviews: p.reviewCount ?? 0,
    mapRank: bestMapRank(p),
    score: p.visibilityScore,
    scoreText: scoreText(p.visibilityScore),
    rank: view.rankOf.get(p.slug) ?? null,
    labels: practiceLabels(p),
  }));

  const top10 = view.eligible.slice(0, 10);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${city.name} therapist rankings, ${view.month}`,
    numberOfItems: top10.length,
    itemListElement: top10.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: displayName(p.name),
      url: absUrl(routes.therapyIndex.practice(state.slug, city.slug, p.slug)),
    })),
  };

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Therapy Index', href: routes.therapyIndex.hub },
          { label: city.name, href: view.path },
        ]}
      />
      <JsonLd data={itemList} />

      <header className={`${m.top}`}>
        <div className={ti.frame}>
          <div className={m.topBody}>
            <SectionLabel n="TI">{city.name}, {state.name}</SectionLabel>
            <h1 className={m.h1}>{city.name} therapists: who patients find on Google and in AI answers</h1>
            <p className={m.dek}>
              A measured ranking of {snapshot.summary.totalPractices} therapy practices in {snapshot.market.areaLabel}, from the {view.month} snapshot.
            </p>
            <p className={m.meta}>
              <span>ID {view.snapshotId}</span>
              <span>Data date {view.date}</span>
              <span>{view.eligible.length} ranked</span>
            </p>
          </div>
        </div>
      </header>

      <nav className={m.toc} aria-label="On this page">
        <div className={ti.frame}>
          <div className={m.tocList}>
            <span className={m.tocTitle}>On this page</span>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={m.tocLink}>
                <b>{s.n}</b>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 01 overview */}
      <section id="overview" className={`${ti.section}`}>
        <div className={ti.frame}>
          <SectionHead n="01" label="overview" title={`The ${city.name} snapshot`} />
          <div className={m.wwhh}>
            <div className={m.wwhhItem}>
              <h3>What</h3>
              <p>
                A measured ranking of {snapshot.summary.totalPractices} therapy practices in {snapshot.market.areaLabel}, built from {snapshot.keywords.length} Google searches and {snapshot.aiPrompts.length} questions put to each AI assistant.
              </p>
            </div>
            <div className={m.wwhhItem}>
              <h3>Who</h3>
              <p>
                Every practice that appears in Google Maps for the searches we track, plus any a search result or AI answer points to. {view.eligible.length} have ten or more Google reviews and can be ranked.
              </p>
            </div>
            <div className={m.wwhhItem}>
              <h3>Why</h3>
              <p>
                Patients tend to look at the first few results. The index shows who those results belong to today, so a practice can see where it stands.
              </p>
            </div>
            <div className={m.wwhhItem}>
              <h3>How</h3>
              <p>
                The same searches and questions for every practice. Map position, website position, AI mentions and reviews become one score, with the leader at 100.{' '}
                <Link href={routes.therapyIndex.methodology} className={ti.link}>See the method</Link>.
              </p>
            </div>
          </div>

          <div className={m.overviewGrid}>
            <div>
              <h3 className={m.boxTitle}>Top 10 in {city.name}</h3>
              <ol className={m.topList}>
                {top10.map((p, i) => {
                  const href = profile(p);
                  return (
                    <li key={p.slug} className={m.topItem}>
                      <span className={m.topRank}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={m.topName}>
                        {href ? <Link href={href}>{displayName(p.name)}</Link> : displayName(p.name)}
                        <span className={m.topSub}>{[p.city, ratingText(p)].filter(Boolean).join(' Â· ')}</span>
                      </span>
                      <span className={m.score}>{p.visibilityScore}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div>
              <h3 className={m.boxTitle}>Snapshot</h3>
              <dl className={m.snap}>
                <div className={m.snapRow}><dt>Market</dt><dd>{city.name}, {state.name}</dd></div>
                <div className={m.snapRow}><dt>Snapshot ID</dt><dd>{view.snapshotId}</dd></div>
                <div className={m.snapRow}><dt>Snapshot date</dt><dd>{view.date}</dd></div>
                <div className={m.snapRow}><dt>Geography</dt><dd>{snapshot.market.areaLabel}</dd></div>
                <div className={m.snapRow}><dt>Practices measured</dt><dd>{snapshot.summary.totalPractices}</dd></div>
                <div className={m.snapRow}><dt>Practices ranked</dt><dd>{view.eligible.length}</dd></div>
                <div className={m.snapRow}><dt>Searches tracked</dt><dd>{snapshot.keywords.length}</dd></div>
                <div className={m.snapRow}><dt>AI questions</dt><dd>{snapshot.aiPrompts.length} on ChatGPT and Claude</dd></div>
                <div className={m.snapRow}><dt>Publisher</dt><dd>wwisermind</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 02 map */}
      <section id="map" className={`${ti.section}`}>
        <div className={ti.frame}>
          <SectionHead n="02" label="map" title="Where the practices are" lede="Every practice with a map listing, sized by score and coloured by type." />
          {points.length > 0 ? <MarketMap points={points} bounds={bounds} /> : <p>No map positions are available for this snapshot.</p>}
        </div>
      </section>

      {/* 03 map pack */}
      <section id="map-pack" className={`${ti.section} ${ti.bandCream}`}>
        <div className={ti.frame}>
          <SectionHead
            n="03"
            label="the map pack"
            title="Who holds the top 3"
            lede="The three places Google shows first for each search. Where Google showed no map pack, the top three in Maps are listed instead."
          />
          <div className={m.packs}>
            {snapshot.keywords.map((k) => {
              const pack = snapshot.localPackBySearch?.[k] ?? [];
              const fromPack = pack.length > 0;
              const entries = fromPack
                ? pack.map((e) => ({ position: e.position, name: e.title, practice: e.practiceSlug ? bySlug.get(e.practiceSlug) : undefined, rating: e.rating, reviews: e.reviewCount }))
                : mapTopThree(view, k).map((p) => ({ position: p.mapRankBySearch[k], name: displayName(p.name), practice: p, rating: p.rating, reviews: p.reviewCount }));
              return (
                <div key={k} className={m.pack}>
                  <h3 className={m.packTitle}>
                    {searchLabel(k)}
                    <small>{fromPack ? 'Google map pack' : 'Maps top 3'}</small>
                  </h3>
                  {entries.length === 0 ? (
                    <p className={m.notTested}>Not tested</p>
                  ) : (
                    <ol className={m.packList}>
                      {entries.map((e, i) => {
                        const href = profile(e.practice);
                        return (
                          <li key={`${e.name}-${i}`} className={m.packItem}>
                            <b>{e.position}</b>
                            <span>
                              {href ? <Link href={href}>{e.name}</Link> : e.name}
                              <span className={m.packSub}>{e.rating !== null ? `${e.rating} stars, ${e.reviews ?? 0} reviews` : 'No reviews yet'}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 rank grid */}
      <section id="rank-grid" className={`${ti.section}`}>
        <div className={ti.frame}>
          <SectionHead
            n="04"
            label="rank grid"
            title="Practices by search"
            lede={`The ${rankRows.length} highest-scoring practices that show up in Maps or Google search, and where each one appears for every search. Switch between the map pack and website rankings.`}
          />
          <RankGrid rows={rankRows} keywords={snapshot.keywords} notTested={snapshot.organicNotTested ?? []} />
        </div>
      </section>

      {/* 05 website race */}
      <section id="website-race" className={`${ti.section} ${ti.bandTint}`}>
        <div className={ti.frame}>
          <SectionHead n="05" label="the website race" title="Who takes the first page of Google" wide />
          <div className={m.headline}>
            <span className={m.headlineFigure}>{Math.round(view.directoryShare)}%</span>
            <p className={m.headlineText}>
              of the top-6 website results in {city.name}, across {snapshot.keywords.length} searches, went to directories rather than to a practice&apos;s own site.
              <small>
                {view.directorySlots} of {view.organicSlots} results
                {dirCounts.length > 0 ? `. Most often: ${dirCounts.map((d) => `${d.name} (${d.count} searches)`).join(', ')}.` : '.'} Directories can be useful to patients; this shows how much of the first page they take.
              </small>
            </p>
          </div>
          <div className={m.races}>
            {snapshot.keywords.map((k) => {
              const entries = snapshot.organicTopBySearch[k] ?? [];
              return (
                <div key={k} className={m.race}>
                  <h3 className={m.packTitle}>{searchLabel(k)}</h3>
                  {entries.length === 0 ? (
                    <p className={m.notTested}>Not tested</p>
                  ) : (
                    <ol className={m.raceList}>
                      {entries.map((e, i) => {
                        const kind = KIND_LABEL[e.kind];
                        const practice = e.practiceSlug ? bySlug.get(e.practiceSlug) : undefined;
                        const internal = e.kind === 'local practice' ? profile(practice) : null;
                        return (
                          <li key={`${e.domain}-${i}`} className={m.raceItem}>
                            <b>{e.rank}</b>
                            <span>
                              <span className={`${ti.tag} ${kind.className}`}>{kind.text}</span>
                              <span className={m.raceDomain}>
                                {internal ? (
                                  <Link href={internal}>{practice ? displayName(practice.name) : e.domain}</Link>
                                ) : e.kind === 'local-no-map' ? (
                                  <a href={e.url} target="_blank" rel="noopener">{e.domain}</a>
                                ) : (
                                  e.domain
                                )}
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 06 AI assistants */}
      <section id="ai" className={`${ti.section} ${ti.bandCream}`}>
        <div className={ti.frame}>
          <SectionHead
            n="06"
            label="ai assistants"
            title="Who ChatGPT and Claude name"
            lede={`${snapshot.aiPrompts.length} questions were put to each assistant with web search on. A practice counts when its name appears in an answer.`}
          />
          <div className={m.aiStats}>
            <div className={m.aiStat}><strong>{view.practicesNamedByAi}</strong><span>practices named</span></div>
            <div className={m.aiStat}><strong>{mentions}</strong><span>mentions across {view.aiAnswers} answers</span></div>
            <div className={m.aiStat}><strong>{view.aiInstitutionAnswers}</strong><span>answers that named a hospital, university or directory</span></div>
          </div>
          <div className={m.twoCol}>
            <div>
              <h3 className={m.subTitle}>Practices named</h3>
              {named.length === 0 ? (
                <p>No practice was named in this snapshot.</p>
              ) : (
                <div className={ti.tableWrap}>
                  <table className={ti.table}>
                    <thead>
                      <tr>
                        <th scope="col">Practice</th>
                        <th scope="col" className={ti.num}>ChatGPT</th>
                        <th scope="col" className={ti.num}>Claude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {named.map((p) => {
                        const href = profile(p);
                        return (
                          <tr key={p.slug}>
                            <td>{href ? <Link href={href}>{displayName(p.name)}</Link> : displayName(p.name)}</td>
                            <td className={ti.num}>{p.aiMentions.chatgpt}</td>
                            <td className={ti.num}>{p.aiMentions.claude}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <ul className={m.questions}>
                {snapshot.aiPrompts.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={m.subTitle}>Named in answers as well</h3>
              {institutions.length === 0 ? (
                <p>No hospital, university or directory was named.</p>
              ) : (
                <ul className={m.instList}>
                  {institutions.map((inst) => {
                    const engines = [...new Set(inst.mentions.map((x) => (x.provider === 'chatgpt' ? 'ChatGPT' : 'Claude')))];
                    return (
                      <li key={inst.name} className={m.inst}>
                        <span>{inst.name}</span>
                        <span className={ti.tag}>{inst.type}</span>
                        <small>
                          {engines.join(' and ')}, {inst.mentions.length} {inst.mentions.length === 1 ? 'answer' : 'answers'}
                        </small>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 07 directory */}
      <section id="directory" className={`${ti.section}`}>
        <div className={ti.frame}>
          <SectionHead n="07" label="full directory" title={`All ${view.practices.length} practices`} lede="Click a column to sort. Every practice links to its own profile and website." />
          <DirectoryTable rows={directoryRows} />
        </div>
      </section>

      {/* 08 call to action */}
      <section id="next" className={`${ti.section} ${ti.bandTint}`}>
        <div className={ti.frame}>
          <div className={m.cta}>
<SectionLabel n="08">next step</SectionLabel>
              <h2 className={m.ctaTitle}>Where does your practice stand in {city.name}?</h2>
              <p className={ti.lede}>
                Book a free 30-minute visibility review. We will go through your map, website and AI results together and point to what to look at first.
              </p>
              <div>
                <ReviewButton tone="accent" />
              </div>
              <Disclaimer />
            </div>
        </div>
      </section>
    </>
  );
}
