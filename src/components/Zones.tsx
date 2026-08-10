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

      <motion.ul
        className="zones__list"
        variants={staggerContainer(0.1, 0.05)}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={viewportOnce}
      >
        {items.map((item) => (
          <motion.li className="zone-row" key={item.title} variants={slideIn}>
            <div className="container zone-row__inner">
              <h3 className="zone-row__title">{item.title}</h3>

              <div className="zone-row__chain">
                <div className="zone-row__step">
                  <span className="label">Боль</span>
                  <p>{item.pain}</p>
                </div>
                <div className="zone-row__step">
                  <span className="label">Собираю</span>
                  <p>{item.build}</p>
                </div>
                <div className="zone-row__step zone-row__step--result">
                  <span className="label">Результат</span>
                  <p>{item.result}</p>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
