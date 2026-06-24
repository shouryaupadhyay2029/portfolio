import React from 'react';

/**
 * NoiseOverlay implements a high-end film grain static overlay combined
 * with a dark editorial radial vignette. Extremely low opacity ensures
 * the texture is felt as a tactile atmosphere rather than clearly seen.
 */
export default function NoiseOverlay() {
  return (
    <>
      <style>{`
        /* Grain Container */
        .noise-container {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        /* Micro-grain moving layer */
        .noise-grain {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: transparent url('data:image/svg+xml,%3Csvg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E') repeat;
          opacity: 0.022;
          will-change: transform;
          animation: cinematicGrain 6s steps(6) infinite;
        }

        /* Soft editorial vignette */
        .vignette-layer {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, transparent 40%, rgba(17, 17, 17, 0.45) 100%);
          z-index: 9998;
        }

        @keyframes cinematicGrain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -3%); }
          20% { transform: translate(-3%, 2%); }
          30% { transform: translate(2%, -5%); }
          40% { transform: translate(-1%, 5%); }
          50% { transform: translate(-4%, 2%); }
          65% { transform: translate(3%, -1%); }
          80% { transform: translate(0%, 4%); }
          90% { transform: translate(-2%, 1%); }
        }
      `}</style>
      <div className="noise-container" aria-hidden="true">
        <div className="noise-grain" />
      </div>
      <div className="vignette-layer" aria-hidden="true" />
    </>
  );
}
