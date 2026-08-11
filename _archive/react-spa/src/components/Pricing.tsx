import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import OpenLeadCta from './OpenLeadCta';
import {
  fadeUp,
  panelScan,
  staggerContainer,
  viewportOnce,
} from '../motion/presets';
import './Pricing.css';

export default function Pricing() {
  const { num, h2, items, cta } = content.pricing;
  const [lead, ...rest] = items;
  const reduce = useReducedMotion();

  return (
    <section
      className="section pricing"
      id="format"
      aria-labelledby="pricing-title"
    >
      <div className="container pricing__layout">
        <motion.header
          className="pricing__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="label pricing__num">{num}</p>
          <h2 id="pricing-title">{h2}</h2>
          <div className="pricing__cta-wrap">
            <OpenLeadCta className="btn btn--primary">{cta}</OpenLeadCta>
          </div>
        </motion.header>

        <motion.div
          className="pricing__offers"
          variants={staggerContainer(0.1, 0.08)}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.article className="price-lead" variants={panelScan}>
            <div className="price-lead__top">
              <h3 className="price-lead__title">{lead.title}</h3>
              <p className="label price-lead__term">{lead.term}</p>
            </div>
            <p className="price-lead__sum">{lead.price}</p>
            <p className="price-lead__text">{lead.text}</p>
          </motion.article>

          <motion.div
            className="pricing__secondary"
            variants={staggerContainer(0.08, 0)}
          >
            {rest.map((item) => (
              <motion.article
                className="price-item"
                key={item.title}
                variants={panelScan}
              >
                <div className="price-item__top">
                  <h3 className="price-item__title">{item.title}</h3>
                  <p className="label price-item__term">{item.term}</p>
                </div>
                <p className="price-item__sum">{item.price}</p>
                <p className="price-item__text">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
