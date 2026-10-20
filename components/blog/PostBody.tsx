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

/** The post's body, from the parsed blocks. The words are the file's, untouched. */
export default function PostBody({ blocks }: { blocks: Block[] }) {
  return <div className={styles.prose}>{renderBlocks(blocks)}</div>;
}
