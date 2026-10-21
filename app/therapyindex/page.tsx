import type { Metadata } from 'next';
import { getSnapshots } from '@/lib/therapyindex/snapshots';

/* Phase 1 placeholder: plain text only, to prove the snapshots load in the static build. */
export const metadata: Metadata = {
  title: 'Therapy Index',
  robots: { index: false, follow: false },
};

export default function Page() {
  const snapshots = getSnapshots();
  return (
    <main style={{ padding: '4rem 1.5rem', maxWidth: 800, margin: '0 auto' }}>
      <h1>Therapy Index (placeholder)</h1>
      {snapshots.length === 0 && <p>No snapshots yet.</p>}
      {snapshots.map((s) => {
        const top = s.practices.filter((p) => !p.isDirectory).slice(0, 10);
        return (
          <section key={s.market.slug}>
            <h2>
              {s.market.city}, {s.market.stateName} ({s.snapshotDate})
            </h2>
            <p>{s.summary.totalPractices} practices</p>
            <ol>
              {top.map((p) => (
                <li key={p.slug}>
                  {p.name}: {p.visibilityScore}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </main>
  );
}
