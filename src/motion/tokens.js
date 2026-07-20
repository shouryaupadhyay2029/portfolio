/**
 * SHOURYA // FOUNDRY — Motion Tokens
 * 
 * Centralized motion token dictionary defining duration constants and easings
 * compatible with GSAP, Framer Motion, and raw CSS animations.
 */

// Durations in seconds (for JS animation libraries like GSAP and Framer Motion)
export const duration = {
  fast: 0.15,
  medium: 0.3,
  slow: 0.5,
  extraSlow: 0.8
};

// Durations in CSS string formats
export const cssDuration = {
  fast: '150ms',
  medium: '300ms',
  slow: '500ms',
  extraSlow: '800ms'
};

// Easings as cubic-bezier numeric arrays (for Framer Motion transition curves)
export const easeArray = {
  standard: [0.4, 0, 0.2, 1],
  entrance: [0.0, 0, 0.2, 1],
  exit: [0.4, 0, 1.0, 1]
};

// Easings as CSS Bezier curves
export const ease = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  entrance: 'cubic-bezier(0.0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1.0, 1)'
};

// GSAP Easing configurations
export const gsapEase = {
  standard: 'power3.inOut',
  entrance: 'power3.out',
  exit: 'power3.in'
};
