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

const translateTime = (time: "low" | "medium" | "high") => {
  switch (time) {
    case "low":
      return {
        str: "Gering (< 5 PT)", className: "green"
      };
    case "medium":
      return {
        str: "Mittel (50 PT)", className: "yellow"
      };
    case "high":
      return {
        str: "Hoch (> 100 PT)", className: "box-red"
      };
  }
}

const translateHardware = (hardware: boolean) => {
  if (hardware) {
    return {
      str: "Hardware benötigt", className: "box-red"
    };
  }
  return {
    str: "Ohne neue Hardware", className: "green"
  };
}

export const Details = ({ refs, implementation, time, hardware }) => {
  return (
    <div className='details'>
      <ResourceEstimation time={time} hardware={hardware} />
      <Refs refs={refs} />
      <Implementation implementation={implementation} />
    </div>
  )
}

export const Refs = ({ refs }) => {
  return (
    <div className='refs group'>
      <span className='title'>Referenzen</span>
      <div className='row1 items-start'>
        <img width={35} src='/img/refs.svg' alt='Referenz-Icon' />
        <div className='col1'>
          {refs.map(({ name, link }) => (
            <div key={name}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </a>
            </div>
          )
          )}
        </div>
      </div>
    </div>
  )
}

export const Implementation = ({ implementation }) => {
  return (
    <div className='group'>
      <span className='title'>Implementierung</span>
      <div className='row1 items-start'>
        <img width={45} src='/img/implementation.svg' alt='Implementierung-Icon' />
        <span>{implementation}</span>
      </div>
    </div>
  )
}


export const ResourceEstimation = ({ time, hardware }) => {
  const timeObj = translateTime(time);
  const hardwareObj = translateHardware(hardware);
  return (
    <div className='group'>
      <span className='title'>Ressourcenabschätzung</span>
      <div className='row1'>
        <div className={"box " + timeObj.className}></div>
        <span>{timeObj.str}</span>
      </div>
      <div className='row1'>
        <div className={"box " + hardwareObj.className}></div>
        <span>{hardwareObj.str}</span>
      </div>
    </div>
  )
};
