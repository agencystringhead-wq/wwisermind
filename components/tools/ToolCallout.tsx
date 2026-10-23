import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { getTool, type Tool, type ToolId } from '@/lib/tools';
import controls from '@/components/ui/Controls.module.css';
import styles from './ToolCallout.module.css';

type Shared = {
  /** Where on the site this callout sits, as `<page>-<spot>`: "service-local-seo", "contact-pair".
      Written to every button as data-placement. */
  placement: string;
};

type Wide = Shared & {
  variant: 'wide';
  toolId: ToolId;
  /** Replaces the tool's own eyebrow. */
  eyebrow?: string;
};

type Compact = Shared & {
  variant: 'compact';
  /** One card, or a pair side by side. */
  toolIds: [ToolId] | [ToolId, ToolId];
  /** A small heading over the cards. */
  heading?: string;
  /** Replaces the eyebrow of the first card. */
  eyebrow?: string;
};

type Grid = Shared & {
  variant: 'grid';
  toolIds: ToolId[];
};

export type ToolCalloutProps = Wide | Compact | Grid;

/**
 * A free tool, offered in the middle of a page that is about something else. The copy and the
 * route come from lib/tools.ts. Plain server markup with CSS-only hover: nothing moves on
 * arrival, so it is safe anywhere on the page.
 *
 * Every button carries data-tool and data-placement. No analytics script is installed, so
 * nothing listens for them yet; when one is, a single delegated click handler on
 * `a[data-tool]` is all it needs.
 */
export default function ToolCallout(props: ToolCalloutProps) {
  const { placement } = props;

  if (props.variant === 'wide') {
    const tool = getTool(props.toolId);
    return (
      <section className={styles.wideSection} aria-labelledby={`tool-${placement}`}>
        <div className="container">
          <div className={styles.wide}>
            <div className={styles.copy}>
              <p className={styles.eyebrow}>{props.eyebrow ?? tool.eyebrow}</p>
              <h2 className={styles.wideTitle} id={`tool-${placement}`}>
                {tool.title}
              </h2>
              <p className={styles.description}>{tool.description}</p>
            </div>
            <Link
              href={tool.ctaRoute ?? tool.route}
              className={`${controls.buttonBlue} ${styles.button}`}
              data-tool={tool.id}
              data-placement={placement}
            >
              {tool.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ids = props.toolIds;
  const heading = props.variant === 'compact' ? props.heading : undefined;
  const eyebrowOverride = props.variant === 'compact' ? props.eyebrow : undefined;
  const Title = heading || props.variant === 'grid' ? 'h3' : 'h2';
  const single = props.variant === 'compact' && ids.length === 1;

  return (
    <section
      className={styles.cardsSection}
      {...(heading ? { 'aria-labelledby': `tool-${placement}` } : { 'aria-label': 'Free tools' })}
    >
      <div className="container">
        {heading ? (
          <h2 className={styles.heading} id={`tool-${placement}`}>
            {heading}
          </h2>
        ) : null}
        <ul
          className={
            props.variant === 'grid' ? styles.grid : single ? styles.single : styles.pair
          }
        >
          {ids.map((id, index) => {
            const tool: Tool = getTool(id);
            return (
              <li key={id} className={styles.card}>
                <p className={styles.eyebrow}>
                  {index === 0 && eyebrowOverride ? eyebrowOverride : tool.eyebrow}
                </p>
                <Title className={styles.cardTitle}>{tool.title}</Title>
                <p className={styles.description}>{tool.description}</p>
                <Link
                  href={tool.ctaRoute ?? tool.route}
                  className={styles.link}
                  data-tool={tool.id}
                  data-placement={placement}
                >
                  {tool.ctaLabel}
                  <ArrowRightIcon className={styles.arrow} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
