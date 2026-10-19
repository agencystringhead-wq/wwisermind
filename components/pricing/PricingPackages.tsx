'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import CtaLink from '@/components/booking/CtaLink';
import { CheckIcon } from '@/components/ui/icons';
import {
  pricingEntries,
  pricingGroups,
  type PricingEntry,
  type PricingGroup,
} from '@/lib/pricing';
import { siteConfig } from '@/lib/site';
import PricingLine from './PricingLine';
import styles from './Pricing.module.css';

/** One package. Its own toggle state, so cards open and close independently; the grid's
    `align-items: start` keeps an open card from stretching the ones beside it. */
function PackageCard({ entry }: { entry: PricingEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className={styles.card} id={entry.id}>
      <Image
        src={entry.image.src}
        alt={entry.image.alt}
        width={entry.image.width}
        height={entry.image.height}
        className={styles.cardImage}
        loading="lazy"
        sizes="(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 300px"
      />

      <div className={styles.cardBody}>
        <h4 className={styles.cardName}>{entry.name}</h4>
        <p className={styles.cardText}>{entry.shortDescription}</p>

        {entry.showPrice ? (
          <>
            <PricingLine entry={entry} className={styles.priceRow} />
            <CtaLink href={entry.href} className={styles.cardLink}>
              Learn more <span aria-hidden="true">→</span>
            </CtaLink>
          </>
        ) : (
          <>
            <p className={styles.careText}>Plans and pricing live on their own page</p>
            <CtaLink href={entry.href} className={styles.cardLink}>
              See care plans <span aria-hidden="true">→</span>
            </CtaLink>
          </>
        )}

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          What’s included
          <span className={styles.togglePlus} aria-hidden="true">
            +
          </span>
        </button>

        {open ? (
          <ul className={styles.includes} id={panelId}>
            {entry.includes.map((line) => (
              <li key={line}>
                <CheckIcon />
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

/** Frame 4: every package, in the two groups the Pricing mega menu uses. */
export default function PricingPackages() {
  const groups = Object.keys(pricingGroups) as PricingGroup[];

  return (
    <section className={styles.packages} id="packages">
      <div className="container">
        <header className={styles.packagesHead}>
          <p className={styles.eyebrow}>Packages</p>
          <h2 className={styles.heading}>Or pick exactly what you need</h2>
          <p className={styles.lede}>
            Every package stands on its own, so you only pay for the part of the work you need.
          </p>
        </header>

        {groups.map((group) => (
          <div className={styles.group} key={group}>
            <h3 className={styles.groupLabel}>
              <b>{pricingGroups[group].lead}</b> / {pricingGroups[group].title}
            </h3>
            <ul className={styles.grid}>
              {pricingEntries
                .filter((entry) => entry.group === group)
                .map((entry) => (
                  <PackageCard entry={entry} key={entry.id} />
                ))}
            </ul>
          </div>
        ))}

        <div className={styles.notSure}>
          <p>Not sure which one fits? One free call, an honest plan.</p>
          <CtaLink href={siteConfig.bookingPage} className={styles.textLink}>
            Book a free strategy call <span aria-hidden="true">→</span>
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
