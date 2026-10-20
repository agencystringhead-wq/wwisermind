import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import Accordion from '@/components/ui/Accordion';
import { routes } from '@/lib/routes';
import { FORM_ID, referFaq, referHero, referRewards, referSteps } from '@/lib/refer';
import ReferForm from './ReferForm';
import styles from './Refer.module.css';

/**
 * /refer-wwisermind/: a light hero, a three-step strip, the reward cards, a short FAQ in the
 * site's numbered accordion, then the referral form. The header, footer and floating contact
 * bar come from the root layout. Nothing animates on entrance.
 */
export default function ReferPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Refer wwisermind', href: routes.refer },
        ]}
      />

      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>{referHero.eyebrow}</p>
          <h1 className={styles.title}>{referHero.heading}</h1>
          <p className={styles.sub}>{referHero.sub}</p>
          <a href={referHero.button.href} className={styles.primary}>
            {referHero.button.label}
          </a>
        </div>
      </section>

      <section className={styles.steps} aria-label="How it works">
        <ol className={`container ${styles.stepList}`}>
          {referSteps.map((step, index) => (
            <li className={styles.step} key={step.title}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.rewards} aria-label="Rewards">
        <div className={`container ${styles.rewardGrid}`}>
          {referRewards.map((reward) => (
            <div className={styles.reward} key={reward.title}>
              <h2 className={styles.rewardTitle}>{reward.title}</h2>
              <p>{reward.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="refer-faq">
        <div className={`container ${styles.faqInner}`}>
          <h2 className={styles.faqHeading} id="refer-faq">
            Questions
          </h2>
          <Accordion items={referFaq} numbered />
        </div>
      </section>

      <ReferForm id={FORM_ID} />
    </>
  );
}
