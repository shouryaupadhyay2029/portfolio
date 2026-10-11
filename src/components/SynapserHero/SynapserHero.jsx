import React, { useRef, useEffect } from 'react';
import GrainCanvas from './GrainCanvas';
import SliceDisplacementText from './SliceDisplacementText';
import PixelVanishingImage from './PixelVanishingImage';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './SynapserHero.css';

gsap.registerPlugin(useGSAP);

export default function SynapserHero({ onIntroComplete }) {
  const containerRef    = useRef(null);
  const shouryaRef      = useRef(null);
  const foundryRef      = useRef(null);
  const footerRef       = useRef(null);
  const centerTagRef    = useRef(null);
  const polaroidRef     = useRef(null);
  const pixelVanishRef  = useRef(null);
  // Gates the scroll RAF loop — only activates after intro finishes
  const scrollReadyRef  = useRef(false);

  /* ═══════════════════════════════════════════════════════════════
     PHASE 1 — Cinematic Intro
  ═══════════════════════════════════════════════════════════════ */
  useGSAP(() => {
    if (!containerRef.current || !shouryaRef.current || !foundryRef.current) return;

    const getDeltas = () => {
      const sRect = shouryaRef.current.getBoundingClientRect();
      const fRect = foundryRef.current.getBoundingClientRect();
      const screenCX = window.innerWidth  / 2;
      const screenCY = window.innerHeight / 2;
      const initialScale = 3.2;
      const gap = 30;
      const scaledWs = sRect.width * initialScale;
      const scaledWf = fRect.width * initialScale;
      const totalW   = scaledWs + scaledWf + gap * initialScale;
      const sInitCX  = screenCX - totalW / 2 + scaledWs / 2;
      const fInitCX  = screenCX + totalW / 2 - scaledWf / 2;
      const tW       = sRect.width + fRect.width + gap;
      const sZoomCX  = screenCX - tW / 2 + sRect.width  / 2;
      const fZoomCX  = screenCX + tW / 2 - fRect.width  / 2;
      const cy       = screenCY;
      const sRCX = sRect.left + sRect.width  / 2;
      const sRCY = sRect.top  + sRect.height / 2;
      const fRCX = fRect.left + fRect.width  / 2;
      const fRCY = fRect.top  + fRect.height / 2;
      return {
        initialScale,
        sI: { x: sInitCX - sRCX, y: cy - sRCY },
        fI: { x: fInitCX - fRCX, y: cy - fRCY },
        sZ: { x: sZoomCX - sRCX, y: cy - sRCY },
        fZ: { x: fZoomCX - fRCX, y: cy - fRCY },
      };
    };

    const d = getDeltas();

    if (polaroidRef.current) {
      gsap.set(polaroidRef.current, { opacity: 0, y: 45, scale: 0.9, rotationZ: -8, filter: 'blur(10px)' });
    }

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        if (typeof onIntroComplete === 'function') onIntroComplete();

        // ── Wipe GSAP's transform cache so the rAF loop owns the elements ──
        gsap.killTweensOf([shouryaRef.current, foundryRef.current]);
        gsap.set(shouryaRef.current, { clearProps: 'x,y,scale,filter' });
        gsap.set(foundryRef.current, { clearProps: 'x,y,scale,filter' });

        // Wait 2 frames for the DOM write to settle before we start
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            scrollReadyRef.current = true;
          })
        );
      },
    });

    tl.fromTo(shouryaRef.current,
      { x: d.sI.x, y: d.sI.y, scale: d.initialScale, opacity: 0, filter: 'blur(16px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' }
    );
    tl.fromTo(foundryRef.current,
      { x: d.fI.x, y: d.fI.y, scale: d.initialScale, opacity: 0, filter: 'blur(16px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power2.out' },
      '<+=0.04'
    );
    tl.to({}, { duration: 0.3 });
    tl.to(shouryaRef.current, { x: d.sZ.x, y: d.sZ.y, scale: 1.0, duration: 2.1, ease: 'power3.inOut' });
    tl.to(foundryRef.current, { x: d.fZ.x, y: d.fZ.y, scale: 1.0, duration: 2.1, ease: 'power3.inOut' }, '<');
    tl.to({}, { duration: 0.6 });
    tl.to(shouryaRef.current, { x: 0, y: 0, duration: 2.2, ease: 'power3.inOut' });
    tl.to(foundryRef.current, { x: 0, y: 0, duration: 2.2, ease: 'power3.inOut' }, '<');
    tl.fromTo(centerTagRef.current, { opacity: 0, y: 16 }, { opacity: 0.85, y: 0, duration: 1.1, ease: 'power2.out' }, '-=1.2');
    if (polaroidRef.current) {
      tl.to(polaroidRef.current, { opacity: 1, y: 0, scale: 1.0, rotationZ: -3.5, filter: 'blur(0px)', duration: 1.35, ease: 'power3.out' }, '-=1.0');
    }
    tl.fromTo(footerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power2.out' }, '-=0.9');

  }, { scope: containerRef });

  /* ═══════════════════════════════════════════════════════════════
     PHASE 2 — Scroll: shrink & move when scrolled down
     Pure DOM rAF loop — zero GSAP state conflicts.

     SHOURYA (already top-left):
       transform-origin: top left  →  just scale down, stays pinned

     FOUNDRY (bottom-right):
       translate to top-left corner + scale down simultaneously
       target top-left corner = (SHOURYA.left + SHOURYA.w*TARGET + gap, SHOURYA.top)
  ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const TARGET  = 0.13;   // final scale factor
    const GAP_PX  = 8;      // gap between words in mini state

    let initialized = false;
    let heroH = 0, fDx = 0, fDy = 0;
    let rafId;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      if (!scrollReadyRef.current) return;

      const sEl = shouryaRef.current;
      const fEl = foundryRef.current;
      if (!sEl || !fEl) return;

      // ── One-time init: capture natural resting rects ────────────
      if (!initialized) {
        const sRect = sEl.getBoundingClientRect();
        const fRect = fEl.getBoundingClientRect();
        heroH = containerRef.current?.offsetHeight ?? window.innerHeight;

        // Target position for FOUNDRY's top-left corner:
        //   x: just after SHOURYA's scaled-down right edge
        //   y: same row as SHOURYA's top edge
        const fEndLeft = sRect.left + sRect.width * TARGET + GAP_PX;
        const fEndTop  = sRect.top;

        fDx = fEndLeft - fRect.left;   // will be a large negative number
        fDy = fEndTop  - fRect.top;    // will be a large negative number

        // Pin transform origins to top-left so scaling doesn't drift
        sEl.style.transformOrigin = 'top left';
        fEl.style.transformOrigin = 'top left';

        initialized = true;
      }

      // ── Scroll progress 0 → 1 as hero scrolls through viewport ─
      const p = Math.min(Math.max(window.scrollY / heroH, 0), 1);

      // Scale: 1.0 at p=0, TARGET at p=1
      const s = 1 - p * (1 - TARGET);

      // ── Apply transforms (no GSAP — pure inline style) ─────────
      sEl.style.transform = `scale(${s})`;
      fEl.style.transform = `translate(${fDx * p}px, ${fDy * p}px) scale(${s})`;

      // ── Pixel vanishing effect on the image ─────────────────────
      if (pixelVanishRef.current) {
        pixelVanishRef.current.setProgress(p);
      }

      // ── Fade out secondary elements as hero scrolls away ────────
      const fade = Math.max(1 - p * 2.5, 0);
      if (footerRef.current)    footerRef.current.style.opacity    = fade;
      if (centerTagRef.current) centerTagRef.current.style.opacity = fade * 0.85;
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = (e) => {
    if (!polaroidRef.current) return;
    const dx = (e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2);
    const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    gsap.to(polaroidRef.current, {
      x: dx * -14, y: dy * -14, rotationZ: -3.5 + dx * -2.5,
      duration: 0.9, ease: 'power2.out',
    });
  };

  return (
    <section className="oviedo-hero-root" ref={containerRef} onMouseMove={handleMouseMove}>
        <GrainCanvas opacity={0.16} fps={24} />

        <div className="oviedo-text-block block-shourya" ref={shouryaRef}>
          <SliceDisplacementText text="SHOURYA" />
        </div>

        <div className="oviedo-center-tag" ref={centerTagRef}>
          <div className="hollow-slashes-center" aria-hidden="true">
            <svg width="108" height="72" viewBox="0 0 108 72" fill="none">
              <path d="M 22 6 L 38 6 L 18 66 L 2 66 Z" fill="none" stroke="#ad7b73" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M 64 6 L 80 6 L 60 66 L 44 66 Z" fill="none" stroke="#ad7b73" strokeWidth="2.6" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="hero-solid-photo-card" ref={polaroidRef}>
          <PixelVanishingImage ref={pixelVanishRef} src="/images/hero-2.png" alt="Monochromatic Portrait" />
        </div>

        <div className="oviedo-text-block block-foundry" ref={foundryRef}>
          <SliceDisplacementText text="FOUNDRY" />
        </div>

        <footer className="oviedo-footer" ref={footerRef}>
          <div className="footer-left font-mono"><span>© 2026 SHOURYA FOUNDRY</span></div>
          <div className="footer-right font-mono"><span>AVAILABLE FOR COLLABORATIONS</span></div>
        </footer>
      </section>
  );
}
