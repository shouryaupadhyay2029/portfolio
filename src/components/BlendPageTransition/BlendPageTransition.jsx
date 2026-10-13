import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { usePageTransition } from '../../context/PageTransitionContext';
import D from './blendData';
import './BlendPageTransition.css';

/* ═══════════════════════════════════════════════════════════════
   Type Blend page transition, rendered in its original 4:5 layout.
   Static artwork is cached between frames so scroll-triggered playback
   only has to composite the moving columns and morphing shape.
   ═══════════════════════════════════════════════════════════════ */

const W = 480, H = 600, FPS = 30;
const TRANSITION_WORD = 'YEET!';
const CFG = { START: 0, STAGGER: 0.774, T2: 54.6, HDR: 66 };
const BG = '#4A9700', INK = '#FFFFDF';
const COLS = [[0, 120], [120, 174], [174, 266.5], [266.5, 353.5], [353.5, 480]];

// Transition timing (in reference frames @30fps)
const END_FRAME = 92;     // after the second wipe + shape settles
const MID_FRAME = 40;     // page swaps here (screen fully covered)
const FADE_IN = 0.28;     // seconds
const FADE_OUT = 0.45;    // seconds

const tab = (t, T) => {
  if (t <= T[0][0]) return T[0][1];
  for (let i = 1; i < T.length; i++) if (t <= T[i][0]) {
    const a = T[i - 1], b = T[i];
    return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]);
  }
  return T[T.length - 1][1];
};

function shapeAt(f) {
  const S = D.SHAPE, n = S.length; f = Math.max(0, Math.min(n - 1, f));
  const i = Math.floor(f), j = Math.min(n - 1, i + 1), u = f - i;
  return S[i].map((v, k) => v + (S[j][k] - v) * u);
}

