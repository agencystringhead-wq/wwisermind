'use client';

import { useState } from 'react';
import { CheckIcon } from '@/components/ui/icons';
import type { PlanId } from '@/lib/pricing/care-plans';
import local from './LocalSeo.module.css';
import styles from './CarePlans.module.css';

type Cell = boolean | string;

type Group = { title: string; features: { id: string; label: string; values: Cell[] }[] };

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function CellMark({ cell }: { cell: Cell }) {
  if (cell === true) {
    return (
      <span className={styles.tick}>
        <CheckIcon />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (cell === false) {
    return (
      <span className={styles.cross}>
        <CrossIcon />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <>{cell}</>;
}

/** The plan comparison table, built from the same plan data as the cards. From 768px it is
    a real table with the featured plan tinted. Below that the table is hidden and a segmented
    control picks one plan at a time, listed as plain description lists, so nothing scrolls
    sideways. Both views are in the markup; CSS shows one. */
export default function CarePlansCompare({
  copy,
  plans,
  groups,
}: {
  copy: { title: string };
  plans: { id: PlanId; name: string; featured: boolean }[];
  groups: Group[];
}) {
  const [active, setActive] = useState(Math.max(0, plans.findIndex((plan) => plan.featured)));

  return (
    <section className={local.section}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
        </header>

        <div className={styles.compareWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Feature</span>
                </th>
                {plans.map((plan) => (
                  <th
                    scope="col"
                    className={plan.featured ? styles.plusCol : undefined}
                    key={plan.id}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.title}>
                <tr className={styles.groupRow}>
                  <th scope="colgroup" colSpan={plans.length + 1}>
                    {group.title}
                  </th>
                </tr>
                {group.features.map((feature) => (
                  <tr key={feature.id}>
                    <th scope="row">{feature.label}</th>
                    {feature.values.map((cell, index) => (
                      <td
                        className={plans[index].featured ? styles.plusCol : undefined}
                        key={plans[index].id}
                      >
                        <CellMark cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          <div className={styles.switcher}>
            <div className={styles.switch} role="group" aria-label="Choose a plan to view">
              {plans.map((plan, index) => (
                <button
                  type="button"
                  className={styles.switchButton}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                  key={plan.id}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.mobile} aria-live="polite">
            <div className={styles.mobileList}>
              {groups.map((group) => (
                <dl key={group.title}>
                  <p className={styles.mobileGroup}>{group.title}</p>
                  {group.features.map((feature) => (
                    <div className={styles.mobileRow} key={feature.id}>
                      <dt>{feature.label}</dt>
                      <dd>
                        <CellMark cell={feature.values[active]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
