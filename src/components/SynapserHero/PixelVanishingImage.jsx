import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import './PixelVanishingImage.css';

/**
 * Deterministic pseudo-random noise generator (identical to PixelScrollTransition)
 */
function cellNoise(col, row) {
  const n = Math.sin(col * 37.19 + row * 83.71) * 43758.5453;
  return n - Math.floor(n);
}

const PixelVanishingImage = forwardRef(function PixelVanishingImage(
  {
    src = '/images/hero-2.png',
    targetBlockSize = 8, // ~8px matching PixelScrollTransition blocks
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const stateRef = useRef({
    progress: 0,
    width: 0,
    height: 0,
    dpr: 1,
    pad: 60,
    cols: 0,
    rows: 0,
    blockSize: 8,
    blocks: [],
    offscreenCanvas: null,
    imageObj: null,
    isReady: false,
  });

  // Imperative handle for parent's high-speed RAF scroll loop
  useImperativeHandle(ref, () => ({
    setProgress: (heroScrollP) => {
      // Slower, smooth and gradual disintegration across 0 -> 0.65 of hero scroll
      const progress = Math.min(1, Math.max(0, heroScrollP / 0.65));
      const state = stateRef.current;
      if (Math.abs(state.progress - progress) > 0.0005) {
        state.progress = progress;
        draw();
      }
    },
  }));

  const draw = () => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state.isReady || !state.offscreenCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, pad, blockSize, blocks, offscreenCanvas } = state;
    const p = state.progress;

    // Clear entire canvas including padding area
    ctx.clearRect(-pad, -pad, width + pad * 2, height + pad * 2);

    // ── STAGE 1: Full pristine photo at rest ──────────────────────
    if (p <= 0.005) {
      ctx.drawImage(offscreenCanvas, 0, 0, width, height);
      return;
    }

    // ── STAGE 4: 100% Vanished — Absolutely ZERO remnants ─────────
    if (p >= 0.96) {
      // Entire photo and all particles have completely vanished
      return;
    }

    // ── STAGE 2: Render ONLY the surviving pixel blocks ──────────
    // Drawing block-by-block means vanished blocks are completely empty:
    // NO ghost lines, NO hairline seams, NO leftovers!
    const snapDuration = 0.15; // smooth window for floating ash particles
    const len = blocks.length;

    for (let i = 0; i < len; i++) {
      const b = blocks[i];
      const t = b.threshold;

      if (p < t) {
        // Pixel block is still intact: render solid
        ctx.fillStyle = b.colorStr;
        ctx.fillRect(b.x, b.y, blockSize + 0.5, blockSize + 0.5);
      } else if (p < t + snapDuration) {
        // Pixel block has snapped: render floating Thanos ash particle
        const snapP = (p - t) / snapDuration; // 0 -> 1
        const ease = snapP * snapP;

        const noiseX = cellNoise(b.c * 2, b.r);
        const noiseY = cellNoise(b.c, b.r * 2);
        const driftX = (noiseX - 0.22) * 55 * ease;
        const driftY = -(noiseY * 46 + 16) * ease;

        const size = Math.max(1, blockSize * (1 - ease * 0.65));
        const alpha = Math.max(0, 1 - snapP);

        ctx.fillStyle = `rgba(${b.r}, ${b.g}, ${b.b}, ${alpha})`;

        ctx.fillRect(b.x + driftX, b.y + driftY, size, size);
      }
      // If p >= t + snapDuration: NOT DRAWN AT ALL. Leaves zero trace!
    }
  };

  const setupAndDraw = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!container || !canvas || !state.imageObj) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const pad = 60;

    canvas.width = Math.round((width + pad * 2) * dpr);
    canvas.height = Math.round((height + pad * 2) * dpr);
    canvas.style.width = `${width + pad * 2}px`;
    canvas.style.height = `${height + pad * 2}px`;
    canvas.style.transform = `translate(-${pad}px, -${pad}px)`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);

    // Grid columns & rows based on ~8px block size
    const cols = Math.max(16, Math.round(width / targetBlockSize));
    const actualBlockSize = width / cols;
    const rows = Math.max(16, Math.round(height / actualBlockSize));

    state.width = width;
    state.height = height;
    state.pad = pad;
    state.dpr = dpr;
    state.cols = cols;
    state.rows = rows;
    state.blockSize = actualBlockSize;

    // 1. Offscreen canvas: full high-res photo with monochromatic grade + border
    const offCanvas = document.createElement('canvas');
    offCanvas.width = Math.round(width * dpr);
    offCanvas.height = Math.round(height * dpr);
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const img = state.imageObj;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let sW, sH, sX, sY;

    if (imgRatio > canvasRatio) {
      sH = img.naturalHeight;
      sW = sH * canvasRatio;
      sX = (img.naturalWidth - sW) / 2;
      sY = 0;
    } else {
      sW = img.naturalWidth;
      sH = sW / canvasRatio;
      sX = 0;
      sY = (img.naturalHeight - sH) / 2;
    }

    try {
      offCtx.filter = 'grayscale(100%) contrast(122%) brightness(108%)';
    } catch {
      // fallback
    }
    offCtx.drawImage(img, sX, sY, sW, sH, 0, 0, width, height);

    state.offscreenCanvas = offCanvas;

    // 2. Sample pixel colors per block for clean block-by-block rendering
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = cols;
    sampleCanvas.height = rows;
    const sampleCtx = sampleCanvas.getContext('2d');
    sampleCtx.drawImage(offCanvas, 0, 0, cols, rows);
    const imgData = sampleCtx.getImageData(0, 0, cols, rows).data;

    const blockList = [];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const idx = (r * cols + c) * 4;
        const red = imgData[idx];
        const green = imgData[idx + 1];
        const blue = imgData[idx + 2];

        // Smooth, progressive Thanos snap wave: gradual disintegration
        const normY = r / (rows - 1);
        const normX = c / (cols - 1);
        const wave = normY * 0.45 + normX * 0.20;
        const noise = cellNoise(c, r);

        // Smooth gradual thresholds across 0.04 to 0.80
        const threshold = 0.04 + 0.76 * (wave * 0.45 + noise * 0.55);

        blockList.push({
          c,
          r,
          x: c * actualBlockSize,
          y: r * actualBlockSize,
          r: red,
          g: green,
          b: blue,
          colorStr: `rgb(${red},${green},${blue})`,
          threshold,
        });
      }
    }

    state.blocks = blockList;
    state.isReady = true;

    draw();
  };

  useEffect(() => {
    const img = new Image();
    img.src = src;

    const onReady = () => {
      stateRef.current.imageObj = img;
      setupAndDraw();
    };

    if (img.complete && img.naturalWidth > 0) {
      onReady();
    } else {
      img.onload = onReady;
    }

    const handleResize = () => {
      if (stateRef.current.imageObj) {
        setupAndDraw();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [src, targetBlockSize]);

  return (
    <div className="pixel-vanishing-container" ref={containerRef}>
      <canvas ref={canvasRef} className="pixel-vanish-canvas" aria-hidden="true" />
    </div>
  );
});

export default PixelVanishingImage;
