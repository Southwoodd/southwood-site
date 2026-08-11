import { useScramble } from 'use-scramble';

/** Общие настройки scramble для кнопок и ссылок. */
export const scrambleDefaults = {
  playOnMount: false,
  speed: 0.4,
  tick: 1,
  step: 1,
  scramble: 6,
  seed: 2,
  chance: 1,
  range: [33, 57] as [number, number],
  overflow: true,
  ignore: [' '],
};

export function useHudScramble(text: string) {
  return useScramble({
    ...scrambleDefaults,
    text,
  });
}
