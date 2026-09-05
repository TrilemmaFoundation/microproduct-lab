import clsx from 'clsx';
import Heading from '@theme/Heading';
import type { ReactNode } from 'react';
import styles from './styles.module.css';

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'hero';
  className?: string;
};

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  variant = 'default',
  className,
}: SectionProps) {
  return (
    <section
      className={clsx(
        styles.section,
        variant === 'hero' && styles.sectionHero,
        className,
      )}
    >
      <div className={styles.sectionHeader}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <Heading as={variant === 'hero' ? 'h1' : 'h2'} className={styles.sectionTitle}>
          {title}
        </Heading>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
