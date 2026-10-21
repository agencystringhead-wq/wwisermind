import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  CRISIS_SECTIONS,
  formatVerifiedDate,
  getListedNationalResources,
  getLocalHelp,
  getStateGroups,
  getStatesWithData,
  safeHref,
  type CrisisResource,
  type CrisisState,
  type LocalHelpResource,
  type StateGroups,
} from '@/lib/crisis-resources';
import { routes } from '@/lib/routes';
import { footerMain } from '@/lib/site';
import JumpLinks from './JumpLinks';
import QuickExit from './QuickExit';
import styles from './CrisisResources.module.css';

/**
 * The public helpline directory, read from lib/crisis-resources.json through the helpers. Used
 * for /tools/crisis-resources/ and, with a `state`, for each state page.
 *
 * The first thing on the page is the emergency banner, static and high contrast, with a large
 * tap target for 988. There is no hero image, no video and nothing that animates. Every button
 * is a real link (tel:, sms: or https:) at least 44px tall with an accessible name that starts
 * with its visible label.
 */

const EMERGENCY_COPY = 'If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.';

function EmergencyBanner() {
  return (
    <section className={styles.emergency} aria-labelledby="crisis-emergency">
      <div className={`container ${styles.emergencyInner}`}>
        <p className={styles.emergencyText} id="crisis-emergency">
          {EMERGENCY_COPY}
        </p>
        <a
          className={styles.emergencyButton}
          href="tel:988"
          aria-label="Call or text 988, the Suicide & Crisis Lifeline"
        >
          Call or text 988
        </a>
      </div>
    </section>
  );
}

type CardHeading = 'h3' | 'h4' | 'h5';

