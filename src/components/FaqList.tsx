import { useId, useState } from 'react';
import { content } from '../data/content.js';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

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
  const n = String(index + 1).padStart(2, '0');

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
            {n}
          </span>
          <span className="faq-item__text">
            <ScrambleFace text={item.q} liveRef={ref} />
          </span>
          <span className="faq-item__mark" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h3>

      {isOpen ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={btnId}
          className="faq-item__a"
        >
          <div className="faq-item__a-inner">
            <p>{item.a}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Аккордеон FAQ — клиентский остров. */
export default function FaqList() {
  const { items } = content.faq;
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq__list">
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
    </div>
  );
}
