import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrambleButton from '../components/ScrambleButton';
import { content } from '../data/content.js';
import { fadeUp, staggerContainer } from '../motion/presets';
import './CasePage.css';

type CaseBody = {
  tag: string;
  title: string;
  result: string;
  context: string;
  done: string[];
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
            <Link className="btn btn--primary" to={ui.backHref}>
              {ui.backLabel}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="case-page">
        <div className="container case-page__layout">
          <motion.div
            variants={staggerContainer(0.08, 0.04)}
            initial={reduce ? false : 'hidden'}
            animate="show"
          >
            <motion.p className="case-page__back" variants={fadeUp}>
              <Link to={ui.backHref}>{ui.backLabel}</Link>
            </motion.p>

            <motion.p className="label case-page__tag" variants={fadeUp}>
              / {page.tag}
            </motion.p>

            <motion.h1 className="case-page__title" variants={fadeUp}>
              {page.title}
            </motion.h1>

            <motion.p className="case-page__result" variants={fadeUp}>
              {page.result}
            </motion.p>

            <motion.section className="case-block" variants={fadeUp}>
              <h2 className="case-block__label">{ui.contextLabel}</h2>
              <p className="case-block__text">{page.context}</p>
            </motion.section>

            <motion.section className="case-block" variants={fadeUp}>
              <h2 className="case-block__label">{ui.doneLabel}</h2>
              <ul className="case-block__list">
                {page.done.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </motion.section>

            <motion.section className="case-block" variants={fadeUp}>
              <h2 className="case-block__label">{ui.outcomeLabel}</h2>
              <p className="case-block__text">{page.outcome}</p>
              <p className="label case-page__term">
                {ui.termLabel}: {page.term}
              </p>
            </motion.section>

            {page.linkHref && page.linkLabel ? (
              <motion.p className="case-page__ext" variants={fadeUp}>
                <a
                  href={page.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {page.linkLabel} →
                </a>
              </motion.p>
            ) : null}

            <motion.div className="case-page__cta" variants={fadeUp}>
              <ScrambleButton
                className="btn btn--primary"
                href={ui.ctaPrimaryHref}
              >
                {ui.ctaPrimary}
              </ScrambleButton>
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