function ResourceCard({
  resource,
  level: Title = 'h3',
}: {
  resource: CrisisResource;
  level?: CardHeading;
}) {
  const { name } = resource;
  const details = [resource.tty, resource.languages, resource.notes].filter(Boolean) as string[];
  const callHref = safeHref(resource.callHref, 'tel:');
  const textHref = safeHref(resource.textHref, 'sms:');
  const chatUrl = safeHref(resource.chatUrl, 'https://');
  const sourceUrl = safeHref(resource.source, 'https://');
  const hasAction = (callHref && resource.call) || (textHref && resource.text) || chatUrl;

  return (
    <li className={styles.card}>
      <Title className={styles.cardTitle}>{name}</Title>
      <p className={styles.audience}>{resource.audience}</p>
      {resource.hours ? (
        <p className={styles.hours}>
          <span className={styles.hoursLabel}>Hours</span> {resource.hours}
        </p>
      ) : null}
      {details.length > 0 ? (
        <ul className={styles.details}>
          {details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      {hasAction ? (
        <ul className={styles.actions} aria-label={`Ways to reach ${name}`}>
          {callHref && resource.call ? (
            <li>
              <a
                className={styles.button}
                href={callHref}
                aria-label={`Call ${resource.call}: ${name}`}
              >
                Call {resource.call}
              </a>
            </li>
          ) : null}
          {textHref && resource.text ? (
            <li>
              <a
                className={styles.button}
                href={textHref}
                aria-label={`${resource.text}: ${name}`}
              >
                {resource.text}
              </a>
            </li>
          ) : null}
          {chatUrl ? (
            <li>
              <a
                className={styles.button}
                href={chatUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${resource.chatLabel ?? 'Chat online'}: ${name} (opens in a new tab)`}
              >
                {resource.chatLabel ?? 'Chat online'}
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
      {sourceUrl ? (
        <a className={styles.source} href={sourceUrl} target="_blank" rel="noopener noreferrer">
          Official source<span className="sr-only"> for {name} (opens in a new tab)</span>
        </a>
      ) : null}
    </li>
  );
}

/** The card at the top of "By county": where the state publishes every county's own crisis line. */
function LookupCard({ resource }: { resource: CrisisResource }) {
  const href = safeHref(resource.chatUrl, 'https://');
  return (
    <li className={styles.card}>
      <h4 className={styles.cardTitle}>{`Don't see your county? ${resource.name}`}</h4>
      <p className={styles.audience}>{resource.audience}</p>
      {href ? (
        <ul className={styles.actions} aria-label={`Ways to reach ${resource.name}`}>
          <li>
            <a className={styles.button} href={href} target="_blank" rel="noopener noreferrer">
              {resource.chatLabel ?? resource.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      ) : null}
    </li>
  );
}

/** A state's own resources: the statewide ones first, then "By county" with the lookup page at its top
    and a group for each area, then (drawn by the page) the national list. */
function StateResources({ groups }: { groups: StateGroups }) {
  const { statewide, lookup, byArea } = groups;
  const hasCounties = Boolean(lookup) || byArea.length > 0;

  return (
    <>
      {statewide.length > 0 ? (
        <>
          {hasCounties ? <h3 className={styles.areaTitle}>Statewide</h3> : null}
          <ul className={styles.grid}>
            {statewide.map((resource) => (
              <ResourceCard resource={resource} level={hasCounties ? 'h4' : 'h3'} key={resource.id} />
            ))}
          </ul>
        </>
      ) : null}

      {hasCounties ? (
        <>
          <h3 className={styles.areaTitle}>By county</h3>
          {lookup ? (
            <ul className={styles.grid}>
              <LookupCard resource={lookup} />
            </ul>
          ) : null}
          {byArea.map((group) => (
            <div key={group.area}>
              <h4 className={styles.areaName}>{group.area}</h4>
              <ul className={styles.grid}>
                {group.items.map((resource) => (
                  <ResourceCard resource={resource} level="h5" key={resource.id} />
                ))}
              </ul>
            </div>
          ))}
        </>
      ) : null}
    </>
  );
}

/** A directory that points to local help: its audience, a call button when it has a number, and its
    main link. Drawn like a resource card, with no hours because a directory has none of its own. */
function LocalHelpCard({ resource }: { resource: LocalHelpResource }) {
  const { name } = resource;
  const callHref = safeHref(resource.callHref, 'tel:');
  const linkHref = safeHref(resource.link.href, 'https://');

  return (
    <li className={styles.card}>
      <h3 className={styles.cardTitle}>{name}</h3>
      <p className={styles.audience}>{resource.audience}</p>
      {callHref && resource.call ? (
        <ul className={styles.actions} aria-label={`Ways to reach ${name}`}>
          <li>
            <a className={styles.button} href={callHref} aria-label={`Call ${resource.call}: ${name}`}>
              Call {resource.call}
            </a>
          </li>
        </ul>
      ) : null}
      {linkHref ? (
        <a className={styles.textLink} href={linkHref} target="_blank" rel="noopener noreferrer">
          {resource.link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : null}
    </li>
  );
}

function NationalSections({ headingLevel }: { headingLevel: 'h2' | 'h3' }) {
  const national = getListedNationalResources();
  const Heading = headingLevel;

  return (
    <>
      {CRISIS_SECTIONS.map((section) => {
        const items = national.filter((resource) => section.categories.includes(resource.category));
        if (items.length === 0) return null;
        return (
          <section
            className={styles.group}
            id={section.id}
            key={section.id}
            aria-labelledby={`crisis-${section.id}`}
          >
            <Heading className={styles.groupTitle} id={`crisis-${section.id}`}>
              {section.title}
            </Heading>
            <ul className={styles.grid}>
              {items.map((resource) => (
                <ResourceCard resource={resource} key={resource.id} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function ForTherapists() {
  return (
    <section className={styles.therapists} aria-labelledby="crisis-therapists">
      <div className="container">
        <div className={styles.therapistsInner}>
          <h2 className={styles.therapistsTitle} id="crisis-therapists">
            For therapists
          </h2>
          <p className={styles.therapistsBody}>
            You can add these resources to your own practice website for free with the help now
            widget. We keep the numbers current, so you do not have to.
          </p>
          <Link href={routes.tools.helpNowWidget} className={styles.therapistsButton}>
            Add the help now widget to your site
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footnote() {
  const email = footerMain.contact.email;
  return (
    <p className={styles.footnote}>
      Last verified: {formatVerifiedDate()}. Each resource links to its official source. wwisermind
      is not a crisis service and does not answer calls. Spotted something out of date?{' '}
      <a href={email.href}>Email us</a>.
    </p>
  );
}

export default function CrisisResourcesPage({ state }: { state?: CrisisState }) {
  const stateGroups = state ? getStateGroups(state.code) : null;
  const states = getStatesWithData();
  const localHelp = getLocalHelp();
  const listed = getListedNationalResources();
  const jumpItems = [
    ...CRISIS_SECTIONS.filter((section) =>
      listed.some((resource) => section.categories.includes(resource.category)),
    ).map((section) => ({ id: section.id, label: section.jump })),
    { id: 'your-state', label: 'Your state' },
  ];
  const trail = [
    { label: 'Home', href: routes.home },
    { label: 'Crisis Resources by State', href: routes.tools.crisisResources },
    ...(state ? [{ label: state.name, href: routes.crisisState(state.slug) }] : []),
  ];

  return (
    <>
      <QuickExit />
      <EmergencyBanner />

      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            {state ? `Crisis Resources in ${state.name}` : 'Crisis Resources by State'}
          </h1>
          <p className={styles.intro}>
            {state
              ? `Free, confidential helplines for people in ${state.name}, with the national lines below. Each one was checked against its official source.`
              : 'Free, confidential US helplines, organized by what you need and checked against their official sources.'}
          </p>
          <JumpLinks items={jumpItems} />
          <p className={styles.leaveNote}>
            Need to leave quickly? Press Esc or use the Leave this site button. It won't clear your
            browser history.
          </p>
        </div>
      </section>

      <Breadcrumbs trail={trail} />

      <div className={`container ${styles.content} ${state ? '' : styles.contentBeforeBand}`}>
        {state ? (
          <section className={styles.group} id="your-state" aria-labelledby="crisis-state">
            <h2 className={styles.groupTitle} id="crisis-state">
              {state.name} resources
            </h2>
            {stateGroups ? <StateResources groups={stateGroups} /> : null}
          </section>
        ) : null}

        {state ? (
          <h2 className={styles.nationalTitle}>National resources</h2>
        ) : null}
        <NationalSections headingLevel={state ? 'h3' : 'h2'} />

        {state ? null : (
          <section className={styles.group} id="your-state" aria-labelledby="crisis-states">
            <h2 className={styles.groupTitle} id="crisis-states">
              Find resources in your state
            </h2>
            {states.length > 0 ? (
              <ul className={styles.stateList}>
                {states.map((item) => (
                  <li key={item.code}>
                    <Link href={routes.crisisState(item.slug)} className={styles.stateLink}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.body}>State and local resources are being added state by state.</p>
            )}
            {localHelp.length > 0 ? (
              <ul className={`${styles.grid} ${styles.localHelp}`}>
                {localHelp.map((resource) => (
                  <LocalHelpCard resource={resource} key={resource.id} />
                ))}
              </ul>
            ) : null}
          </section>
        )}

        {state ? <Footnote /> : null}
      </div>

      {state ? null : (
        <>
          <ForTherapists />
          <div className={`container ${styles.afterBand}`}>
            <Footnote />
          </div>
        </>
      )}
    </>
  );
}
