import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { content } from '../data/content.js';
import { easeHud, fadeUp, viewportOnce } from '../motion/presets';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';
import './Compare.css';

function CompareTab({
  label,
  index,
  active,
  onSelect,
}: {
  label: string;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const { ref, replay } = useHudScramble(label);

  return (
    <button
      type="button"
      role="tab"
      id={`compare-tab-${index}`}
      aria-selected={active}
      aria-controls="compare-panel"
      className={active ? 'compare__tab is-active' : 'compare__tab'}
      onClick={onSelect}
      onMouseEnter={() => replay()}
    >
      <span className="compare__tab-index">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="compare__tab-label">
        <ScrambleFace text={label} liveRef={ref} />
      </span>
    </button>
  );
}

export default function Compare() {
  const { num, h2, columns, rows, note } = content.compare;
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const row = rows[active];
  const accentIndex = columns.length - 1;

  return (
    <section
      className="section compare"
      id="compare"
      aria-labelledby="compare-title"
    >
      <div className="container">
        <motion.header
          className="compare__intro"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <p className="label compare__num">{num}</p>
          <h2 id="compare-title">{h2}</h2>
        </motion.header>

        <motion.div
          className="compare__board"
          variants={fadeUp}
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={viewportOnce}
        >
          <div
            className="compare__tabs"
            role="tablist"
            aria-label="Критерии сравнения"
          >
            {rows.map((item, i) => (
              <CompareTab
                key={item.label}
                label={item.label}
                index={i}
                active={active === i}
                onSelect={() => setActive(i)}
              />
            ))}
          </div>

          <div
            className="compare__panel"
            role="tabpanel"
            id="compare-panel"
            aria-labelledby={`compare-tab-${active}`}
          >
            <p className="label compare__panel-title">{row.label}</p>

            <AnimatePresence mode="wait">
              <motion.ul
                key={row.label}
                className="compare__answers"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={easeHud}
              >
                {columns.map((col, i) => (
                  <li
                    key={col}
                    className={
                      i === accentIndex
                        ? 'compare-answer is-accent'
                        : 'compare-answer'
                    }
                  >
                    <span className="label compare-answer__who">{col}</span>
                    <p className="compare-answer__text">{row.values[i]}</p>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          className="compare__note"
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
