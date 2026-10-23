'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import SearchBox from '@/components/local-map/SearchBox';
import { LMA_START_PATH } from '@/lib/local-map-assessment';
import { DEFAULT_RADIUS, KEYWORD_COUNT, RADIUS_OPTIONS, defaultKeywords } from '@/lib/local-map/rules';
import type { Listing } from '@/lib/local-map/types';
import { ApiError, REPORT_PATH, call } from './api';
import { useTurnstile } from './useTurnstile';
import styles from './flow.module.css';

const PinMap = dynamic(() => import('./PinMap'), { ssr: false, loading: () => <div className={styles.pinMap} /> });

type Step = 'search' | 'looking' | 'results' | 'pin' | 'confirm' | 'form';

const US_CENTRE: [number, number] = [39.5, -98.35];

const blankListing = (name: string): Listing => ({
  name,
  address: null,
  cid: null,
  placeId: null,
  lat: null,
  lng: null,
  rating: null,
  reviews: null,
  photos: null,
  category: null,
  additionalCategories: [],
  website: null,
});

const STEPS = ['Find your practice', 'Check the details', 'Where to send it'];
const stepIndex = (s: Step) => (s === 'confirm' ? 1 : s === 'form' ? 2 : 0);

function Summary({ listing, pinned }: { listing: Listing; pinned: boolean }) {
  return (
    <div className={styles.summary}>
      <p className={styles.summaryName}>{listing.name}</p>
      <p className={styles.summaryMeta}>{listing.address ?? (pinned ? 'No public address. The grid is centred on your pin.' : 'No public address')}</p>
      {listing.category || listing.rating ? (
        <p className={styles.summaryMeta}>
          {[listing.category, listing.rating ? `${listing.rating.toFixed(1)} ★${listing.reviews !== null ? ` (${listing.reviews})` : ''}` : null].filter(Boolean).join(' · ')}
        </p>
      ) : null}
    </div>
  );
}

