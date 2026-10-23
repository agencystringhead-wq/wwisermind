import { routes } from '@/lib/routes';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate, relatedPosts, type BlogPost, type Inline } from '@/lib/blog';
import { siteConfig } from '@/lib/site';
import Reveal from '@/components/ui/Reveal';
import ToolCallout from '@/components/tools/ToolCallout';
import section from '@/components/services/Section.module.css';
import BlogCard from './BlogCard';
import PostBody, { inlineSlot, renderInline } from './PostBody';
import styles from './Blog.module.css';

/** An absolute address for a path on this site, for the structured data. */
const abs = (path: string) => `${siteConfig.url}${path}`;

/** The plain words of an answer, for the FAQPage data. */
const plain = (content: Inline[]) => content.map((part) => part.text).join('');

/**
 * One article. Light all the way down: the header with the breadcrumb, byline and plain tag
 * labels; the picture with its credit; a narrow reading column (the key takeaways, the body,
 * the sources); then up to three more articles on the soft tint, above the footer's CTA.
 *
 * The page carries BlogPosting and BreadcrumbList JSON-LD, built from the same fields the
 * page prints, and FAQPage JSON-LD when the post ends with a "Frequently asked questions"
 * section, drawn between the body and the sources. No review or rating markup is written anywhere.
 */
export default function BlogPostPage({ post }: { post: BlogPost }) {
  const url = abs(routes.blogPost(post.slug));
  const more = relatedPosts(post, 3);
  const updated = post.updatedAt !== post.publishedAt;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      headline: post.title,
      description: post.description,
      image: [abs(post.image)],
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      articleSection: post.category,
      keywords: post.tags.join(', '),
      author: { '@type': 'Person', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'wwisermind',
        url: siteConfig.url,
        logo: { '@type': 'ImageObject', url: abs('/images/wwisermind-official-logo.webp') },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: abs(routes.home) },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: abs(routes.blog) },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.category,
          item: abs(routes.blogCategory(post.categorySlug)),
        },
        { '@type': 'ListItem', position: 4, name: post.title, item: url },
      ],
    },
    ...(post.faq.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: plain(item.answer) },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />

      <article>
        <header className={styles.postHeader}>
          <div className="container">
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={routes.home}>Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={routes.blog}>Blog</Link>
              <span aria-hidden="true">/</span>
              <Link href={routes.blogCategory(post.categorySlug)}>{post.category}</Link>
            </nav>

            <h1 className={styles.postTitle}>{post.title}</h1>
            <p className={styles.postExcerpt}>{post.excerpt}</p>

            <p className={styles.byline}>
              <span className={styles.author}>{post.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              {updated ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </p>

            {post.tags.length > 0 ? (
              <ul className={styles.tags} aria-label="Topics in this article">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </header>

        <div className="container">
          <figure className={styles.hero}>
            <div className={styles.heroFrame}>
              <Image
                src={post.image}
                alt={post.imageAlt}
                fill
                sizes="(max-width: 1340px) calc(100vw - 40px), 1300px"
                priority
              />
            </div>
            {post.imageCredit ? (
              <figcaption className={styles.credit}>
                Photo:{' '}
                {post.imageCreditUrl ? (
                  <a href={post.imageCreditUrl} target="_blank" rel="noopener noreferrer">
                    {post.imageCredit}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  post.imageCredit
                )}
              </figcaption>
            ) : null}
          </figure>
        </div>

        <div className={`container ${styles.reading}`}>
          {post.takeaways.length > 0 ? (
            <Reveal as="div" className={styles.takeaways}>
              <p className={styles.takeawaysLabel} data-reveal="0">
                Key takeaways
              </p>
              <ul className={styles.takeawayList} data-reveal="1">
                {post.takeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          <PostBody
            blocks={post.body}
            inline={
              post.relatedTool
                ? {
                    after: inlineSlot(post.body),
                    node: (
                      <ToolCallout variant="inline" toolId={post.relatedTool} placement="blog-inline" />
                    ),
                  }
                : undefined
            }
          />

          {post.faq.length > 0 ? (
            <section className={`${styles.faq} ${styles.prose}`} aria-labelledby="faq-heading">
              <h2 className={styles.h2} id="faq-heading">
                Frequently asked questions
              </h2>
              <div className={styles.faqList}>
                {post.faq.map((item) => (
                  <details className={styles.faqItem} key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{renderInline(item.answer)}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {post.sources.length > 0 ? (
            <section className={styles.sources} aria-labelledby="sources-heading">
              <h2 className={styles.sourcesLabel} id="sources-heading">
                Sources
              </h2>
              <ul>
                {post.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

      </article>

      {more.length > 0 ? (
        <section className={`${section.section} ${styles.tint}`}>
          <div className="container">
            <p className={section.eyebrow}>Keep reading</p>
            <Reveal as="ul" className={styles.grid}>
              {more.map((item, i) => (
                <li key={item.slug} data-reveal={String(Math.min(i, 4))}>
                  <BlogCard post={item} />
                </li>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}
