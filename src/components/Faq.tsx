import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { content } from '../data/content.js';
import { fadeUp, viewportOnce } from '../motion/presets';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';
import './Faq.css';

function FaqItem({
  item,
  index,
  isOpen,
  panelId,
  btnId,
  onToggle,
}: {
  item: { q: string; a: string };
  index: number;
  isOpen: boolean;
  panelId: string;
  btnId: string;
  onToggle: () => void;
}) {
  const { ref, replay } = useHudScramble(item.q);

  return (
    <div className={`faq-item${isOpen ? ' is-open' : ''}`}>
      <h3 className="faq-item__q">
        <button
          type="button"
          id={btnId}
          className="faq-item__btn"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onMouseEnter={() => replay()}
        >
          <span className="faq-item__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="faq-item__text">
            <ScrambleFace text={item.q} liveRef={ref} />
          </span>
          <span className="faq-item__mark" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className="faq-item__a"
        hidden={!isOpen}
      >
        <p>{item.a}</p>
      </div>
    </div>
  );
}

export default function Faq() {
  const { num, h2, items } = content.faq;
  const reduce = useReducedMotion();
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section faq" id="faq" aria-labelledby="faq-title">
      <div className="container faq__layout">
        <motion.header
          className="faq__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="label faq__num">{num}</p>
          <h2 id="faq-title">{h2}</h2>
        </motion.header>

        <motion.div
          className="faq__list"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <FaqItem
                key={item.q}
                item={item}
                index={index}
                isOpen={isOpen}
                panelId={`${baseId}-panel-${index}`}
                btnId={`${baseId}-btn-${index}`}
                onToggle={() => setOpen(isOpen ? null : index)}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
