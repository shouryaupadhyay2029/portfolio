import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './SliceDisplacementText.css';

const SLICE_COUNT = 44; // 44 micro-strips for liquid-smooth density

/**
 * SliceDisplacementText — Editorial Micro-Liquid Lens Hover Effect
 *
 * Divides the wordmark into 44 micro-strips. Applies a smooth Gaussian
 * parabolic wave distortion under the cursor, keeping typography 100% crisp,
 * elegant, and high-end.
 */
export default function SliceDisplacementText({ text, className = '' }) {
  const containerRef  = useRef(null);
  const slicesRef     = useRef([]);
  const isHoveredRef  = useRef(false);
  const targetXRef    = useRef(0.5);
  const currentXRef   = useRef(0.5);
  const hoverFactorRef = useRef(0); // 0 (flat) -> 1 (hovered)

  const aspectSlices = Array.from({ length: SLICE_COUNT });

  useEffect(() => {
    let animId;

    const renderLoop = () => {
      // 1. Interpolate cursor position (silky lerp)
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.09;
      
      // 2. Interpolate hover intensity state (smooth spring exit)
      const targetFactor = isHoveredRef.current ? 1.0 : 0.0;
      hoverFactorRef.current += (targetFactor - hoverFactorRef.current) * 0.08;

      const currX = currentXRef.current;
      const factor = hoverFactorRef.current;

      const container = containerRef.current;
      if (!container) return;

      // 3. Compute Gaussian micro-liquid wave per slice strip
      slicesRef.current.forEach((slice, i) => {
        if (!slice) return;

        // Slice center position (0 to 1)
        const sliceX = (i + 0.5) / SLICE_COUNT;
        
        // Normalized distance relative to influence radius (0.24)
        const radius = 0.24;
        const normDist = (sliceX - currX) / radius;
        
        // Gaussian bell curve (1 at cursor center, falls to 0 smoothly)
        const gaussian = Math.exp(-normDist * normDist * 3.5);

        // Smooth parabolic Y wave (max amplitude ~6.5px)
        const wave = Math.sin(normDist * 2.2);
        const offsetY = -wave * (6.5 * factor * gaussian);

        // Subtle horizontal shear (max offset ~2.2px)
        const offsetX = -normDist * (2.2 * factor * gaussian);

        // Apply smooth GPU 3D transform
        gsap.set(slice, {
          x: offsetX,
          y: offsetY,
          force3D: true,
        });
      });

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    targetXRef.current = Math.max(0, Math.min(1, x));
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  return (
    <div
      className="slice-text-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Text for Container Bounds & Accessibility */}
      <span className={`slice-text-base oviedo-wordmark ${className}`} aria-hidden="false">
        {text}
      </span>

      {/* 44 Micro-Slice Visual Layers */}
      <div className="slice-strips-wrapper" aria-hidden="true">
        {aspectSlices.map((_, i) => {
          const sliceWidthPercent = 100 / SLICE_COUNT;
          const leftPercent = i * sliceWidthPercent;

          return (
            <div
              key={i}
              className="slice-strip"
              ref={(el) => (slicesRef.current[i] = el)}
              style={{
                left: `${leftPercent}%`,
                width: `${sliceWidthPercent + 0.06}%`, // Seamless subpixel overlap
              }}
            >
              <div
                className="slice-inner-content"
                style={{
                  width: `${SLICE_COUNT * 100}%`,
                  transform: `translateX(-${leftPercent}%)`,
                }}
              >
                <span className={`oviedo-wordmark ${className}`}>
                  {text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
