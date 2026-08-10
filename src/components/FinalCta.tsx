import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import { fadeUp, viewportOnce } from '../motion/presets';
import LeadForm from './LeadForm';
import './FinalCta.css';

export default function FinalCta() {
  const { h2, sub, note, telegramHref, telegramLabel } = content.finalCta;
  const reduce = useReducedMotion();

  return (
    <section
      className="section final-cta"
      id="final-cta"
      aria-labelledby="final-cta-title"
    >
      <div className="container final-cta__layout">
        <motion.header
          className="final-cta__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <h2 id="final-cta-title">{h2}</h2>
          <p className="final-cta__sub">{sub}</p>
        </motion.header>

        <motion.div
          className="final-cta__form-wrap"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <LeadForm />
          <p className="final-cta__note">
            {note}{' '}
            <a href={telegramHref} target="_blank" rel="noopener noreferrer">
              {telegramLabel}
            </a>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
