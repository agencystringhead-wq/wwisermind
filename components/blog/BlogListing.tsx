import { routes } from '@/lib/routes';
import Link from 'next/link';
import { getCategories, type BlogPost } from '@/lib/blog';
import ContactHero from '@/components/sections/ContactHero';
import Reveal from '@/components/ui/Reveal';
import section from '@/components/services/Section.module.css';
import BlogCard from './BlogCard';
import styles from './Blog.module.css';

/** The topic links under the hero: All, then each category with its count. */
function Topics({ current }: { current: string | null }) {
  const categories = getCategories();
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <nav className={styles.topics} aria-label="Blog topics">
      <Link
        href={routes.blog}
        className={`${styles.topic} ${current === null ? styles.topicOn : ''}`}
        aria-current={current === null ? 'page' : undefined}
      >
        All<span className={styles.topicCount}>{total}</span>
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={routes.blogCategory(category.slug)}
          className={`${styles.topic} ${current === category.slug ? styles.topicOn : ''}`}
          aria-current={current === category.slug ? 'page' : undefined}
        >
          {category.name}
          <span className={styles.topicCount}>{category.count}</span>
        </Link>
      ))}
    </nav>
  );
}

function Grid({ posts }: { posts: BlogPost[] }) {
  return (
    <Reveal as="ul" className={styles.grid}>
      {posts.map((post, i) => (
        <li key={post.slug} data-reveal={String(Math.min(i, 4))}>
          <BlogCard post={post} />
        </li>
      ))}
    </Reveal>
  );
}

/**
 * The blog index and the category pages share one layout: the dark hero, then the topic links
 * and the lead post on white, then the rest on the soft blue-grey tint. A category page has no
 * lead post, only the grid. The frame above the footer's dark CTA is always light.
 */
export default function BlogListing({
  eyebrow,
  heading,
  lead,
  posts,
  leadPost,
  currentCategory,
}: {
  eyebrow: string;
  heading: string;
  lead: string;
  posts: BlogPost[];
  leadPost?: BlogPost;
  currentCategory: string | null;
}) {
  const rest = leadPost ? posts.filter((post) => post.slug !== leadPost.slug) : posts;

  return (
    <>
      <ContactHero
        hero={{
          eyebrow,
          heading,
          lead,
          primary: { label: 'Book a free call', href: routes.contactBook },
        }}
        tabs={null}
        overlap={false}
      />

      <section className={`${section.section} ${section.light} ${styles.listTop}`}>
        <div className="container">
          <Topics current={currentCategory} />
          {leadPost ? (
            <Reveal as="div" className={styles.leadWrap}>
              <div data-reveal="0">
                <BlogCard post={leadPost} lead />
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {rest.length > 0 ? (
        <section className={`${section.section} ${styles.tint}`}>
          <div className="container">
            <p className={section.eyebrow}>{leadPost ? 'More articles' : 'Articles'}</p>
            <Grid posts={rest} />
          </div>
        </section>
      ) : null}
    </>
  );
}
