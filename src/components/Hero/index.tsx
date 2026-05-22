import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type HeroCta = {
  label: string;
  to: string;
};

export type HeroProps = {
  title: string;
  description: string;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
};

export default function Hero({
  title,
  description,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className={styles.actions}>
          <Link className="button button--primary button--lg" to={primaryCta.to}>
            {primaryCta.label}
          </Link>
          <Link className="button button--secondary button--lg" to={secondaryCta.to}>
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </main>
  );
}
