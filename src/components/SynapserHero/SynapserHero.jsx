import React, { useRef } from 'react';
import GrainCanvas from './GrainCanvas';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './SynapserHero.css';

gsap.registerPlugin(useGSAP);

export default function SynapserHero() {
  const containerRef = useRef(null);
  const shouryaRef   = useRef(null);
  const foundryRef   = useRef(null);
  const footerRef    = useRef(null);
  const centerTagRef = useRef(null);
  const polaroidRef  = useRef(null);

  useGSAP(() => {
    if (!containerRef.current || !shouryaRef.current || !foundryRef.current) return;

    // Calculate deltas for:
    // 1. Initial colossal state (scale 3.2 in center)
    // 2. Zoomed-out state (scale 1.0 in center)
    // 3. Final corner positions (x: 0, y: 0)
    const getDeltas = () => {
      const sRect = shouryaRef.current.getBoundingClientRect();
      const fRect = foundryRef.current.getBoundingClientRect();

      const screenCX = window.innerWidth / 2;
      const screenCY = window.innerHeight / 2;

      const initialScale = 3.2; // Large colossal display scale close to screen
      const gap = 30; // base gap at scale 1

      // Initial Colossal bounds (scale 3.2)
      const scaledWs = sRect.width * initialScale;
      const scaledWf = fRect.width * initialScale;
      const totalWidthColossal = scaledWs + scaledWf + (gap * initialScale);

      const sInitialCX = screenCX - totalWidthColossal / 2 + scaledWs / 2;
      const fInitialCX = screenCX + totalWidthColossal / 2 - scaledWf / 2;

      // Zoomed-out bounds in Center (scale 1.0)
      const totalWidthZoomed = sRect.width + fRect.width + gap;
      const sZoomedCX = screenCX - totalWidthZoomed / 2 + sRect.width / 2;
      const fZoomedCX = screenCX + totalWidthZoomed / 2 - fRect.width / 2;

      const targetCY = screenCY; // SAME horizontal row in center

      const sRestCX = sRect.left + sRect.width / 2;
      const sRestCY = sRect.top + sRect.height / 2;

      const fRestCX = fRect.left + fRect.width / 2;
      const fRestCY = fRect.top + fRect.height / 2;

      return {
        initialScale,
        shouryaInitial: {
          x: sInitialCX - sRestCX,
          y: targetCY - sRestCY,
        },
        foundryInitial: {
          x: fInitialCX - fRestCX,
          y: targetCY - fRestCY,
        },
        shouryaZoomed: {
          x: sZoomedCX - sRestCX,
          y: targetCY - sRestCY,
        },
        foundryZoomed: {
          x: fZoomedCX - fRestCX,
          y: targetCY - fRestCY,
        },
      };
    };

    const d = getDeltas();
    const tl = gsap.timeline({ delay: 0.2 });

    // Initial state for Polaroid frame
    if (polaroidRef.current) {
      gsap.set(polaroidRef.current, {
        opacity: 0,
        y: 45,
        scale: 0.9,
        rotationZ: -8,
        filter: 'blur(10px)',
      });
    }

    // ── STAGE 1: Reveal Colossal Text in Center (scale 3.2) ────────────────────
    tl.fromTo(
      shouryaRef.current,
      {
        x: d.shouryaInitial.x,
        y: d.shouryaInitial.y,
        scale: d.initialScale,
        opacity: 0,
        filter: 'blur(16px)',
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power2.out',
      }
    );

    tl.fromTo(
      foundryRef.current,
      {
        x: d.foundryInitial.x,
        y: d.foundryInitial.y,
        scale: d.initialScale,
        opacity: 0,
        filter: 'blur(16px)',
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power2.out',
      },
      '<+=0.04'
    );

    // Brief pause to absorb colossal view
    tl.to({}, { duration: 0.3 });

    // ── STAGE 2: ZOOM OUT IN CENTER FIRST (Do NOT move to corner yet!) ────────
    tl.to(
      shouryaRef.current,
      {
        x: d.shouryaZoomed.x,
        y: d.shouryaZoomed.y,
        scale: 1.0,
        duration: 2.1,
        ease: 'power3.inOut',
      }
    );

    tl.to(
      foundryRef.current,
      {
        x: d.foundryZoomed.x,
        y: d.foundryZoomed.y,
        scale: 1.0,
        duration: 2.1,
        ease: 'power3.inOut',
      },
      '<'
    );

    // Hold centered zoomed-out state so viewer sees full "SHOURYA FOUNDRY"
    tl.to({}, { duration: 0.6 });

    // ── STAGE 3: REPOSITION TO CORNERS (AFTER Zoom Out completes) ─────────────
    tl.to(
      shouryaRef.current,
      {
        x: 0,
        y: 0,
        duration: 2.2,
        ease: 'power3.inOut',
      }
    );

    tl.to(
      foundryRef.current,
      {
        x: 0,
        y: 0,
        duration: 2.2,
        ease: 'power3.inOut',
      },
      '<'
    );

    // ── STAGE 4: Reveal Polaroid Frame & UI Details ────────────────────────────
    tl.fromTo(
      centerTagRef.current,
      { opacity: 0, y: 16 },
      { opacity: 0.85, y: 0, duration: 1.1, ease: 'power2.out' },
      '-=1.2'
    );

    if (polaroidRef.current) {
      tl.to(
        polaroidRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1.0,
          rotationZ: -3.5,
          filter: 'blur(0px)',
          duration: 1.35,
          ease: 'power3.out',
        },
        '-=1.0'
      );
    }

    tl.fromTo(
      footerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power2.out' },
      '-=0.9'
    );
  }, { scope: containerRef });

  // Subtle Interactive Mouse Parallax for Polaroid
  const handleMouseMove = (e) => {
    if (!polaroidRef.current) return;
    const { clientX, clientY } = e;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (clientX - cx) / cx;
    const dy = (clientY - cy) / cy;

    gsap.to(polaroidRef.current, {
      x: dx * -14,
      y: dy * -14,
      rotationZ: -3.5 + (dx * -2.5),
      duration: 0.9,
      ease: 'power2.out',
    });
  };

  return (
    <section className="oviedo-hero-root" ref={containerRef} onMouseMove={handleMouseMove}>
      {/* Fine Film Grain Canvas */}
      <GrainCanvas opacity={0.16} fps={24} />

      {/* 1. Top-Left Display Name: "SHOURYA" */}
      <div className="oviedo-text-block block-shourya" ref={shouryaRef}>
        <h1 className="oviedo-wordmark">SHOURYA</h1>
      </div>

      {/* 2. CENTER: Large Hollow // Mark */}
      <div className="oviedo-center-tag" ref={centerTagRef}>
        <div className="hollow-slashes-center" aria-hidden="true">
          <svg width="108" height="72" viewBox="0 0 108 72" fill="none">
            <path
              d="M 22 6 L 38 6 L 18 66 L 2 66 Z"
              fill="none"
              stroke="#ad7b73"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <path
              d="M 64 6 L 80 6 L 60 66 L 44 66 Z"
              fill="none"
              stroke="#ad7b73"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. BOTTOM LEFT CORNER: Dark Mono Photo Card with Cybernetic Duotone Glitch & HUD Reticles */}
      <div className="hero-solid-photo-card" ref={polaroidRef}>
        {/* Base B&W Photo */}
        <img
          src="/images/hero-2.png"
          alt="Monochromatic Portrait"
          className="hero-solid-mono-img base-img"
        />

        {/* Glitch Slice Layer 1 (Terracotta Offset Shift) */}
        <img
          src="/images/hero-2.png"
          alt=""
          className="hero-solid-mono-img glitch-slice glitch-slice-1"
          aria-hidden="true"
        />

        {/* Glitch Slice Layer 2 (High-Contrast Inverted Split) */}
        <img
          src="/images/hero-2.png"
          alt=""
          className="hero-solid-mono-img glitch-slice glitch-slice-2"
          aria-hidden="true"
        />

        {/* Noise & Vignette Overlays */}
        <div className="card-grain-overlay" />
        <div className="card-vignette" />
      </div>

      {/* 4. Bottom-Right Display Name: "FOUNDRY" */}
      <div className="oviedo-text-block block-foundry" ref={foundryRef}>
        <h1 className="oviedo-wordmark">FOUNDRY</h1>
      </div>

      {/* 5. Footer Metadata */}
      <footer className="oviedo-footer" ref={footerRef}>
        <div className="footer-left font-mono">
          <span>© 2026 SHOURYA FOUNDRY</span>
        </div>
        <div className="footer-right font-mono">
          <span>AVAILABLE FOR COLLABORATIONS</span>
        </div>
      </footer>
    </section>
  );
}


