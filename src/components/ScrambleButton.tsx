import {
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';
import { useScramble } from 'use-scramble';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: string;
};

/**
 * Основная кнопка со scramble через библиотеку use-scramble.
 * На hover — прокрутка/замена символами (цифры и спецсимволы, без букв).
 */
export default function ScrambleButton({
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
  ...rest
}: Props) {
  const text = children;

  const { ref, replay } = useScramble({
    text,
    playOnMount: false,
    // Мягкий темп
    speed: 0.4,
    tick: 1,
    step: 1,
    scramble: 6,
    seed: 2,
    chance: 1,
    // Unicode 33–57: !"#$%&'()*+,-./ и цифры 0–9 — без букв
    range: [33, 57],
    overflow: true,
    ignore: [' '],
  });

  const handleEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    replay();
    onMouseEnter?.(e);
  };

  return (
    <a
      {...rest}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={onMouseLeave}
      aria-label={text}
    >
      <span className="scramble-btn">
        {/* Невидимый оригинал фиксирует ширину кнопки */}
        <span className="scramble-btn__ghost" aria-hidden="true">
          {text}
        </span>
        <span className="scramble-btn__live" ref={ref} aria-hidden="true" />
      </span>
    </a>
  );
}
