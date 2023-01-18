import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Sicherheit durch Transparenz',
    Svg: require('@site/static/img/shield-tick.svg').default,
    description: (
      <>
        Das Projekt OZGSec fördert ein homogenes Mindest-Niveau von IT-Sicherheit für alle OZG-Komponenten und steht allen Bürgerinnen und Bürgern frei zur Verfügung.
      </>
    ),
  },
  {
    title: 'Offene API',
    Svg: require('@site/static/img/radar.svg').default,
    description: (
      <>
        Die offene JSON-API des Schnelltests kann frei verwendet werden, um beliebige Webseiten auf verschiedene Sicherheitsmaßnahmen hin zu testen.
      </>
    ),
  },
  {
    title: 'Open Source',
    Svg: require('@site/static/img/code-pull-request.svg').default,
    description: (
      <>
        Die Software-Komponenten des Projektes werden Open-Source unter der European Union Public Licence v. 1.2 entwickelt.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
