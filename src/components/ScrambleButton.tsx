import {
  type AnchorHTMLAttributes,
  type MouseEvent,
} from 'react';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  children: string;
};

/**
 * Ссылка-кнопка со scramble на hover.
 */
export default function ScrambleButton({
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
  ...rest
}: Props) {
  const text = children;
  const { ref, replay } = useHudScramble(text);

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
      <ScrambleFace text={text} liveRef={ref} />
    </a>
  );
}
