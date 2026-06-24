import React, { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';

/**
 * GridBackground renders an interactive, double-layered architectural blueprint grid.
 * It includes technical ticks, coordinates, a cursor-reactive spotlight, and scroll parallax.
 */
export default function GridBackground() {
  const containerRef = useRef(null);
  const majorGridRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Mouse movement tracking for technical cursor spotlight
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update custom properties on the container for css-based radial spotlight
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 2. GSAP Scroll Parallax between layers
    const ctx = gsap.context(() => {
      // Background major grid moves slightly slower
      gsap.to(majorGridRef.current, {
        y: '6%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });

      // Layout details/coordinates move at a slightly different rate
      gsap.to(detailsRef.current, {
        y: '-4%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });
    }, container);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none bg-[#111111]"
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%'
      }}
    >
      {/* Layer 1: Global Ultra-Fine Grid (Faint structural layout, static) */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Layer 2: Major Architectural Grid (Parallax-bound + Cursor spotlight reactive) */}
      <div 
        ref={majorGridRef}
        className="absolute inset-0 opacity-[0.035] transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          // Spotlight effect: reveals grid details more clearly around mouse cursor
          maskImage: 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), black 20%, rgba(0, 0, 0, 0.2) 100%)',
          WebkitMaskImage: 'radial-gradient(circle 350px at var(--mouse-x) var(--mouse-y), black 20%, rgba(0, 0, 0, 0.2) 100%)',
        }}
      />

      {/* Layer 3: Technical blueprints & indicators (Subtle layout marks, coordinates, parallaxed) */}
      <div ref={detailsRef} className="absolute inset-0 w-full h-full opacity-[0.04]">
        {/* Horizontal scale line */}
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
        
        {/* Vertical alignment line */}
        <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-white to-transparent" />
        
        {/* Coordinates labels */}
        <div className="absolute top-12 left-12 text-[9px] font-mono text-white tracking-[0.2em]">
          [SYS.INIT // SHOURYA.FOUNDRY]
        </div>
        <div className="absolute top-1/4 left-16 text-[8px] font-mono text-white tracking-[0.1em]">
          IIOT / USAR // DELHI, INDIA
        </div>
        <div className="absolute bottom-12 right-12 text-[9px] font-mono text-white tracking-[0.1em]">
          [SCALE 1:1.00]
        </div>
        
        {/* Fine crosshairs at specific layout intersections */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-4 h-[1px] bg-white absolute" />
          <div className="h-4 w-[1px] bg-white absolute" />
        </div>
        <div className="absolute top-2/3 left-2/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="w-4 h-[1px] bg-white absolute" />
          <div className="h-4 w-[1px] bg-white absolute" />
        </div>
      </div>

      {/* Ambient gradient glow - subtle accent highlight */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px] pointer-events-none"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
    </div>
  );
}
