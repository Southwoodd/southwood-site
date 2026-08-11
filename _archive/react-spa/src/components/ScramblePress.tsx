import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type Ref,
} from 'react';
import { useHudScramble } from './useHudScramble';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: string;
};

export function ScrambleFace({
  text,
  liveRef,
}: {
  text: string;
  liveRef: Ref<HTMLSpanElement | null>;
}) {
  return (
    <span className="scramble-btn">
      <span className="scramble-btn__ghost" aria-hidden="true">
        {text}
      </span>
      <span className="scramble-btn__live" ref={liveRef} aria-hidden="true" />
    </span>
  );
}

/** Кнопка (&lt;button&gt;) со scramble на hover. */
export default function ScramblePress({
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
  type = 'button',
  ...rest
}: Props) {
  const text = children;
  const { ref, replay } = useHudScramble(text);

  const handleEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (!rest.disabled) replay();
    onMouseEnter?.(e);
  };

  return (
    <button
      {...rest}
      type={type}
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={onMouseLeave}
      aria-label={rest['aria-label'] ?? text}
    >
      <ScrambleFace text={text} liveRef={ref} />
    </button>
  );
}
