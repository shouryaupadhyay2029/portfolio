import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { EditorialContainer } from '../layouts/Containers';

/**
 * Hero Section for SHOURYA // FOUNDRY.
 * A premium, architectural opening section built using fluid spacing,
 * structural lines, and a sequenced GSAP intro animation.
 */
export default function Hero() {
  const containerRef = useRef(null);

  // Split titles for precise letter-by-letter sliding reveal
  const titleShourya = 'SHOURYA';
  const titleFoundry = '// FOUNDRY';

  const renderSplitLetters = (text, className) => {
    return text.split('').map((char, idx) => (
      <span key={idx} className="inline-block overflow-hidden leading-none">
        <span 
          className={`${className} inline-block translate-y-full opacity-0 will-change-transform`}
          style={{ transformOrigin: 'bottom center' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      </span>
    ));
  };

  useGSAP(() => {
    // Sequenced reveal timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
    });

    // 1. Blueprint structural guide lines scale and materialize
    tl.fromTo(
      '.blueprint-line-y',
      { scaleY: 0, opacity: 0 },
      { scaleY: 1, opacity: 0.08, duration: 1.6, stagger: 0.15, transformOrigin: 'top', ease: 'power3.inOut' }
    );

    tl.fromTo(
      '.blueprint-line-x',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 0.08, duration: 1.4, transformOrigin: 'left', ease: 'power3.inOut' },
      '<=0.3'
    );

    // 2. Navigation bar header content slides down
    tl.fromTo(
      '.hero-nav-item',
      { y: -15, opacity: 0 },
      { y: 0, opacity: 0.7, duration: 1.0, stagger: 0.1 },
      '-=0.8'
    );

    // 3. SHOURYA title reveals (letter-by-letter)
    tl.to(
      '.char-shourya',
      {
        y: 0,
        opacity: 1,
        duration: 1.3,
        stagger: 0.04,
      },
      '-=0.9'
    );

    // 4. // FOUNDRY title reveals (letter-by-letter)
    tl.to(
      '.char-foundry',
      {
        y: 0,
        opacity: 1,
        duration: 1.3,
        stagger: 0.04,
      },
      '-=1.0'
    );

    // 5. Tagline fades and shifts upward
    tl.fromTo(
      '.tagline-item',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 0.8, duration: 1.0, stagger: 0.08 },
      '-=0.9'
    );

    // 6. Metadata panel fades and slides in
    tl.fromTo(
      '.metadata-panel-item',
      { x: -10, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, stagger: 0.08 },
      '-=0.7'
    );

    // 7. Status panel fades and slides in
    tl.fromTo(
      '.status-panel-item',
      { x: 10, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.2, stagger: 0.08 },
      '-=1.1'
    );

    // 8. Tiny orange node fades in
    tl.fromTo(
      '.accent-node',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.0, ease: 'power3.out' },
      '-=0.5'
    );

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-8 pb-16 overflow-hidden select-none"
    >
      {/* ==========================================================
          Architectural Guide Lines (Blueprint aesthetics)
         ========================================================== */}
      {/* Vertical Spine left of center (1/3 width grid track) */}
      <div className="blueprint-line-y absolute top-0 bottom-0 left-[33%] w-[1px] bg-white pointer-events-none z-0" />
      
      {/* Vertical Spine right of center (2/3 width grid track) */}
      <div className="blueprint-line-y absolute top-0 bottom-0 left-[66%] w-[1px] bg-white pointer-events-none z-0" />
      
      {/* Horizontal divider above footer panels */}
      <div className="blueprint-line-x absolute bottom-[22%] left-0 right-0 h-[1px] bg-white pointer-events-none z-0" />

      {/* Tiny controlled Orange node sitting exactly at grid intersection */}
      <div className="accent-node absolute bottom-[22%] left-[33%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full pointer-events-none z-10 flex items-center justify-center opacity-0">
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>

      <EditorialContainer className="flex-1 flex flex-col justify-between relative z-10">
        
        {/* ==========================================================
            Top: Navigation Placeholder Area
           ========================================================== */}
        <header className="w-full flex justify-between items-center text-label-custom text-[10px] text-text-secondary border-b border-white/5 pb-5">
          <div className="hero-nav-item flex items-center gap-3 opacity-0">
            <span className="accent-dot-active" />
            <span className="tracking-[0.25em] font-medium text-text-primary">SHOURYA // FOUNDRY</span>
          </div>
          <div className="hidden sm:flex gap-8 font-mono text-[9px] text-text-muted">
            <span className="hero-nav-item opacity-0">[IIOT / USAR]</span>
            <span className="hero-nav-item opacity-0">[DELHI, INDIA]</span>
            <span className="hero-nav-item opacity-0 text-text-secondary hover-link-accent cursor-pointer">[MENU.SYS]</span>
          </div>
        </header>

        {/* ==========================================================
            Center: Massive Editorial Typography Zone
           ========================================================== */}
        <div className="my-auto py-12 flex flex-col justify-center">
          <h1 className="text-display-xl flex flex-col tracking-tighter leading-none select-none">
            {/* SHOURYA (Weight 900) */}
            <span className="block font-black text-text-primary">
              {renderSplitLetters(titleShourya, 'char-shourya')}
            </span>
            {/* // FOUNDRY (Weight 200 - Extra Light) */}
            <span className="block font-extralight text-text-secondary -mt-[0.16em]">
              {renderSplitLetters(titleFoundry, 'char-foundry')}
            </span>
          </h1>

          {/* Subtitle / Tagline Block */}
          <div className="max-w-xl mt-8">
            <p className="tagline-item text-body-l font-light leading-relaxed text-text-secondary opacity-0">
              BUILDING DIGITAL PRODUCTS,<br />
              INTERFACES AND EXPERIENCES.
            </p>
            <div className="tagline-item h-[1px] bg-white/10 w-24 mt-6 transform origin-left opacity-0" />
          </div>
        </div>

        {/* ==========================================================
            Bottom Panels: Grid-Aligned Metadata and Status
           ========================================================== */}
        <div className="grid-12 gap-8 items-end w-full pt-6">
          
          {/* Bottom Left: Metadata Panel (Cols 1-6) */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-end text-left pl-2 h-full min-h-[100px] border-l border-white/5 md:border-l-0">
            <div className="metadata-panel-item text-caption-custom font-mono text-[8px] mb-3 text-text-muted opacity-0">
              [SYSTEM.STAGE_META]
            </div>
            
            <div className="space-y-2.5 font-mono text-[9px] tracking-wider text-text-secondary">
              <div className="metadata-panel-item flex items-center gap-2 opacity-0">
                <span className="text-text-muted">// 01</span>
                <span>IIOT STUDENT</span>
              </div>
              <div className="metadata-panel-item w-full h-[1px] bg-white/5 opacity-0" />
              <div className="metadata-panel-item flex items-center gap-2 opacity-0">
                <span className="text-text-muted">// 02</span>
                <span>FRONTEND DEVELOPER</span>
              </div>
              <div className="metadata-panel-item w-full h-[1px] bg-white/5 opacity-0" />
              <div className="metadata-panel-item flex items-center gap-2 opacity-0">
                <span className="text-text-muted">// 03</span>
                <span>EXPERIENCE DESIGNER</span>
              </div>
            </div>
          </div>

          {/* Bottom Right: Status Panel (Cols 7-12) */}
          <div className="col-span-12 md:col-span-6 flex flex-col justify-end text-left md:text-right pr-2 h-full min-h-[100px] border-l border-white/5 md:border-l-0 md:border-r border-white/5 md:items-end">
            <div className="status-panel-item text-caption-custom font-mono text-[8px] mb-3 text-text-muted opacity-0">
              [SYSTEM.LAUNCH_STATUS]
            </div>
            
            <div className="space-y-1.5 font-mono text-[9px] tracking-wide text-text-secondary">
              <div className="status-panel-item flex items-center gap-2 md:justify-end opacity-0">
                <span className="text-accent font-semibold tracking-widest text-[8px]">CURRENTLY FORGING</span>
                <span className="accent-dot-active" />
              </div>
              <div className="status-panel-item text-[8px] text-text-muted opacity-0">
                CORE: DEVSTAGE.01
              </div>
              <div className="status-panel-item text-[8px] text-text-muted opacity-0">
                TARGET: REAL WORLD PRODUCTS
              </div>
            </div>
          </div>

        </div>

      </EditorialContainer>
    </section>
  );
}
