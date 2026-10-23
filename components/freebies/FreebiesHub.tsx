import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolCallout from '@/components/tools/ToolCallout';
import { serviceIcons } from '@/components/ui/icons';
import { freeToolGroups, type FreeToolItem } from '@/lib/free-tools';
import { ctaLabel, freebiePath, getFreebie, hubCta, hubHero, isLive } from '@/lib/freebies';
import { routes } from '@/lib/routes';
import { isLiveTool, type ToolId } from '@/lib/tools';
import local from '@/components/pricing/LocalSeo.module.css';
import LocalSeoCta from '@/components/pricing/LocalSeoCta';
import styles from './Freebies.module.css';

/** A download's card: the icon, its type, the title, a line, and the link to its page. */
function DownloadCard({ slug }: { slug: string }) {
  const freebie = getFreebie(slug);
  if (!freebie || !isLive(freebie)) return null;
  const Icon = serviceIcons[freebie.icon];

  return (
    <li className={styles.card} key={freebie.slug}>
      <div className={styles.cardTop}>
        <span className={styles.icon}>
          <Icon />
        </span>
        <span className={styles.pill}>{freebie.typeLabel}</span>
      </div>
      <h3 className={styles.cardTitle}>{freebie.title}</h3>
      <p className={styles.cardBody}>{freebie.shortDescription}</p>
      <Link href={freebiePath(freebie)} className={styles.cardLink}>
        {ctaLabel(freebie)} <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

/**
 * The /freebies/ hub, now the one page for everything free: the live tools as the callout cards,
 * the downloads as simple cards, in the same four groups the Free Tools menu has (lib/free-tools).
 * A hidden tool is not listed. Nothing here animates.
 */
export default function FreebiesHub() {
  return (
    <>
      <section className={local.section}>
        <div className={`container ${styles.pageHero}`}>
          <p className={local.eyebrow}>{hubHero.eyebrow}</p>
          <h1 className={local.heroTitle}>{hubHero.title}</h1>
          <p className={`${local.heroSub} ${styles.lede}`}>{hubHero.sub}</p>
        </div>
      </section>

      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Free Tools', href: routes.freebies.hub },
        ]}
      />

      <section className={local.sectionGrey}>
        <div className={`container ${styles.groups}`}>
          {freeToolGroups.map((group) => {
            const toolIds = group.items.flatMap((item: FreeToolItem) =>
              item.kind === 'tool' && isLiveTool(item.id) ? [item.id as ToolId] : [],
            );
            const downloads = group.items.flatMap((item: FreeToolItem) =>
              item.kind === 'download' ? [item.slug] : [],
            );
            if (toolIds.length === 0 && downloads.length === 0) return null;

            const cards = downloads.map((slug) => <DownloadCard slug={slug} key={slug} />);

            return (
              <section className={styles.group} key={group.title} aria-label={group.title}>
                <h2 className={styles.groupLabel}>
                  <b>{group.lead}</b> / {group.title}
                </h2>
                {toolIds.length > 0 ? (
                  <ToolCallout
                    variant="grid"
                    toolIds={toolIds}
                    placement="hub"
                    flush
                    extra={cards}
                  />
                ) : (
                  <ul className={styles.grid}>{cards}</ul>
                )}
              </section>
            );
          })}
        </div>
      </section>

      <LocalSeoCta cta={{ ...hubCta, button: hubCta.button }} />
    </>
  );
}
