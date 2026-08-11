import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import {
  fadeUp,
  slideIn,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './Zones.css';

export default function Zones() {
  const { num, h2, intro, items } = content.zones;
  const reduce = useReducedMotion();

  return (
    <section
      className="section zones"
      id="directions"
      aria-labelledby="zones-title"
    >
      <motion.div
        className="container zones__head"
        variants={fadeUp}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={viewportOnce}
      >
        <p className="label zones__num">{num}</p>
        <div className="zones__head-copy">
          <h2 id="zones-title">{h2}</h2>
          <p className="zones__lead">{intro}</p>
        </div>
      </motion.div>

      <div className="container">
        <motion.ul
          className="zones__grid"
          variants={staggerContainer(0.1, 0.05)}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          {items.map((item) => (
            <motion.li className="zone-card" key={item.title} variants={slideIn}>
              <div className="zone-card__top">
                <span className="label zone-card__n">/ {item.n}</span>
                <h3 className="zone-card__title">{item.title}</h3>
              </div>

              <div className="zone-card__body">
                <div className="zone-card__step">
                  <span className="label">Боль</span>
                  <p>{item.pain}</p>
                </div>
                <div className="zone-card__step">
                  <span className="label">Собираю</span>
                  <p>{item.build}</p>
                </div>
                <div className="zone-card__step zone-card__step--result">
                  <span className="label">Результат</span>
                  <p>{item.result}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
