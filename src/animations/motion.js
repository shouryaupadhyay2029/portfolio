/**
 * Reusable Motion Presets for SHOURYA // FOUNDRY
 * Rules: Slow, Intentional, Premium, Architectural.
 * Avoids: Bouncing, Elasticity, Gaming effects.
 * Uses: Custom cubic-bezier easings (mostly easeOutExpo/Quart derivatives).
 */

export const transitions = {
  // Ultra-premium slow ease (easeOutExpo) - for major structural entries
  architectural: {
    type: 'tween',
    ease: [0.16, 1, 0.3, 1],
    duration: 1.4,
  },
  // Clean editorial ease (easeOutQuart) - for cards and text fades
  intentional: {
    type: 'tween',
    ease: [0.25, 1, 0.5, 1],
    duration: 1.0,
  },
  // Extreme slow transition - for environment shifting
  slow: {
    type: 'tween',
    ease: [0.22, 1, 0.36, 1],
    duration: 1.8,
  },
};

/**
 * 1. Fade Animations (Subtle opacity changes)
 */
export const fadeVariants = {
  hidden: {
    opacity: 0,
  },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      ...transitions.intentional,
      ...custom,
    },
  }),
};

/**
 * 2. Directed Fade and Slide (Vertical/Horizontal offsets, architectural speed)
 */
export const slideFadeVariants = {
  hidden: (direction = 'up') => {
    const offsets = {
      up: { y: 30, x: 0 },
      down: { y: -30, x: 0 },
      left: { x: 30, y: 0 },
      right: { x: -30, y: 0 },
    };
    return {
      opacity: 0,
      ...(offsets[direction] || { y: 30, x: 0 }),
    };
  },
  visible: (custom = {}) => {
    const { delay = 0, speed = 'intentional' } = custom;
    return {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        ...transitions[speed],
        delay,
      },
    };
  },
};

/**
 * 3. Stagger Children Animations
 */
export const staggerContainerVariants = {
  hidden: {},
  visible: (custom = {}) => {
    const { staggerChildren = 0.08, delayChildren = 0 } = custom;
    return {
      transition: {
        staggerChildren,
        delayChildren,
      },
    };
  },
};

/**
 * 4. Clip-Path / Blueprint Reveal (Simulates sliding panels or blueprints unfolding)
 */
export const revealVariants = {
  hidden: (direction = 'down') => {
    const clips = {
      down: 'inset(0% 0% 100% 0%)',
      up: 'inset(100% 0% 0% 0%)',
      right: 'inset(0% 100% 0% 0%)',
      left: 'inset(0% 0% 0% 100%)',
    };
    return {
      clipPath: clips[direction] || 'inset(0% 0% 100% 0%)',
    };
  },
  visible: (custom = {}) => {
    const { delay = 0, speed = 'architectural' } = custom;
    return {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        ...transitions[speed],
        delay,
      },
    };
  },
};

/**
 * 5. Scale Animations (Extremely subtle, structural scaling, no bounce)
 */
export const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98, // Very subtle to feel solid and grounded, never bubbly
  },
  visible: (custom = {}) => ({
    opacity: 1,
    scale: 1,
    transition: {
      ...transitions.architectural,
      ...custom,
    },
  }),
};

/**
 * 6. Section Entry Preset (Coordinates scrolling triggers)
 */
export const sectionEntryVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.architectural,
      ...custom,
    },
  }),
};
export { transitions as motionTransitions };
