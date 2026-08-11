import { type AnchorHTMLAttributes, type MouseEvent } from 'react';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  /** Текст ссылки — prop (Astro → React) */
  label: string;
};

/** Ссылка со scramble на hover (без react-router). */
export default function ScrambleLink({
  label,
  className = '',
  onMouseEnter,
  onMouseLeave,
  ...rest
}: Props) {
  const { ref, replay } = useHudScramble(label);

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
      aria-label={label}
    >
      <ScrambleFace text={label} liveRef={ref} />
    </a>
  );
}