export default function StartFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const practice = (params.get('practice') ?? '').trim();
  const where = (params.get('where') ?? '').trim();

  const [step, setStep] = useState<Step>(practice ? 'looking' : 'search');
  const [error, setError] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [picked, setPicked] = useState<Listing | null>(null);
  const [pin, setPin] = useState<[number, number] | null>(null);
  const [mapCentre, setMapCentre] = useState<[number, number]>(US_CENTRE);
  const [mapZoom, setMapZoom] = useState(4);
  const [centre, setCentre] = useState<{ lat: number; lng: number } | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [sending, setSending] = useState(false);
  const [refine, setRefine] = useState({ practice, where });
  const turnstile = useTurnstile(step === 'form');

  // The hero and closing search boxes arrive here with ?practice=…&where=…: look it up straight away, nothing retyped.
  useEffect(() => {
    setRefine({ practice, where });
    if (!practice) {
      setStep('search');
      return;
    }
    let live = true;
    setStep('looking');
    setError('');
    call<{ listings: Listing[] }>('lookup', { body: { practice, where } })
      .then((data) => {
        if (!live) return;
        setListings(data.listings);
        setStep('results');
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
        setListings([]);
        setStep('results');
      });
    return () => {
      live = false;
    };
  }, [practice, where]);

  const choose = (listing: Listing) => {
    setPicked(listing);
    setKeywords(defaultKeywords(listing.category, listing.additionalCategories));
    setError('');
    if (listing.lat !== null && listing.lng !== null) {
      setCentre({ lat: listing.lat, lng: listing.lng });
      setStep('confirm');
    } else openPin(listing);
  };

  const openPin = (listing: Listing) => {
    setPicked(listing);
    setPin(null);
    setError('');
    setStep('pin');
    setMapCentre(US_CENTRE);
    setMapZoom(4);
    if (where) {
      call<{ lat: number; lng: number }>(`geocode?q=${encodeURIComponent(where)}`)
        .then((g) => {
          setMapCentre([g.lat, g.lng]);
          setMapZoom(13);
        })
        .catch(() => undefined);
    }
  };

  const notListed = () => {
    const blank = blankListing(practice || 'My practice');
    setKeywords(defaultKeywords(null));
    openPin(blank);
  };

  const keywordProblem = useMemo(() => {
    const clean = keywords.map((k) => k.trim().toLowerCase());
    if (clean.length !== KEYWORD_COUNT || clean.some((k) => k.length < 3)) return 'Each search term needs at least three letters.';
    if (new Set(clean).size !== KEYWORD_COUNT) return 'Please use four different search terms.';
    return '';
  }, [keywords]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked || !centre) return;
    setError('');
    const form = new FormData(event.currentTarget);
    if (!turnstile.token) {
      setError('Please finish the check below the form so we know you’re a person.');
      return;
    }
    setSending(true);
    try {
      const out = await call<{ id: string }>('start', {
        body: {
          listing: picked,
          centre,
          keywords: keywords.map((k) => k.trim()),
          radius,
          turnstileToken: turnstile.token,
          company: String(form.get('company') ?? ''),
          lead: { firstName: String(form.get('firstName') ?? ''), email: String(form.get('email') ?? ''), website: String(form.get('website') ?? '') },
        },
      });
      router.push(`${REPORT_PATH}?id=${out.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
      turnstile.reset();
      setSending(false);
    }
  }

  const now = stepIndex(step);

  return (
    <section className={styles.flow}>
      <div className={`container ${styles.flowInner}`}>
        {step !== 'search' && step !== 'looking' ? (
          <ol className={styles.steps} aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} className={i === now ? styles.stepOn : i < now ? styles.stepDone : ''} aria-current={i === now ? 'step' : undefined}>
                <span>{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        ) : null}

        {step === 'search' ? (
          <div className={styles.card}>
            <h1 className={styles.title}>Find your practice</h1>
            <p className={styles.lede}>Enter your practice name and the city or ZIP code you work in. We will find your Google Business Profile.</p>
            <div className={styles.darkBox}>
              <SearchBox primary />
            </div>
          </div>
        ) : null}

        {step === 'looking' ? (
          <div className={styles.card} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true" />
            <h1 className={styles.title}>Looking for {practice}…</h1>
            <p className={styles.lede}>Searching Google Maps{where ? ` near ${where}` : ''}. This takes a few seconds.</p>
          </div>
        ) : null}

        {step === 'results' ? (
          <div className={styles.card}>
            <h1 className={styles.title}>{listings.length ? 'Is one of these your practice?' : 'We could not find a match'}</h1>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            {!error && !listings.length ? <p className={styles.lede}>Try the practice name as it appears on Google, or add a nearby city. If your practice has no public address, you can drop a pin instead.</p> : null}
            {listings.length ? (
              <ul className={styles.results}>
                {listings.map((l) => (
                  <li key={l.cid ?? l.placeId ?? l.name}>
                    <Summary listing={l} pinned={false} />
                    <button type="button" className={styles.pick} onClick={() => choose(l)}>
                      This is my practice
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <form
              className={styles.refine}
              onSubmit={(e) => {
                e.preventDefault();
                router.replace(`${LMA_START_PATH}?${new URLSearchParams({ practice: refine.practice, where: refine.where }).toString()}`);
              }}
            >
              <p className={styles.refineTitle}>Search again</p>
              <div className={styles.refineRow}>
                <label>
                  <span>Practice name</span>
                  <input value={refine.practice} onChange={(e) => setRefine({ ...refine, practice: e.target.value })} autoComplete="organization" />
                </label>
                <label>
                  <span>City or ZIP</span>
                  <input value={refine.where} onChange={(e) => setRefine({ ...refine, where: e.target.value })} autoComplete="postal-code" />
                </label>
                <button type="submit" className={styles.secondary}>Search</button>
              </div>
            </form>
            <button type="button" className={styles.linkButton} onClick={notListed}>
              Not listed, or no public address? Drop a pin instead
            </button>
          </div>
        ) : null}

        {step === 'pin' && picked ? (
          <div className={styles.card}>
            <h1 className={styles.title}>Where should we centre the map?</h1>
            <p className={styles.lede}>
              {picked.cid || picked.placeId
                ? 'Google does not show an address for this listing, so tap the map to place the centre of the area you serve.'
                : 'Tap the map to place the centre of the area you serve. We will check 25 points around it.'}
            </p>
            {!picked.cid && !picked.placeId ? (
              <label className={styles.field}>
                <span>Practice name, as it appears on Google</span>
                <input value={picked.name} onChange={(e) => setPicked({ ...picked, name: e.target.value })} maxLength={150} autoComplete="organization" />
              </label>
            ) : null}
            <PinMap centre={mapCentre} zoom={mapZoom} pin={pin} onPick={(lat, lng) => setPin([lat, lng])} />
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => setStep('results')}>Back</button>
              <button
                type="button"
                className={styles.primary}
                disabled={!pin || picked.name.trim().length < 2}
                onClick={() => {
                  if (!pin) return;
                  setCentre({ lat: pin[0], lng: pin[1] });
                  setStep('confirm');
                }}
              >
                Use this spot
              </button>
            </div>
          </div>
        ) : null}

        {step === 'confirm' && picked && centre ? (
          <div className={styles.card}>
            <h1 className={styles.title}>Check the details before we scan</h1>
            <Summary listing={picked} pinned={picked.lat === null} />

            <fieldset className={styles.group}>
              <legend>The four searches we will check</legend>
              <p className={styles.hint}>We suggested these from your category. Change any of them. There is no need to add “near me”: each point on the map sets the place.</p>
              <div className={styles.keywords}>
                {keywords.map((k, i) => (
                  <input
                    key={i}
                    value={k}
                    maxLength={60}
                    aria-label={`Search term ${i + 1}`}
                    onChange={(e) => setKeywords(keywords.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                ))}
              </div>
              {keywordProblem ? <p className={styles.error} role="alert">{keywordProblem}</p> : null}
            </fieldset>

            <fieldset className={styles.group}>
              <legend>How far around you</legend>
              <div className={styles.radius} role="radiogroup">
                {RADIUS_OPTIONS.map((r) => (
                  <label key={r} className={radius === r ? styles.radiusOn : ''}>
                    <input type="radio" name="radius" checked={radius === r} onChange={() => setRadius(r)} />
                    {r} {r === 1 ? 'mile' : 'miles'}
                  </label>
                ))}
              </div>
              <p className={styles.hint}>We check 25 points spread evenly over this area, for each search term.</p>
            </fieldset>

            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => setStep('results')}>Back</button>
              <button type="button" className={styles.primary} disabled={!!keywordProblem} onClick={() => setStep('form')}>
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 'form' && picked ? (
          <form className={styles.card} onSubmit={submit}>
            <h1 className={styles.title}>Where should we send your report?</h1>
            <p className={styles.lede}>It takes about three minutes. We will email you a link too, so you can come back to your report any time.</p>
            <label className={styles.field}>
              <span>First name</span>
              <input name="firstName" required maxLength={60} autoComplete="given-name" />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input name="email" type="email" required maxLength={200} autoComplete="email" />
            </label>
            <label className={styles.field}>
              <span>Website <em>(optional)</em></span>
              <input name="website" type="text" inputMode="url" maxLength={300} autoComplete="url" placeholder="yourpractice.com" />
            </label>
            {/* A field people leave empty and simple bots fill in. */}
            <label className={styles.trap} aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
            <div ref={turnstile.ref} className={styles.turnstile} />
            {!turnstile.available ? <p className={styles.error}>The security check is not set up on this site yet.</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <p className={styles.hint}>We read only public Google information. We never ask for access to your Google account or any client information, and we will not add you to a mailing list.</p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondary} onClick={() => setStep('confirm')} disabled={sending}>Back</button>
              <button type="submit" className={styles.primary} disabled={sending}>
                {sending ? 'Starting your scan…' : 'Run my report'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
}
