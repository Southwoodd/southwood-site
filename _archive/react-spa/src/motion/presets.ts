import type { Transition, Variants } from 'motion/react';

/** Общие пресеты Motion под HUD-лендинг */
export const viewportOnce = {
  once: true,
  amount: 0.25,
  margin: '0px 0px -8% 0px',
} as const;

export const easeHud: Transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: easeHud },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { ...easeHud, duration: 0.4 } },
};

/** Панель «сканируется» сверху вниз.
 *  Не клипаем на 100% в hidden — иначе IO/whileInView может
 *  никогда не сработать у корневого motion-узла. */
export const panelScan: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(0 0 18% 0)',
  },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0 0% 0)',
    transition: { ...easeHud, duration: 0.65 },
  },
};

/** Ряд / карточка слева */
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: easeHud },
};

export const staggerContainer = (stagger = 0.08, delay = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});
