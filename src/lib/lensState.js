/**
 * lensState — shared singleton for the optical lens interaction.
 *
 * Updated by Hero.jsx when the cursor enters/leaves the wordmark.
 * Read by Canvas.jsx (shader material response) and LensOverlay.jsx (visual circle).
 *
 * Coordinates: targetX/Y are in WebGL UV space [0,1], Y=0 at bottom.
 */
export const lensState = {
  active: false,
  targetX: 0.5,
  targetY: 0.5,
};