function createRenderer(cv, sh) {
  const ctx = cv.getContext('2d');
  const sx = sh.getContext('2d');
  const page = document.createElement('canvas');
  const pageCtx = page.getContext('2d');
  const header = document.createElement('canvas');
  const headerCtx = header.getContext('2d');
  let k = 1, ox = 0, oy = 0, vw = W, pageScale = 1;

  function paintStaticArt() {
    const pixelWidth = Math.round(W * pageScale);
    const pixelHeight = Math.round(H * pageScale);
    page.width = header.width = pixelWidth;
    page.height = header.height = pixelHeight;

    pageCtx.setTransform(pageScale, 0, 0, pageScale, 0, 0);
    pageCtx.clearRect(0, 0, W, H);
    pageCtx.fillStyle = 'rgb(210,255,141)';
    pageCtx.fillRect(32, 570, 416, 1);
    pageCtx.fillStyle = 'rgb(101,168,32)';
    pageCtx.fillRect(32, 571, 416, 1);
    pageCtx.save();
    pageCtx.translate(W / 2, H / 2);
    pageCtx.font = '900 600px Impact, "Arial Black", sans-serif';
    pageCtx.textAlign = 'center';
    pageCtx.textBaseline = 'middle';
    const titleWidth = pageCtx.measureText(TRANSITION_WORD).width;
    pageCtx.scale(Math.min(1, (W - 40) / titleWidth), 1);
    pageCtx.fillStyle = INK;
    pageCtx.fillText(TRANSITION_WORD, 0, 0);
    pageCtx.restore();

    headerCtx.setTransform(pageScale, 0, 0, pageScale, 0, 0);
    headerCtx.clearRect(0, 0, W, H);
    headerCtx.fillStyle = 'rgb(152,226,68)';
    headerCtx.fillRect(32, 31, 416, 2);
  }

  function drawPage(c, hdrMaxY) {
    c.save();
    c.scale(1 / pageScale, 1 / pageScale);
    c.save();
    c.beginPath();
    c.rect(0, -1000 * pageScale, W * pageScale, (hdrMaxY + 1000) * pageScale);
    c.clip();
    c.drawImage(header, 0, 0);
    c.restore();
    c.drawImage(page, 0, 0);
    c.restore();
  }

  function drawShape(f) {
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, sh.width, sh.height);
    sx.setTransform(k, 0, 0, k, 0, 0);
    const [th, R, hE, rE, hO, rO, psi] = shapeAt(f); sx.fillStyle = '#fff';
    for (let i = 0; i < 8; i++) {
      const a = th + i * Math.PI / 4, hs = i % 2 ? hO : hE, rr = Math.max(0, Math.min(i % 2 ? rO : rE, hs));
      sx.save(); sx.translate(239.5 + R * Math.cos(a), 355.5 + R * Math.sin(a)); sx.rotate(a + psi);
      sx.beginPath(); sx.roundRect(-hs, -hs, 2 * hs, 2 * hs, rr); sx.fill(); sx.restore();
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    // Fit the complete 4:5 composition inside the viewport without cropping it.
    const fit = Math.max(0.1, Math.min(w / W, h / H));
    k = fit * dpr;
    sh.width = Math.max(1, Math.round(W * k));
    sh.height = Math.max(1, Math.round(H * k));
    vw = cv.width / k;          // visible width in design units
    ox = (cv.width - W * k) / 2;
    oy = (cv.height - H * k) / 2;
    pageScale = Math.max(1, Math.min(k, 4));
    paintStaticArt();
  }

  function render(f) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cv.width, cv.height);
    ctx.clip();
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cv.width, cv.height);

    ctx.setTransform(k, 0, 0, k, ox, oy);
    const left = -ox / k; // left edge of screen in design units
    COLS.forEach((c, i) => {
      let tau = f - CFG.START - i * CFG.STAGGER; if (tau >= CFG.T2) tau -= CFG.T2;
      const s1 = tab(tau, D.SC1), s2 = tab(tau, D.SC2);
      [[-s1, 1e4], [H - s2, CFG.HDR - (H - s2)]].forEach(([o, m]) => {
        ctx.save(); ctx.beginPath(); ctx.rect(c[0] - 0.5, -2, c[1] - c[0] + 1, H + 4); ctx.clip();
        ctx.translate(0, o); drawPage(ctx, m); ctx.restore();
      });
    });

    // Difference wipes span the full screen width
    ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff';
    for (const y of [tab(f, D.L1), tab(f, D.L2)]) if (y < H) ctx.fillRect(left, Math.max(y, 0), vw, H);

    drawShape(f);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(sh, ox, oy);
    ctx.restore();
  }

  return { render, resize };
}

export default function BlendPageTransition() {
  const { isTransitioning, handleMidpoint, handleComplete } = usePageTransition();
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const sh = document.createElement('canvas');
    rendererRef.current = createRenderer(canvasRef.current, sh);
    const onResize = () => {
      if (!rootRef.current?.classList.contains('is-active')) return;
      rendererRef.current.resize();
      rendererRef.current.render(frameRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isTransitioning) return;
    const root = rootRef.current, r = rendererRef.current;
    if (!root || !r) return;

    let tl;

    r.resize();
    frameRef.current = 0;
    r.render(0);

    const state = { f: 0 };
    let midDone = false;
    tl = gsap.timeline({
      onComplete: () => { gsap.set(root, { autoAlpha: 0 }); handleComplete(); },
    });

    tl.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE_IN, ease: 'power1.out' });
    tl.to(state, {
      f: END_FRAME,
      duration: END_FRAME / FPS,
      ease: 'none', // reference timing tables already contain the easing
      onUpdate: () => {
        frameRef.current = state.f;
        r.render(state.f);
        if (!midDone && state.f >= MID_FRAME) { midDone = true; handleMidpoint(); }
      },
    });
    tl.to(root, { autoAlpha: 0, duration: FADE_OUT, ease: 'power2.inOut' });

    return () => {
      tl?.kill();
    };
  }, [isTransitioning, handleMidpoint, handleComplete]);

  return (
    <div
      ref={rootRef}
      className={`blend-page-transition-root ${isTransitioning ? 'is-active' : ''}`}
      aria-hidden={!isTransitioning}
    >
      <canvas ref={canvasRef} className="blend-transition-canvas" />
    </div>
  );
}
