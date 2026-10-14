import { routes } from '@/lib/routes';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, type BlogPost } from '@/lib/blog';
import hover from '@/components/ui/MediaHover.module.css';
import styles from './Blog.module.css';

/**
 * One post as a card: the picture with the site's hover (the contained 1.04 zoom and the
 * diagonal light sweep), then the category, title, excerpt and date. The whole card is the
 * link. `lead` is the larger layout the index opens with.
 */
export default function BlogCard({ post, lead = false }: { post: BlogPost; lead?: boolean }) {
  return (
    <article className={lead ? styles.lead : styles.card}>
      <Link href={routes.blogPost(post.slug)} className={styles.cardLink}>
        <span className={`${styles.cardImage} ${hover.frame}`}>
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes={lead ? '(max-width: 1023px) 100vw, 640px' : '(max-width: 1023px) 100vw, 420px'}
            priority={lead}
          />
          <span className={hover.shine} aria-hidden="true" />
        </span>

        <span className={styles.cardBody}>
          <span className={styles.cardCategory}>{post.category}</span>
          <span className={lead ? styles.leadTitle : styles.cardTitle}>{post.title}</span>
          <span className={styles.cardExcerpt}>{post.excerpt}</span>
          <span className={styles.cardMeta}>
            {formatDate(post.publishedAt)}
            <span aria-hidden="true"> · </span>
            {post.readingMinutes} min read
          </span>
          {lead ? (
            <span className={styles.leadMore}>
              Read the article<span aria-hidden="true"> →</span>
            </span>
          ) : null}
        </span>
      </Link>
    </article>
  );
}
