import {
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  /** Текст кнопки — prop, не children (Astro-острова сериализуют children плохо) */
  label: string;
};

/** Ссылка-кнопка со scramble на hover. */
export default function ScrambleButton({
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
