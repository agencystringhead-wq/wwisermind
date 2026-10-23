import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Block, Inline } from '@/lib/blog';
import styles from './Blog.module.css';

/** Inline marks: bold, italic and links. An address on this site is a Next link; anything else
    opens in a new tab with the usual noopener. */
export function renderInline(content: Inline[]): ReactNode[] {
  return content.map((part, i) => {
    if (part.type === 'strong') return <strong key={i}>{part.text}</strong>;
    if (part.type === 'em') return <em key={i}>{part.text}</em>;
    if (part.type === 'link') {
      const internal = part.href.startsWith('/') || part.href.startsWith('#');
      return internal ? (
        <Link href={part.href} key={i}>
          {part.text}
        </Link>
      ) : (
        <a href={part.href} key={i} target="_blank" rel="noopener noreferrer">
          {part.text}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    return part.text;
  });
}

function renderBlocks(blocks: Block[]): ReactNode[] {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'h2':
        return (
          <h2 id={block.id} className={styles.h2} key={i}>
            {block.text}
          </h2>
        );
      case 'h3':
        return (
          <h3 className={styles.h3} key={i}>
            {block.text}
          </h3>
        );
      case 'p':
        return <p key={i}>{renderInline(block.content)}</p>;
      case 'img':
        /* The screenshots are 1200 x 750 (1440 x 900 scaled), so the frame holds that ratio. */
        return (
          <figure className={styles.figure} key={i}>
            <Image
              src={block.src}
              alt={block.alt}
              width={1200}
              height={750}
              sizes="(max-width: 820px) calc(100vw - 40px), 780px"
            />
          </figure>
        );
      case 'quote':
        return (
          <blockquote className={styles.quote} key={i}>
            {renderBlocks(block.blocks)}
          </blockquote>
        );
      case 'checklist':
        return (
          <ul className={styles.checklist} key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      case 'ul':
        return (
          <ul className={styles.ul} key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol className={styles.ol} key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      case 'note':
        return (
          <aside className={styles.note} key={i}>
            {block.title ? <p className={styles.noteTitle}>{block.title}</p> : null}
            {renderBlocks(block.blocks)}
          </aside>
        );
    }
  });
}

/** The words in a block, for finding how far through the post a point falls. */
function weight(block: Block): number {
  const inline = (parts: Inline[]) => parts.reduce((sum, part) => sum + part.text.length, 0);
  switch (block.type) {
    case 'p':
      return inline(block.content);
    case 'h2':
    case 'h3':
      return block.text.length;
    case 'ul':
    case 'ol':
    case 'checklist':
      return block.items.reduce((sum, item) => sum + inline(item), 0);
    case 'quote':
    case 'note':
      return block.blocks.reduce((sum, inner) => sum + weight(inner), 0);
    default:
      return 0;
  }
}

/**
 * Where a callout goes in the body: after the block at about 40% of the words, but only in the
 * gap between two paragraphs, so never inside a list, a note or a quote and never straight after
 * a heading. Takes the paragraph break nearest to 40%. Returns the index of the block it goes
 * after, or -1 when the post has no such break.
 */
export function inlineSlot(blocks: Block[]): number {
  const total = blocks.reduce((sum, block) => sum + weight(block), 0);
  let running = 0;
  let target = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    running += weight(blocks[i]);
    if (running >= total * 0.4) {
      target = i;
      break;
    }
  }
  let best = -1;
  for (let i = 0; i < blocks.length - 1; i += 1) {
    if (blocks[i].type !== 'p' || blocks[i + 1].type !== 'p') continue;
    if (best === -1 || Math.abs(i - target) < Math.abs(best - target)) best = i;
  }
  return best;
}

/** The post's body, from the parsed blocks. The words are the file's, untouched. `inline`, when
    given, is set between two blocks: `after` is the index of the one it follows. */
export default function PostBody({
  blocks,
  inline,
}: {
  blocks: Block[];
  inline?: { after: number; node: ReactNode };
}) {
  if (!inline) return <div className={styles.prose}>{renderBlocks(blocks)}</div>;
  if (inline.after < 0) {
    return (
      <>
        <div className={styles.prose}>{renderBlocks(blocks)}</div>
        {inline.node}
      </>
    );
  }
  const head = blocks.slice(0, inline.after + 1);
  const tail = blocks.slice(inline.after + 1);
  return (
    <>
      <div className={styles.prose}>{renderBlocks(head)}</div>
      {inline.node}
      <div className={styles.prose}>{renderBlocks(tail)}</div>
    </>
  );
}
