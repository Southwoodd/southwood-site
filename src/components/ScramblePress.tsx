import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type Ref,
} from 'react';
import { useHudScramble } from './useHudScramble';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
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
      {/* Начальный текст для SSR; use-scramble перезапишет через ref */}
      <span className="scramble-btn__live" ref={liveRef} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

/** Кнопка (<button>) со scramble на hover. */
export default function ScramblePress({
  label,
  className = '',
  onMouseEnter,
  onMouseLeave,
  type = 'button',
  ...rest
}: Props) {
  const { ref, replay } = useHudScramble(label);

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
      aria-label={rest['aria-label'] ?? label}
    >
      <ScrambleFace text={label} liveRef={ref} />
    </button>
  );
}
