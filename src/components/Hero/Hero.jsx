import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { cn } from '../../lib/utils';
import { lensState } from '../../lib/lensState';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Hero.css';

/**
 * Hero — Concept A: Editorial
 *
 * Layout anatomy:
 *   - Top bar: left label | right location+coord
 *   - Central block: massive left-anchored wordmark
 *   - Below wordmark: supporting statement (left) + right editorial column
 *   - Bottom strip: portfolio preview hint
 *
 * Composition is intentionally asymmetric: wordmark ~60% of viewport width,
 * leaving the right side lightly occupied rather than empty.
 */
const Hero = forwardRef(({ className, isLayer2 = false }, ref) => {
  const containerRef = useRef(null);
  const wordmarkRef = useRef(null);
  const metadataLeftRef = useRef(null);
  const metadataRightRef = useRef(null);
  const logoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    wordmark: wordmarkRef.current,
    metadataLeft: metadataLeftRef.current,
    metadataRight: metadataRightRef.current,
  }));

  useGSAP(() => {
    // Logo GSAP animations removed to let the animated video play natively
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('hero-root', isLayer2 && 'hero-root-layer2', className)}
    >
      {/* ── INTERACTION PLANE ──────────────────────────────────── */}
      {/* 
          A solid invisible block covering the left ~65% of the hero.
          This ensures the lens stays perfectly enabled without snapping 
          between gaps in typography, while leaving the right side free
          for the orbit sculpture.
      */}
      <div 
        className="hero-interaction-plane"
        onPointerEnter={isLayer2 ? undefined : () => { lensState.active = true; }}
        onPointerLeave={isLayer2 ? undefined : () => { lensState.active = false; }}
        onPointerMove={isLayer2 ? undefined : (e) => {
          lensState.targetX = e.clientX / window.innerWidth;
          lensState.targetY = 1.0 - e.clientY / window.innerHeight;
        }}
        aria-hidden="true"
      />

      {/* ── TOP NAV LOGO ─────────────────────────────────────────── */}
      <nav className="hero-nav">
        <a href="/" ref={logoRef} className="hero-nav-logo-link" aria-label="Home">
          <video 
            src="/WEBNAME.webm" 
            className="hero-nav-logo" 
            autoPlay 
            muted 
            playsInline 
            loop 
            preload="auto" 
          />
        </a>
      </nav>

      {/* ── TOP BAR REMOVED ──────────────────────────────────────── */}

      {/* ── WORDMARK BLOCK ─────────────────────────────────────── */}
      <div className="hero-central">
        <div className="hero-wordmark-interactive-wrapper">
          <h1
            ref={wordmarkRef}
            className="hero-wordmark animate-sharpen-text"
          >
            <span className="hero-wordmark-line hero-line-shourya select-none">
              SHOURYA
            </span>
            <span className="hero-wordmark-line hero-line-foundry select-none">
              <span className="hero-slash" aria-hidden="true">//</span>
              FOUNDRY
            </span>
          </h1>
        </div>

        {/* ── BELOW-WORDMARK ROW REMOVED ───────────────────────── */}
      </div>

      {/* ── BOTTOM PORTFOLIO PREVIEW REMOVED ────────────────────── */}

    </div>
  );
});

Hero.displayName = 'Hero';
export default Hero;
