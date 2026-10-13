import React, { useEffect, useRef } from 'react';
import './PixelTrail.css';

/**
 * PixelTrail — Awwwards / Studio Digital Micro-Pixel Cursor Trail
 *
 * Divides the viewport into discrete square grid cells (small pixel box size).
 * As the user moves their cursor (or touches), every cell traversed
 * lights up and decays smoothly over time.
 *
 * Uses `mix-blend-mode: difference` for high-contrast inverted pixelation
 * over all light, dark, and vibrant surfaces.
 */
export default function PixelTrail({
  gridSize = 18,           // Small micro-pixel box size (18px)
  fadeDuration = 580,      // Decay duration in ms
  color = [255, 255, 255], // RGB fill
  blendMode = 'difference',
  zIndex = 9999999,
}) {
  const canvasRef = useRef(null);
  const activeCellsRef = useRef(new Map());
  const rafIdRef = useRef(null);
  const lastPosRef = useRef(null);

  const [r, g, b] = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Continuous 60fps render loop: renders and decays active square cells
    const render = () => {
      const now = performance.now();
      const activeCells = activeCellsRef.current;

      ctx.clearRect(0, 0, width, height);

      for (const [key, cell] of activeCells.entries()) {
        const age = now - cell.addedAt;

        if (age >= fadeDuration) {
          activeCells.delete(key);
        } else {
          const progress = age / fadeDuration;
          // Smooth decay curve: bold initial stamp + gentle falloff
          const alpha = Math.pow(1 - progress, 1.2);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          // Draw crisp small square aligned to grid
          ctx.fillRect(
            cell.col * gridSize,
            cell.row * gridSize,
            gridSize + 0.5,
            gridSize + 0.5
          );
        }
      }

      if (activeCells.size > 0) {
        rafIdRef.current = requestAnimationFrame(render);
      } else {
        rafIdRef.current = null;
      }
    };

    const startLoop = () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(render);
      }
    };

    const registerPoint = (x, y, now) => {
      const col = Math.floor(x / gridSize);
      const row = Math.floor(y / gridSize);
      const key = `${col}_${row}`;

      activeCellsRef.current.set(key, {
        col,
        row,
        addedAt: now,
      });
    };

    // Interpolates trajectory so no cells are skipped during fast moves
    const handleMove = (clientX, clientY) => {
      const now = performance.now();

      if (!lastPosRef.current) {
        registerPoint(clientX, clientY, now);
        lastPosRef.current = { x: clientX, y: clientY };
        startLoop();
        return;
      }

      const prev = lastPosRef.current;
      const dx = clientX - prev.x;
      const dy = clientY - prev.y;
      const dist = Math.hypot(dx, dy);

      // Fine sub-step interval smaller than gridSize for a tight, solid trail
      const stepSize = Math.max(5, gridSize * 0.35);
      const steps = Math.max(1, Math.ceil(dist / stepSize));

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = prev.x + dx * t;
        const y = prev.y + dy * t;
        registerPoint(x, y, now);
      }

      lastPosRef.current = { x: clientX, y: clientY };
      startLoop();
    };

    const onPointerMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      lastPosRef.current = null;
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        lastPosRef.current = null;
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      lastPosRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [gridSize, fadeDuration, r, g, b]);

  return (
    <canvas
      ref={canvasRef}
      className="pixel-trail-canvas"
      style={{
        mixBlendMode: blendMode,
        zIndex,
      }}
      aria-hidden="true"
    />
  );
}
