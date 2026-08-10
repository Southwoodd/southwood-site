import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import ScrambleButton from './ScrambleButton';
import {
  easeHud,
  fadeUp,
  panelScan,
  staggerContainer,
} from '../motion/presets';
import './Hero.css';

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9h11M9.5 4.5 14 9l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const tickerWords = [
  'Сайт',
  'CRM',
  'Боты',
  'AI-агенты',
  'Воронка',
  'Документы',
  'КП',
  'Презентации',
  'Регламенты',
  'База знаний',
  'Интеграции',
  'Автоматизация',
];

export default function Hero() {
  const h = content.hero;
  const card = h.card;
  const reduce = useReducedMotion();

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />

      <div className="container hero__grid">
        <motion.div
          className="hero__copy"
          variants={staggerContainer(0.1, 0.05)}
          initial={reduce ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="label hero__label" variants={fadeUp}>
            / {h.label}
          </motion.p>
          <motion.h1
            id="hero-title"
            className="hero__title"
            variants={fadeUp}
          >
            {h.h1}
          </motion.h1>
          <motion.p className="lead hero__sub" variants={fadeUp}>
            {h.sub}
          </motion.p>

          <motion.div className="hero__cta" variants={fadeUp}>
            <ScrambleButton className="btn btn--primary" href={h.ctaPrimaryHref}>
              {h.ctaPrimary}
            </ScrambleButton>
            <ScrambleButton
              className="btn btn--ghost"
              href={h.ctaTelegramHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {h.ctaTelegram}
            </ScrambleButton>
          </motion.div>

          <motion.p className="label hero__metrics" variants={fadeUp}>
            {h.metrics}
          </motion.p>
        </motion.div>

        <motion.a
          className="hero-card"
          href={card.href}
          variants={panelScan}
          initial={reduce ? false : 'hidden'}
          animate="show"
          transition={easeHud}
          whileHover={reduce ? undefined : { x: 2 }}
        >
          <div className="hero-card__scan" aria-hidden="true" />
          <div className="hero-card__top">
            <span className="label hero-card__tag">/ {card.tag}</span>
            <span className="hero-card__arrow" aria-hidden="true">
              <ArrowIcon />
            </span>
          </div>

          <h2 className="hero-card__title">{card.title}</h2>
          <p className="hero-card__desc">{card.description}</p>

          <span className="hero-card__cta">
            <span>{card.cta}</span>
            <span className="hero-card__cta-btn" aria-hidden="true">
              <ArrowIcon />
            </span>
          </span>
        </motion.a>
      </div>

      <motion.div
        className="hero__ticker"
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...easeHud, delay: 0.45 }}
      >
        <div className="hero__ticker-track">
          {[0, 1].map((copy) => (
            <div className="hero__ticker-group" key={copy}>
              {tickerWords.map((word) => (
                <span key={`${copy}-${word}`}>{word}</span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
