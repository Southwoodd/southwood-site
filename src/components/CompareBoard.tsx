import { useState } from 'react';
import { content } from '../data/content.js';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

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

/** Табы сравнения — клиентский остров. */
export default function CompareBoard() {
  const { columns, rows } = content.compare;
  const [active, setActive] = useState(0);
  const row = rows[active];
  const accentIndex = columns.length - 1;

  return (
    <div className="compare__board">
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
        <ul className="compare__answers" key={row.label}>
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
        </ul>
      </div>
    </div>
  );
}
