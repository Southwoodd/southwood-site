import { useEffect, useRef, useState } from 'react';
import './HudPointer.css';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, .btn, .scramble-btn';

function canUseHudPointer() {
  if (typeof window === 'undefined') return false;
  const fine = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return fine && !reduce;
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
      root.dataset.state = interactive.current ? 'lock' : 'aim';

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
        return;
      }
      overText.current = Boolean(
        el.closest('input, textarea, select, [contenteditable="true"]'),
      );
      interactive.current = Boolean(el.closest(INTERACTIVE)) && !overText.current;
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
    <div className="hud-cursor" ref={rootRef} aria-hidden="true">
      <div className="hud-cursor__cross">
        <span className="hud-cursor__box" />
        <span className="hud-cursor__h" />
        <span className="hud-cursor__v" />
        <span className="hud-cursor__dot" />
      </div>
      <span className="hud-cursor__coords" ref={coordsRef}>
        X:0000 Y:0000
      </span>
    </div>
  );
}
