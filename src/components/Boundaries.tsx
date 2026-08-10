import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import {
  fadeUp,
  panelScan,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './Boundaries.css';

export default function Boundaries() {
  const {
    num,
    h2,
    notDoingLabel,
    notWorkingLabel,
    notDoing,
    notWorking,
    note,
  } = content.boundaries;
  const reduce = useReducedMotion();

  return (
    <section
      className="section boundaries"
      id="boundaries"
      aria-labelledby="boundaries-title"
    >
      <div className="container">
        <motion.header
          className="boundaries__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="label boundaries__num">{num}</p>
          <h2 id="boundaries-title">{h2}</h2>
        </motion.header>

        <motion.div
          className="boundaries__grid"
          variants={staggerContainer(0.1, 0.05)}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.div className="boundaries-panel" variants={panelScan}>
            <h3 className="boundaries-panel__title">
              <span className="label">01</span>
              {notDoingLabel}
            </h3>
            <ul className="boundaries-panel__list">
              {notDoing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="boundaries-panel boundaries-panel--accent"
            variants={panelScan}
          >
            <h3 className="boundaries-panel__title">
              <span className="label">02</span>
              {notWorkingLabel}
            </h3>
            <ul className="boundaries-panel__list">
              {notWorking.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.p
          className="boundaries__note"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          {note}
        </motion.p>
      </div>
    </section>
  );
}
