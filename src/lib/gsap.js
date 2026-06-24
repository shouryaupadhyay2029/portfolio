import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  // Set default ScrollTrigger settings if any
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

/**
 * Reusable animation helper to fade elements up on scroll.
 * @param {HTMLElement | string} element - The target element or selector.
 * @param {object} [options] - Custom GSAP or ScrollTrigger options.
 * @returns {gsap.core.Tween} - The GSAP tween instance.
 */
export const animateFadeInUp = (element, options = {}) => {
  const {
    delay = 0,
    duration = 1,
    yOffset = 50,
    ease = 'power3.out',
    trigger = element,
    start = 'top 85%',
    toggleActions = 'play none none reverse',
    ...rest
  } = options;

  return gsap.fromTo(
    element,
    { opacity: 0, y: yOffset },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger,
        start,
        toggleActions,
        ...rest,
      },
    }
  );
};

/**
 * Reusable helper to create standard scroll-bound parallax effects.
 * @param {HTMLElement | string} element - The target element.
 * @param {number} [speed=0.2] - Speed factor of the parallax (0 to 1).
 * @param {string} [direction='y'] - Parallax direction ('x' or 'y').
 * @returns {gsap.core.Tween}
 */
export const animateParallax = (element, speed = 0.2, direction = 'y') => {
  const moveAmount = speed * 100;
  return gsap.fromTo(
    element,
    { [direction]: -moveAmount },
    {
      [direction]: moveAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    }
  );
};

export { gsap, ScrollTrigger };
