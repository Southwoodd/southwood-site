import { type MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { ScrambleFace } from './ScramblePress';
import { useHudScramble } from './useHudScramble';

type Props = Omit<LinkProps, 'children'> & {
  children: string;
};

/** Ссылка react-router со scramble на hover. */
export default function ScrambleLink({
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
    <Link
      {...rest}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={onMouseLeave}
      aria-label={text}
    >
      <ScrambleFace text={text} liveRef={ref} />
    </Link>
  );
}
