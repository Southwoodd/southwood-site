import { useEffect, useRef, useState } from 'react';
import './HudPointer.css';

/** Кликабельное — показываем руку робота вместо прицела */
const CLICKABLE =
  'a[href], button:not(:disabled), [role="button"], [role="tab"], summary, .btn, .header__link, .faq-item__btn, .compare__tab, .case-link, .scramble-btn';

function canUseHudPointer() {
  if (typeof window === 'undefined') return false;
  const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return fine && !reduce;
}

function RobotHandIcon() {
  return (
    <svg
      className="hud-cursor__hand"
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Ладонь / корпус */}
      <path
        className="hud-cursor__hand-fill"
        d="M8 14V8.5a2 2 0 0 1 4 0V13M12 13V6.5a2 2 0 0 1 4 0V13M16 13V7.5a2 2 0 0 1 4 0V15.5c0 4.5-2.2 8-6.5 9.5L9 27.5V18"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
      <path
        className="hud-cursor__hand-fill"
        d="M8 14c-2.2 0-4 1.6-4 3.8V22c0 1.5.7 2.8 2 3.5L9 27.5"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
      {/* Большой палец */}
      <path
        className="hud-cursor__hand-fill"
        d="M8 16.5c-2.8.2-4.5 2-4.5 4.2"
        strokeWidth="1.4"
      />
      {/* Суставы */}
      <circle className="hud-cursor__hand-joint" cx="10" cy="10" r="1.1" />
      <circle className="hud-cursor__hand-joint" cx="14" cy="8.5" r="1.1" />
      <circle className="hud-cursor__hand-joint" cx="18" cy="9.5" r="1.1" />
      <circle className="hud-cursor__hand-joint" cx="12" cy="18" r="1.2" />
      {/* Указатель — кончик = хотспот */}
      <path
        className="hud-cursor__hand-fill"
        d="M12 13V3.2a1.6 1.6 0 0 1 3.2 0V13"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <rect
        className="hud-cursor__hand-tip"
        x="12.4"
        y="1.2"
        width="2.4"
        height="2.4"
      />
    </svg>
  );
}

export default function HudPointer() {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const visible = useRef(false);
  const interactive = useRef(false);
  const overText = useRef(false);
  const onInk = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    const syncCapability = () => setActive(canUseHudPointer());
    syncCapability();

    const fineMq = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    fineMq.addEventListener('change', syncCapability);
    reduceMq.addEventListener('change', syncCapability);
    return () => {
      fineMq.removeEventListener('change', syncCapability);
      reduceMq.removeEventListener('change', syncCapability);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove('hud-pointer');
      document.documentElement.style.removeProperty('--hud-gx');
      document.documentElement.style.removeProperty('--hud-gy');
      document.documentElement.style.removeProperty('--hud-gs');
      return;
    }

    document.documentElement.classList.add('hud-pointer');
    const root = rootRef.current;
    if (!root) return;

    const tick = () => {
      const t = target.current;
      const c = current.current;
      c.x += (t.x - c.x) * 0.28;
      c.y += (t.y - c.y) * 0.28;

      const show = visible.current && !overText.current;
      root.style.opacity = show ? '1' : '0';
      root.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      root.dataset.state = interactive.current ? 'hand' : 'aim';
      root.dataset.surface = onInk.current ? 'ink' : 'signal';

      if (coordsRef.current) {
        coordsRef.current.textContent = `X:${Math.round(t.x).toString().padStart(4, '0')} Y:${Math.round(t.y).toString().padStart(4, '0')}`;
      }

      const nx = t.x / window.innerWidth - 0.5;
      const ny = t.y / window.innerHeight - 0.5;
      const max = Math.min(window.innerWidth, window.innerHeight) * 0.018;
      document.documentElement.style.setProperty('--hud-gx', `${(-nx * max).toFixed(2)}px`);
      document.documentElement.style.setProperty('--hud-gy', `${(-ny * max).toFixed(2)}px`);
      const scale = 1 + Math.hypot(nx, ny) * 0.02;
      document.documentElement.style.setProperty('--hud-gs', scale.toFixed(4));

      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible.current) {
        current.current.x = e.clientX;
        current.current.y = e.clientY;
      }
      visible.current = true;

      const el = e.target as Element | null;
      if (!el || !(el instanceof Element)) {
        interactive.current = false;
        overText.current = false;
        onInk.current = false;
        return;
      }
      overText.current = Boolean(
        el.closest('input, textarea, select, [contenteditable="true"]'),
      );
      interactive.current =
        Boolean(el.closest(CLICKABLE)) && !overText.current;
      onInk.current = Boolean(
        el.closest('.header, .btn--primary, [data-cursor-ink]'),
      );
    };

    const onLeave = () => {
      visible.current = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('hud-pointer');
      document.documentElement.style.removeProperty('--hud-gx');
      document.documentElement.style.removeProperty('--hud-gy');
      document.documentElement.style.removeProperty('--hud-gs');
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="hud-cursor" ref={rootRef} aria-hidden="true" data-state="aim">
      <div className="hud-cursor__cross">
        <span className="hud-cursor__box" />
        <span className="hud-cursor__h" />
        <span className="hud-cursor__v" />
        <span className="hud-cursor__dot" />
      </div>
      <RobotHandIcon />
      <span className="hud-cursor__coords" ref={coordsRef}>
        X:0000 Y:0000
      </span>
    </div>
  );
}
