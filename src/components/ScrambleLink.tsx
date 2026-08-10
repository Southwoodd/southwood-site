import { type MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useScramble } from 'use-scramble';

type Props = Omit<LinkProps, 'children'> & {
  children: string;
};

/** Ссылка со scramble-эффектом как у кнопок (react-router). */
export default function ScrambleLink({
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
    speed: 0.4,
    tick: 1,
    step: 1,
    scramble: 6,
    seed: 2,
    chance: 1,
    range: [33, 57],
    overflow: true,
    ignore: [' '],
  });

  const handleEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    replay();
    onMouseEnter?.(e);
  };

  return (
    <Link
      {...rest}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={onMouseLeave}
      aria-label={text}
    >
      <span className="scramble-btn">
        <span className="scramble-btn__ghost" aria-hidden="true">
          {text}
        </span>
        <span className="scramble-btn__live" ref={ref} aria-hidden="true" />
      </span>
    </Link>
  );
}
