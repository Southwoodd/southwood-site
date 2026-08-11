import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import {
  easeHud,
  fadeUp,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './About.css';

export default function About() {
  const { num, h2, text, linkLabel, linkHref, photoAlt, photoSrc } =
    content.about;
  const reduce = useReducedMotion();

  return (
    <section
      className="section about"
      id="about"
      aria-labelledby="about-title"
    >
      <motion.div
        className="container about__layout"
        variants={staggerContainer(0.12, 0.04)}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={viewportOnce}
      >
        <motion.div className="about__media" variants={fadeUp}>
          {photoSrc ? (
            <img
              className="about__photo"
              src={photoSrc}
              alt={photoAlt}
              width={1200}
              height={1200}
              decoding="async"
            />
          ) : (
            <div
              className="about__photo about__photo--placeholder"
              role="img"
              aria-label={photoAlt}
            >
              <span className="label">/ Photo</span>
              <span className="about__photo-mark" aria-hidden="true">
                SW
              </span>
            </div>
          )}
        </motion.div>

        <motion.div className="about__copy" variants={staggerContainer(0.08, 0)}>
          <motion.p className="label about__num" variants={fadeUp}>
            {num}
          </motion.p>
          <motion.h2 id="about-title" className="about__title" variants={fadeUp}>
            {h2}
          </motion.h2>
          <motion.p className="about__text" variants={fadeUp}>
            {text}
          </motion.p>
          <motion.a
            className="about__link"
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            variants={fadeUp}
            transition={easeHud}
            whileHover={reduce ? undefined : { x: 4 }}
          >
            <span>{linkLabel}</span>
            <span className="about__link-arrow" aria-hidden="true">
              →
            </span>
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
