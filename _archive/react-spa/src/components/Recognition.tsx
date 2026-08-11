import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import {
  fadeUp,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './Recognition.css';

export default function Recognition() {
  const { num, h2, items, closing } = content.recognition;
  const reduce = useReducedMotion();

  return (
    <section
      className="section recognition"
      id="recognition"
      aria-labelledby="recognition-title"
    >
      <div className="container">
        <motion.header
          className="recognition__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="label recognition__num">{num}</p>
          <h2 id="recognition-title">{h2}</h2>
        </motion.header>

        <motion.ul
          className="recognition__grid"
          variants={staggerContainer(0.05, 0.04)}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          {items.map((item, i) => (
            <motion.li
              className="recognition-card"
              key={item.title}
              variants={fadeUp}
            >
              <span className="label recognition-card__n">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="recognition-card__title">{item.title}</h3>
              <p className="recognition-card__text">{item.text}</p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          className="recognition__closing"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          {closing}
        </motion.p>
      </div>
    </section>
  );
}
