import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO, SEARCH_GROUPS } from '@/lib/therapyindex/config';
import { getMarketViews, searchLabel } from '@/lib/therapyindex/data';
import {
  AI_BONUS_CAP, AI_MENTION_POINTS, AI_MODELS, AI_PROMPTS, KEYWORDS, LIGHTHOUSE_MAX_PRACTICES, MAPS_DEPTH, MAP_BELOW_PACK_MAX_RANK,
  MAP_BELOW_PACK_POINTS, MAP_PACK_POINTS, MIN_REVIEWS_FOR_RANKING, ORGANIC_POINTS, ORGANIC_TOP_N, REVIEW_WEIGHT,
} from '@/lib/therapyindex/markets';
import { Disclaimer, ReviewButton, SectionHead, SectionLabel } from './Primitives';
import m from './market.module.css';
import ti from './ti.module.css';

const ordinal = (i: number) => `#${i + 1}`;
const percent = (n: number) => `${Math.round(n * 100)}%`;

export default function MethodologyPage() {
  const views = getMarketViews();
  const reviewShare = percent(REVIEW_WEIGHT);
  const visibilityShare = percent(1 - REVIEW_WEIGHT);

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Therapy Index', href: routes.therapyIndex.hub },
          { label: 'Methodology', href: routes.therapyIndex.methodology },
        ]}
      />

      <header className={`${m.top} ${ti.lines}`}>
        <div className={ti.dots} aria-hidden="true" />
        <div className={ti.frame}>
          <div className={m.topBody}>
            <SectionLabel n="TI">methodology</SectionLabel>
            <h1 className={m.h1}>How the Therapy Index works</h1>
            <p className={m.dek}>
              The sources, the searches, the scoring weights and the rules for who is ranked. Everything on this page is read from the same settings the index runs on.
            </p>
          </div>
        </div>
      </header>

      <section id="sources" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="01" label="sources" title="Where the data comes from" />
          <div className={m.prose}>
            <ul className={m.bullets}>
              <li><span><strong>Google Maps.</strong> The first {MAPS_DEPTH} results for each tracked search, for the city.</span></li>
              <li><span><strong>Google search.</strong> The first page of results for each tracked search, with the city and state added. The top {ORGANIC_TOP_N} website results are kept and tagged as a local practice, a directory or other.</span></li>
              <li><span><strong>ChatGPT and Claude.</strong> The same {AI_PROMPTS.length} questions are put to each assistant with web search on ({AI_MODELS.chatgpt} and {AI_MODELS.claude}). A practice is counted when its name or website appears in an answer.</span></li>
              <li><span><strong>Lighthouse.</strong> A speed and access check of the home page on a phone, run on up to {LIGHTHOUSE_MAX_PRACTICES} practice sites per city. It is shown on profiles and does not change the score.</span></li>
              <li><span><strong>DataForSEO.</strong> The data service the searches, AI questions and Lighthouse checks are collected through.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="searches" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="02" label="searches" title="Searches we track" lede="Every city gets the same searches." />
          <div className={m.prose}>
            {SEARCH_GROUPS.map((group) => (
              <div key={group.id}>
                <h3 className={m.subTitle}>{group.title}</h3>
                <p>{group.keywords.filter((k) => KEYWORDS.includes(k)).map(searchLabel).join(', ')}</p>
              </div>
            ))}
            <h3 className={m.subTitle}>Questions put to ChatGPT and Claude</h3>
            <ul className={m.bullets}>
              {AI_PROMPTS.map((q) => (
                <li key={q}><span>{q.replace('{city}', 'the city').replace('{stateName}', 'state')}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="score" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="03" label="the score" title="How the score is worked out" lede="Each practice gets one number from 0 to 100. The best practice in a city is 100 and everyone else is measured against it." />
          <div className={m.prose}>
            <p><strong>Step 1: activity points.</strong> A practice earns points for every search it appears in, and for every AI answer that names it.</p>
          </div>
          <div className={`${ti.tableWrap} ${m.weights}`} style={{ marginTop: 20 }}>
            <table className={ti.table}>
              <thead>
                <tr><th scope="col">What is counted</th><th scope="col">Points</th></tr>
              </thead>
              <tbody>
                {MAP_PACK_POINTS.map((points, i) => (
                  <tr key={`map-${i}`}><td>Google Maps position {ordinal(i)} (the map pack), per search</td><td>{points}</td></tr>
                ))}
                <tr><td>Google Maps positions #{MAP_PACK_POINTS.length + 1} to #{MAP_BELOW_PACK_MAX_RANK}, per search</td><td>{MAP_BELOW_PACK_POINTS}</td></tr>
                {ORGANIC_POINTS.map((points, i) => (
                  <tr key={`org-${i}`}><td>Google search position {ordinal(i)}, per search</td><td>{points}</td></tr>
                ))}
                <tr><td>Each ChatGPT or Claude answer that names the practice (up to {AI_BONUS_CAP} points in all)</td><td>{AI_MENTION_POINTS}</td></tr>
              </tbody>
            </table>
          </div>
          <div className={m.prose} style={{ marginTop: 24 }}>
            <p>
              <strong>Step 2: scale.</strong> Activity is divided by the best activity in the city, so the leader is 1 and the rest are a fraction of it.
              Review strength is the log of a practice&apos;s review count divided by the log of the highest review count among ranked practices, so the first reviews count for more than the hundredth.
            </p>
            <p>
              <strong>Step 3: blend.</strong> The score is {visibilityShare} activity and {reviewShare} review strength, then scaled so the best practice is 100. Map position is the main driver. Scores under 5 are shown as &quot;Low visibility&quot;.
            </p>
          </div>
        </div>
      </section>

      <section id="eligibility" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="04" label="who is ranked" title="Eligibility" />
          <div className={m.prose}>
            <ul className={m.bullets}>
              <li><span><strong>{MIN_REVIEWS_FOR_RANKING} or more Google reviews</strong> to take a rank, a top-10 place or the leader slot. A practice with fewer is still listed, with its real score and a &quot;Few reviews&quot; label.</span></li>
              <li><span><strong>National chains and networks</strong> are listed and labelled but not ranked against independent practices.</span></li>
              <li><span><strong>Medical clinics</strong> (interventional psychiatry such as ketamine or TMS, and psychiatry-only practices) are listed and labelled but not ranked against therapy practices.</span></li>
              <li><span><strong>Nonprofit and community organisations</strong> are listed and labelled but not ranked against private practices.</span></li>
              <li><span><strong>Directories</strong> such as Psychology Today and Zocdoc are measured in the website results but are not scored as practices.</span></li>
              <li><span><strong>Not counted at all:</strong> listings whose Google category is not mental health, such as massage, physical therapy or coaching.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="snapshots" className={`${ti.section} ${ti.lines}`}>
        <div className={ti.frame}>
          <SectionHead n="05" label="snapshots" title="Snapshot dates" lede="Each city is measured as a snapshot. A snapshot is a fixed set of data, not a live feed." />
          <div className={`${ti.tableWrap} ${m.snapList}`}>
            <table className={ti.table}>
              <thead>
                <tr><th scope="col">City</th><th scope="col">Snapshot ID</th><th scope="col">Date</th><th scope="col" className={ti.num}>Practices</th></tr>
              </thead>
              <tbody>
                {views.map((v) => (
                  <tr key={v.snapshotId}>
                    <td><Link href={v.path} className={ti.link}>{v.city.name}</Link></td>
                    <td>{v.snapshotId}</td>
                    <td>{v.date}</td>
                    <td className={ti.num}>{v.snapshot.summary.totalPractices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="removal" className={`${ti.section} ${ti.dark} ${ti.lines}`}>
        <div className={ti.frame}>
          <div className={ti.split}>
            <div className={ti.rail}>
              <SectionLabel n="06">removal</SectionLabel>
            </div>
            <div className={m.cta}>
              <h2 className={m.ctaTitle}>Asking to be removed</h2>
              <p className={ti.lede}>
                Email <a href={CONTACT_MAILTO} className={ti.link}>{CONTACT_EMAIL}</a> with the practice name and city and we will take it out of the index. Spotted something wrong? Tell us and we will check it.
              </p>
              <div>
                <ReviewButton tone="accent" />
              </div>
              <Disclaimer />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
