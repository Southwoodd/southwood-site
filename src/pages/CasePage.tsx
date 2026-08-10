import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OpenLeadCta from '../components/OpenLeadCta';
import ScrambleButton from '../components/ScrambleButton';
import ScrambleLink from '../components/ScrambleLink';
import { content } from '../data/content.js';
import { fadeUp, staggerContainer } from '../motion/presets';
import './CasePage.css';

type CaseFeature = {
  title: string;
  text: string;
};

type CaseBody = {
  tag: string;
  title: string;
  result: string;
  context: string;
  problem?: string;
  done: string[];
  features?: CaseFeature[];
  stack?: string[];
  outcome: string;
  term: string;
  linkLabel?: string;
  linkHref?: string;
};

export default function CasePage() {
  const { slug = '' } = useParams();
  const pages = content.casePages as Record<string, CaseBody>;
  const ui = content.casePageUi;
  const page = pages[slug];
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const prev = document.title;
    if (page) {
      document.title = `${page.title} — кейс Southwood`;
    } else {
      document.title = 'Кейс не найден — Southwood';
    }
    return () => {
      document.title = prev;
    };
  }, [page]);

  if (!page) {
    return (
      <>
        <Header />
        <main className="case-page">
          <div className="container case-page__missing">
            <h1>{ui.notFoundTitle}</h1>
            <p>{ui.notFoundText}</p>
            <ScrambleLink className="btn btn--primary" to={ui.backHref}>
              {ui.backLabel}
            </ScrambleLink>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  let step = 0;
  const nextStep = () => {
    step += 1;
    return String(step).padStart(2, '0');
  };

  return (
    <>
      <Header />
      <main className="case-page">
        <div className="container case-page__shell">
          <motion.div
            className="case-page__layout"
            variants={staggerContainer(0.07, 0.03)}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            <motion.p className="case-page__back" variants={fadeUp}>
              <Link to={ui.backHref}>← {ui.backLabel}</Link>
            </motion.p>

            <motion.header className="case-hero" variants={fadeUp}>
              <p className="label case-hero__tag">/ {page.tag}</p>
              <h1 className="case-hero__title">{page.title}</h1>
              <p className="case-hero__result">{page.result}</p>
              <div className="case-hero__meta">
                <span className="case-hero__chip">
                  <span className="case-hero__chip-k">{ui.termLabel}</span>
                  <span className="case-hero__chip-v">{page.term}</span>
                </span>
                {page.linkHref && page.linkLabel ? (
                  <a
                    className="case-hero__link"
                    href={page.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {page.linkLabel} →
                  </a>
                ) : null}
              </div>
            </motion.header>

            <div className="case-page__blocks">
              <motion.section className="case-panel" variants={fadeUp}>
                <header className="case-panel__head">
                  <span className="case-panel__num">{nextStep()}</span>
                  <h2 className="case-panel__title">{ui.contextLabel}</h2>
                </header>
                <p className="case-panel__text">{page.context}</p>
              </motion.section>

              {page.problem ? (
                <motion.section className="case-panel" variants={fadeUp}>
                  <header className="case-panel__head">
                    <span className="case-panel__num">{nextStep()}</span>
                    <h2 className="case-panel__title">{ui.problemLabel}</h2>
                  </header>
                  <p className="case-panel__text">{page.problem}</p>
                </motion.section>
              ) : null}

              <motion.section className="case-panel" variants={fadeUp}>
                <header className="case-panel__head">
                  <span className="case-panel__num">{nextStep()}</span>
                  <h2 className="case-panel__title">{ui.doneLabel}</h2>
                </header>
                <ol className="case-panel__steps">
                  {page.done.map((item, i) => (
                    <li key={item}>
                      <span className="case-panel__step-i" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </motion.section>

              {page.features?.length ? (
                <motion.section className="case-panel" variants={fadeUp}>
                  <header className="case-panel__head">
                    <span className="case-panel__num">{nextStep()}</span>
                    <h2 className="case-panel__title">{ui.featuresLabel}</h2>
                  </header>
                  <ul className="case-panel__features">
                    {page.features.map((f) => (
                      <li key={f.title} className="case-feature">
                        <h3 className="case-feature__title">{f.title}</h3>
                        <p className="case-feature__text">{f.text}</p>
                      </li>
                    ))}
                  </ul>
                </motion.section>
              ) : null}

              {page.stack?.length ? (
                <motion.section className="case-panel" variants={fadeUp}>
                  <header className="case-panel__head">
                    <span className="case-panel__num">{nextStep()}</span>
                    <h2 className="case-panel__title">{ui.stackLabel}</h2>
                  </header>
                  <ul className="case-panel__stack">
                    {page.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </motion.section>
              ) : null}

              <motion.section
                className="case-panel case-panel--outcome"
                variants={fadeUp}
              >
                <header className="case-panel__head">
                  <span className="case-panel__num">{nextStep()}</span>
                  <h2 className="case-panel__title">{ui.outcomeLabel}</h2>
                </header>
                <p className="case-panel__text case-panel__text--strong">
                  {page.outcome}
                </p>
              </motion.section>
            </div>

            <motion.div className="case-page__cta" variants={fadeUp}>
              <OpenLeadCta className="btn btn--primary">
                {ui.ctaPrimary}
              </OpenLeadCta>
              <ScrambleButton
                className="btn btn--ghost"
                href={ui.ctaTelegramHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ui.ctaTelegram}
              </ScrambleButton>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
