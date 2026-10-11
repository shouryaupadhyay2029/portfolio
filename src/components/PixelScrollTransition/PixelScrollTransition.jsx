import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PixelScrollTransition.css';

gsap.registerPlugin(ScrollTrigger);

const ROWS = 36; // 36 rows of ultra-fine digital micro-pixels

/**
 * Deterministic pseudo-random noise generator
 */
function cellNoise(col, row) {
  const n = Math.sin(col * 37.19 + row * 83.71) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * PixelScrollTransition — Paul Kalkbrenner Style Pixelated Scroll Curtain
 *
 * Sits at the top boundary of an incoming section. As the user scrolls,
 * pixel blocks activate in a staggered, voxel-style wave eating into
 * the previous section until it solidifies.
 */
export default function PixelScrollTransition({
  targetColor = '#ff6831',
  parentRef = null,
  isEnabled = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(0);
  const triggerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let cols = 180;
    let blockSize = 8;
    let thresholds = [];

    // If not enabled, keep canvas completely dormant and invisible
    if (!isEnabled) {
      if (triggerRef.current) {
        triggerRef.current.kill();
        triggerRef.current = null;
      }
      canvas.style.opacity = '0';
      canvas.style.visibility = 'hidden';
      ctx.clearRect(0, 0, canvas.width || 300, canvas.height || 150);
      return;
    }

    canvas.style.opacity = '1';
    canvas.style.visibility = 'visible';

    // Setup canvas resolution & cell threshold grid
    const setupGrid = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      
      // Ultra-fine micro-pixels (~6-8px)
      const targetSize = width > 1200 ? 8 : width > 768 ? 6 : 5;
      cols = Math.max(60, Math.round(width / targetSize));
      blockSize = width / cols;
      height = ROWS * blockSize;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Precalculate deterministic threshold per cell
      thresholds = [];
      for (let c = 0; c < cols; c++) {
        thresholds[c] = [];
        for (let r = 0; r < ROWS; r++) {
          const rowProgress = r / (ROWS - 1); // 0 (bottom) -> 1 (top)
          const noise = cellNoise(c, r);
          // 72% row progression + 28% noise for that organic pixel fringe
          const t = Math.min(0.98, Math.max(0.02, rowProgress * 0.72 + noise * 0.28));
          thresholds[c][r] = t;
        }
      }
    };

    setupGrid();

    // Draw frame based on current scroll progress
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = targetColor;

      const p = progressRef.current;
      if (p <= 0.005) return;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < ROWS; r++) {
          const threshold = thresholds[c]?.[r] ?? 1;

          if (p >= threshold) {
            const x = c * blockSize;
            // row 0 is at bottom (height - blockSize), row ROWS-1 is at top
            const y = height - (r + 1) * blockSize;
            // Slight +0.6px overlap to prevent subpixel hairline gaps
            ctx.fillRect(x, y, blockSize + 0.6, blockSize + 0.6);
          }
        }
      }
    };

    draw();

    // GSAP ScrollTrigger tied to parent section entering viewport
    const triggerTarget = parentRef?.current || containerRef.current;
    triggerRef.current = ScrollTrigger.create({
      trigger: triggerTarget,
      start: 'top bottom',       // when top of section enters viewport bottom
      end: 'top 32%',           // when top of section climbs to 32% from viewport top
      scrub: 0.6,               // silky smooth scrub
      onUpdate: (self) => {
        progressRef.current = self.progress;
        draw();
      },
    });

    const handleResize = () => {
      setupGrid();
      draw();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (triggerRef.current) {
        triggerRef.current.kill();
        triggerRef.current = null;
      }
    };
  }, [targetColor, parentRef, isEnabled]);

  return (
    <div className="pixel-transition-anchor" ref={containerRef} aria-hidden="true">
      <canvas className="pixel-transition-canvas" ref={canvasRef} />
    </div>
  );
}
