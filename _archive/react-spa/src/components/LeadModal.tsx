import { useEffect, useId, useRef } from 'react';
import { content } from '../data/content.js';
import LeadForm from './LeadForm';
import { useLeadModal } from './LeadModalContext';
import './LeadModal.css';

export default function LeadModal() {
  const { isOpen, closeLeadModal } = useLeadModal();
  const { h2, sub, note, telegramHref, telegramLabel } = content.finalCta;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('lead-modal-open');

    const t = window.setTimeout(() => closeRef.current?.focus(), 20);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLeadModal();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('lead-modal-open');
    };
  }, [isOpen, closeLeadModal]);

  if (!isOpen) return null;

  return (
    <div className="lead-modal" role="presentation">
      <button
        type="button"
        className="lead-modal__backdrop"
        aria-label="Закрыть форму"
        onClick={closeLeadModal}
      />
      <div
        className="lead-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
      >
        <div className="lead-modal__head">
          <div className="lead-modal__head-copy">
            <p className="label lead-modal__label">/ Заявка</p>
            <h2 id={titleId} className="lead-modal__title">
              {h2}
            </h2>
            <p className="lead-modal__sub">{sub}</p>
          </div>
          <button
            type="button"
            className="lead-modal__close"
            aria-label="Закрыть"
            ref={closeRef}
            onClick={closeLeadModal}
          >
            ×
          </button>
        </div>

        <div className="lead-modal__body">
          <LeadForm />
          <p className="lead-modal__note">
            {note}{' '}
            <a href={telegramHref} target="_blank" rel="noopener noreferrer">
              {telegramLabel}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
