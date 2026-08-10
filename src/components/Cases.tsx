import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import {
  fadeUp,
  slideIn,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './Cases.css';

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 9h11M9.5 4.5 14 9l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Cases() {
  const { num, h2, items } = content.cases;
  const reduce = useReducedMotion();

  return (
    <section
      className="section cases"
      id="cases"
      aria-labelledby="cases-title"
    >
      <motion.div
        className="container cases__head"
        variants={fadeUp}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={viewportOnce}
      >
        <p className="label cases__num">{num}</p>
        <h2 id="cases-title">{h2}</h2>
      </motion.div>

      <motion.div
        className="cases__stack"
        variants={staggerContainer(0.09, 0.05)}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={viewportOnce}
      >
        {items.map((item) => (
          <motion.div key={item.title} variants={slideIn}>
            <Link className="case-link" to={item.href}>
              <motion.div
                className="container case-link__inner"
                whileHover={reduce ? undefined : { x: 6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              >
                <div className="case-link__meta">
                  <span className="label case-link__tag">{item.tag}</span>
                  <span className="case-link__go" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </div>
                <h3 className="case-link__title">{item.title}</h3>
                <p className="case-link__result">{item.result}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
