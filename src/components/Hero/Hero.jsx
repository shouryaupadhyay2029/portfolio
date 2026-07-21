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

  const shouryaRef = useRef(null);
  const foundryRef = useRef(null);
  const slashRef = useRef(null);
  const navRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    container: containerRef.current,
    wordmark: wordmarkRef.current,
    metadataLeft: metadataLeftRef.current,
    metadataRight: metadataRightRef.current,
  }));

  useGSAP(() => {
    if (!shouryaRef.current || !foundryRef.current) return;

    // Boot sequence finishes ~7.1s. Entrance timeline begins right as boot sequence dissolves
    const entranceDelay = isLayer2 ? 7.0 : 7.0;
    const tl = gsap.timeline({ delay: entranceDelay });

    // Set initial unrevealed state
    gsap.set([shouryaRef.current, foundryRef.current], {
      opacity: 0,
      y: 45,
      filter: 'blur(16px)',
    });

    if (slashRef.current) {
      gsap.set(slashRef.current, { opacity: 0, scale: 0.75, color: '#d86f2a' });
    }

    if (navRef.current) {
      gsap.set(navRef.current, { opacity: 0, y: -24 });
    }

    if (scrollIndicatorRef.current) {
      gsap.set(scrollIndicatorRef.current, { opacity: 0, x: -20 });
    }

    // 1. Reveal "SHOURYA"
    tl.to(shouryaRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.3,
      ease: 'power3.out',
    }, 0.0);

    // 2. Reveal "FOUNDRY"
    tl.to(foundryRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.3,
      ease: 'power3.out',
    }, 0.16);

    // 3. Slash "//" Terracotta Glow
    if (slashRef.current) {
      tl.to(slashRef.current, {
        opacity: 1,
        scale: 1.0,
        color: '#d86f2a',
        duration: 1.0,
        ease: 'back.out(1.6)',
      }, 0.30);
    }

    // 4. Top Marquee Ribbons & Logo Video
    if (navRef.current) {
      tl.to(navRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, 0.42);
    }

    // 5. Bottom-Left Explore Indicator
    if (scrollIndicatorRef.current) {
      tl.to(scrollIndicatorRef.current, {
        opacity: 1,
        x: 0,
        duration: 1.1,
        ease: 'power3.out',
      }, 0.55);
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={cn('hero-root', isLayer2 && 'hero-root-layer2', className)}
    >
      {/* ── INTERACTION PLANE ──────────────────────────────────── */}
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

      {/* ── TOP NAV LOGO & MARQUEES ────────────────────────────── */}
      <nav className="hero-nav" ref={navRef}>
        {/* Left Marquee */}
        <div className="marquee-ribbon" aria-hidden="true">
          <div className="marquee-mask">
            <div className="marquee-track marquee-track-left">
              <span>HEY, I'M SHOURYA UPADHYAY • FULL STACK DEVELOPER • OPEN TO LEARN • OPEN TO BUILD • CREATIVE PROBLEM SOLVER • ALWAYS CURIOUS • DESIGNING EXPERIENCES • BUILDING COOL THINGS • </span>
              <span>HEY, I'M SHOURYA UPADHYAY • FULL STACK DEVELOPER • OPEN TO LEARN • OPEN TO BUILD • CREATIVE PROBLEM SOLVER • ALWAYS CURIOUS • DESIGNING EXPERIENCES • BUILDING COOL THINGS • </span>
            </div>
          </div>
        </div>

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

        {/* Right Marquee */}
        <div className="marquee-ribbon" aria-hidden="true">
          <div className="marquee-mask">
            <div className="marquee-track marquee-track-right">
              <span>REACT • GSAP • THREE.JS • FIREBASE • TAILWIND CSS • CREATIVE DEVELOPMENT • INTERACTION DESIGN • UI / UX • DESIGN SYSTEMS • AI WORKFLOWS • </span>
              <span>REACT • GSAP • THREE.JS • FIREBASE • TAILWIND CSS • CREATIVE DEVELOPMENT • INTERACTION DESIGN • UI / UX • DESIGN SYSTEMS • AI WORKFLOWS • </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── WORDMARK BLOCK ─────────────────────────────────────── */}
      <div className="hero-central">
        <div className="hero-wordmark-interactive-wrapper">
          <h1
            ref={wordmarkRef}
            className="hero-wordmark"
          >
            <span ref={shouryaRef} className="hero-wordmark-line hero-line-shourya select-none">
              SHOURYA
            </span>
            <span ref={foundryRef} className="hero-wordmark-line hero-line-foundry select-none">
              <span ref={slashRef} className="hero-slash" aria-hidden="true">//</span>
              FOUNDRY
            </span>
          </h1>
        </div>
      </div>

      {/* ── EDITORIAL SCROLL INDICATOR ─────────────────────────── */}
      <div className="hero-scroll-indicator" ref={scrollIndicatorRef} aria-hidden="true">
        <span className="hero-scroll-text">EXPLORE</span>
        <div className="hero-scroll-line">
          <div className="hero-scroll-dot"></div>
        </div>
      </div>

    </div>
  );
});

Hero.displayName = 'Hero';
export default Hero;
