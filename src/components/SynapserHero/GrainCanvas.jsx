import { useEffect, useRef } from 'react';

/**
 * GrainCanvas — Fine film grain noise, Synapser Studio style.
 * Draws random pixel noise on a canvas at 20fps for subtle tactile feel.
 * opacity: 0–1, monochrome grain particles
 */
export default function GrainCanvas({ opacity = 0.18, fps = 20, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let rafId;
    let lastTime = 0;
    const interval = 1000 / fps;

    const resize = () => {
      // Use low resolution for performance — upscale via CSS
      const w = Math.ceil(window.innerWidth  / 2);
      const h = Math.ceil(window.innerHeight / 2);
      canvas.width  = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = (now) => {
      rafId = requestAnimationFrame(draw);
      if (now - lastTime < interval) return;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Random grayscale value for each pixel
        const v = (Math.random() * 255) | 0;
        data[i]     = v; // R
        data[i + 1] = v; // G
        data[i + 2] = v; // B
        data[i + 3] = (Math.random() * 255 * opacity) | 0; // A — controls intensity
      }

      ctx.putImageData(imageData, 0, 0);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [fps, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        // Upscale the low-res canvas smoothly
        imageRendering: 'auto',
        mixBlendMode: 'multiply',
        zIndex: 1,
        ...style,
      }}
    />
  );
}
