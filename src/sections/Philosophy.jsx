import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { EditorialContainer } from '../layouts/Containers';
import { cn } from '../utils/cn';

/**
 * Philosophy manifesto section for SHOURYA // FOUNDRY.
 * Details the product design mindset, core engineering rules,
 * and renders a self-drawing SVG technical blueprint schematic.
 */
export default function Philosophy() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Split statement lines for animation trigger
  const statementLines = [
    { text: 'FORGE WITH INTENTION.', isHeavy: true },
    { text: 'DESIGN TO FUNCTION.', isHeavy: false },
    { text: 'EXPERIENCE TO LAST.', isHeavy: true }
  ];

  // Principles array
  const principles = [
    {
      num: '01',
      title: 'INTENTION',
      desc: 'Every pixel, state transition, and visual element is derived from functional utility, never vanity decoration.'
    },
    {
      num: '02',
      title: 'REDUCTION',
      desc: 'We strip away layout noise and redundant layers to maximize rendering performance and structural clarity.'
    },
    {
      num: '03',
      title: 'PERFORMANCE',
      desc: 'Prioritizing core asset weight, frame rates, and caching to ensure interactions feel fast and precise.'
    },
    {
      num: '04',
      title: 'SYNCHRONY',
      desc: 'Aligning visual animation paths, responsive grids, and clean code logic into a singular, engineered system.'
    }
  ];

  useGSAP(() => {
    // 1. Text reveals line-by-line using vertical overflow slides
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'bottom 40%',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(
      '.manifesto-line',
      { y: '100%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out' }
    );

    // 2. Blueprint SVG lines animate (drawing themselves)
    const lines = svgRef.current.querySelectorAll('.blueprint-svg-line');
    const labels = svgRef.current.querySelectorAll('.blueprint-svg-label');
    
    tl.fromTo(
      lines,
      { scaleX: 0, scaleY: 0, opacity: 0 },
      { 
        scaleX: 1, 
        scaleY: 1, 
        opacity: 0.12, 
        duration: 1.5, 
        stagger: 0.08, 
        transformOrigin: 'center center', 
        ease: 'power3.inOut' 
      },
      '-=0.8'
    );

    // 3. SVG labels and circles fade in
    tl.fromTo(
      labels,
      { opacity: 0, scale: 0.8 },
      { opacity: 0.6, scale: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out' },
      '-=0.7'
    );

    // 4. Supporting text copy fades up
    tl.fromTo(
      '.philosophy-body',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 0.8, duration: 1.0, ease: 'power3.out' },
      '-=0.9'
    );

    // 5. Principles reveal sequentially
    tl.fromTo(
      '.principle-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, stagger: 0.12, ease: 'power3.out' },
      '-=0.7'
    );

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="philosophy"
      className="section-spacing border-t border-white/5 relative z-10 select-none"
    >
      <EditorialContainer>
        
        {/* Section Header Title */}
        <div className="flex items-center gap-2 text-label-custom text-[10px] text-accent/80 mb-12">
          <span className="accent-dot" />
          <span>[SECTION.03 // PHILOSOPHY]</span>
        </div>

        {/* Two-Column Editorial Composition */}
        <div className="grid-12 gap-y-16 items-start">
          
          {/* Left Side: Manifesto and Principles (Cols 1-7) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-start">
            
            {/* Primary Manifesto Statement */}
            <h2 className="text-display-l flex flex-col tracking-tight leading-none uppercase mb-8">
              {statementLines.map((line, idx) => (
                <span key={idx} className="block overflow-hidden py-1">
                  <span 
                    className={cn(
                      'manifesto-line inline-block opacity-0 translate-y-full will-change-transform',
                      line.isHeavy ? 'font-black text-text-primary' : 'font-extralight text-text-secondary -mt-[0.06em]'
                    )}
                  >
                    {line.text}
                  </span>
                </span>
              ))}
            </h2>

            {/* Supporting Copy (Concise paragraph 3-4 lines max) */}
            <p className="philosophy-body text-body-l text-text-secondary leading-relaxed max-w-xl mb-12 opacity-0">
              I believe in stripping away decoration to uncover raw utility. True digital craft lies at the convergence of absolute engineering performance and deliberate interface ergonomics—where motion guides content and layout geometry respects strict modular grid tracks.
            </p>

            {/* 4 Core Principles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 border-t border-white/5 pt-10">
              {principles.map((principle) => (
                <div key={principle.num} className="principle-card opacity-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] text-accent/80">{principle.num}</span>
                    <h4 className="text-label-custom text-[11px] font-medium tracking-widest">{principle.title}</h4>
                  </div>
                  <p className="text-caption-custom text-[11px] leading-relaxed text-text-secondary">
                    {principle.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Right Side: Engineered Blueprint Visual (Cols 8-12) */}
          <div className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end h-full">
            <div className="w-full max-w-[380px] aspect-[4/5] border border-dashed border-white/10 bg-surface/5 p-6 rounded-sm flex items-center justify-center relative overflow-hidden">
              
              {/* Outer visual borders */}
              <div className="absolute top-3 left-3 text-[7px] font-mono text-text-muted">[CANVAS.SYS.GRID]</div>
              <div className="absolute bottom-3 right-3 text-[7px] font-mono text-text-muted">SCALE 1:1.0</div>

              {/* Blueprint Vector Drawing */}
              <svg 
                ref={svgRef}
                className="w-full h-full opacity-90"
                viewBox="0 0 200 250"
                fill="none"
                stroke="currentColor"
              >
                {/* 12 Column layout blueprint lines */}
                <line x1="20" y1="20" x2="20" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="34" y1="20" x2="34" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="48" y1="20" x2="48" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="62" y1="20" x2="62" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="76" y1="20" x2="76" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="90" y1="20" x2="90" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="104" y1="20" x2="104" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="118" y1="20" x2="118" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="132" y1="20" x2="132" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="146" y1="20" x2="146" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="160" y1="20" x2="160" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />
                <line x1="174" y1="20" x2="174" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.5" />

                {/* Diagonal anchor guides */}
                <line x1="20" y1="20" x2="174" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.25" strokeDasharray="3 3" />
                <line x1="174" y1="20" x2="20" y2="230" className="blueprint-svg-line text-white/5" strokeWidth="0.25" strokeDasharray="3 3" />

                {/* Central structural bounding box */}
                <rect x="34" y="60" width="126" height="110" className="blueprint-svg-line text-white/10" strokeWidth="0.75" />
                
                {/* Horizontal dimension vectors */}
                <line x1="34" y1="45" x2="160" y2="45" className="blueprint-svg-line text-accent/20" strokeWidth="0.75" />
                <line x1="34" y1="40" x2="34" y2="50" className="blueprint-svg-line text-accent/20" strokeWidth="0.75" />
                <line x1="160" y1="40" x2="160" y2="50" className="blueprint-svg-line text-accent/20" strokeWidth="0.75" />

                {/* Inner component grid elements */}
                <rect x="48" y="75" width="42" height="35" className="blueprint-svg-line text-white/10" strokeWidth="0.5" />
                <rect x="104" y="75" width="42" height="35" className="blueprint-svg-line text-white/10" strokeWidth="0.5" />
                <line x1="34" y1="130" x2="160" y2="130" className="blueprint-svg-line text-white/10" strokeWidth="0.5" strokeDasharray="2 2" />

                {/* Technical crosshair ticks */}
                <circle cx="97" cy="130" r="1.5" className="blueprint-svg-label text-accent" fill="currentColor" />
                <circle cx="97" cy="130" r="4" className="blueprint-svg-label text-accent/30" strokeWidth="0.5" />
                
                <circle cx="34" cy="60" r="1.5" className="blueprint-svg-label text-white/35" fill="currentColor" />
                <circle cx="160" cy="60" r="1.5" className="blueprint-svg-label text-white/35" fill="currentColor" />
                <circle cx="34" cy="170" r="1.5" className="blueprint-svg-label text-white/35" fill="currentColor" />
                <circle cx="160" cy="170" r="1.5" className="blueprint-svg-label text-white/35" fill="currentColor" />

                {/* Blueprint Text Labels */}
                <text x="97" y="38" className="blueprint-svg-label text-accent/80 font-mono text-[7px]" fill="currentColor" textAnchor="middle">[GRID_SPAN // 9 COLS]</text>
                <text x="50" y="210" className="blueprint-svg-label text-text-muted font-mono text-[6px]" fill="currentColor">[ALIGN_INDEX: 0.16.2]</text>
                <text x="148" y="210" className="blueprint-svg-label text-text-muted font-mono text-[6px]" fill="currentColor" textAnchor="end">[X: 40.71_Y: -74.00]</text>
              </svg>

            </div>
          </div>

        </div>

      </EditorialContainer>
    </section>
  );
}
