import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { EditorialContainer } from '../layouts/Containers';
import { cn } from '../utils/cn';

/**
 * Milestone progression data outlining growth and growth transitions.
 */
const milestones = [
  {
    id: '01',
    year: 'YR.19',
    title: 'SCHOOL',
    desc: 'Root node. Initiating logical reasoning, basic scripting, and algorithms.',
    position: 'top'
  },
  {
    id: '02',
    year: 'YR.21',
    title: 'JEE PREPARATION',
    desc: 'Logical load testing. Developing quantitative optimization mindset under limits.',
    position: 'bottom'
  },
  {
    id: '03',
    year: 'YR.22',
    title: 'GGSIPU USAR',
    desc: 'System initialization. Immersing in robotics engineering and IIoT interfaces.',
    position: 'top'
  },
  {
    id: '04',
    year: 'YR.23',
    title: 'SIH HACKATHON',
    desc: 'Parallel execution. Forging real-world solutions under high-pressure tracks.',
    position: 'bottom'
  },
  {
    id: '05',
    year: 'YR.24',
    title: 'STAGE INTERNSHIP',
    desc: 'Integration phase. Working on production codebases and developer systems.',
    position: 'top'
  },
  {
    id: '06',
    year: 'ACTIVE',
    title: 'BUILDING PRODUCTS',
    desc: 'Active deployment. Crafting visual interfaces and production-grade systems.',
    position: 'bottom',
    isCurrent: true
  }
];

export default function Journey() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'bottom 30%',
        toggleActions: 'play none none reverse',
      }
    });

    // 1. Draw timeline spine line
    if (isMobile) {
      tl.fromTo(
        '.timeline-spine-v',
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 0.15, duration: 1.5, transformOrigin: 'top', ease: 'power3.inOut' }
      );
    } else {
      tl.fromTo(
        '.timeline-spine-h',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.15, duration: 1.6, transformOrigin: 'left', ease: 'power3.inOut' }
      );
    }

    // 2. Animate nodes materializing (fade + scale)
    tl.fromTo(
      '.timeline-node',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
      '-=0.8'
    );

    // 3. Staggered reveal of text details
    tl.fromTo(
      '.timeline-card-animate',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out' },
      '-=0.6'
    );

    // 4. Emphasize active node
    tl.fromTo(
      '.active-pulse',
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    );

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="journey"
      className="section-spacing border-t border-white/5 relative z-10 select-none overflow-hidden"
    >
      <EditorialContainer>
        
        {/* Section Index Header */}
        <div className="flex items-center gap-2 text-label-custom text-[10px] text-accent/80 mb-12">
          <span className="accent-dot" />
          <span>[SECTION.04 // JOURNEY_EVOLUTION]</span>
        </div>

        {/* Section Intro Heading */}
        <div className="heading-gap max-w-4xl">
          <h2 className="text-section-heading text-text-primary mb-6">
            Every complex system<br />
            has a root node.
          </h2>
          <div className="h-[1px] bg-white/10 w-24 transform origin-left" />
        </div>

        {/* Timeline Container */}
        <div className="relative pt-12 pb-24 md:py-32">
          
          {/* ==========================================================
              Desktop/Tablet Layout (Horizontal Timeline >= 768px)
             ========================================================== */}
          <div className="hidden md:block relative w-full">
            {/* Horizontal Timeline Spine */}
            <div className="timeline-spine-h absolute top-1/2 left-0 right-0 h-[1px] bg-white pointer-events-none z-0" />

            {/* Milestones Grid (6 columns) */}
            <div className="grid grid-cols-6 gap-6 relative z-10">
              {milestones.map((m, idx) => (
                <div 
                  key={m.id} 
                  className={cn(
                    'flex flex-col items-center relative',
                    // Shift text block above or below the spine
                    m.position === 'top' ? 'justify-end pb-[120px] h-[240px] -translate-y-[120px]' : 'justify-start pt-[120px] h-[240px] translate-y-[120px]'
                  )}
                >
                  {/* content card */}
                  <div className="timeline-card-animate w-full text-center space-y-2 opacity-0">
                    <span className="font-mono text-[8px] text-text-muted">
                      {m.id} // {m.year}
                    </span>
                    <h3 className="text-label-custom text-[11px] font-semibold text-text-primary tracking-widest uppercase">
                      {m.title}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-text-secondary max-w-[160px] mx-auto">
                      {m.desc}
                    </p>
                  </div>

                  {/* Vertical connector tick line pointing to timeline */}
                  <div 
                    className={cn(
                      'timeline-node absolute left-1/2 -translate-x-1/2 w-[1px] bg-white/20',
                      m.position === 'top' ? 'bottom-0 h-10' : 'top-0 h-10'
                    )}
                  />

                  {/* Intersection Node */}
                  <div 
                    className={cn(
                      'timeline-node absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border bg-[#111111] z-10 flex items-center justify-center',
                      m.position === 'top' ? 'bottom-0 translate-y-1.5' : 'top-0 -translate-y-1.5',
                      m.isCurrent ? 'border-accent' : 'border-white/20'
                    )}
                  >
                    {m.isCurrent && (
                      <span className="active-pulse w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ==========================================================
              Mobile Layout (Vertical Timeline < 768px)
             ========================================================== */}
          <div className="block md:hidden relative w-full pl-6">
            {/* Vertical Timeline Spine */}
            <div className="timeline-spine-v absolute top-0 bottom-0 left-2 w-[1px] bg-white pointer-events-none z-0" />

            {/* Milestones Stack */}
            <div className="space-y-16 relative z-10">
              {milestones.map((m) => (
                <div key={m.id} className="relative pl-6 flex flex-col justify-start">
                  
                  {/* Intersection Node on the left spine */}
                  <div 
                    className={cn(
                      'timeline-node absolute left-[-22px] top-1.5 w-3 h-3 rounded-full border bg-[#111111] z-10 flex items-center justify-center',
                      m.isCurrent ? 'border-accent' : 'border-white/20'
                    )}
                  >
                    {m.isCurrent && (
                      <span className="active-pulse w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* content card */}
                  <div className="timeline-card-animate space-y-1 opacity-0">
                    <span className="font-mono text-[8px] text-text-muted">
                      {m.id} // {m.year}
                    </span>
                    <h3 className="text-label-custom text-[11px] font-semibold text-text-primary tracking-widest uppercase">
                      {m.title}
                    </h3>
                    <p className="text-[10px] leading-relaxed text-text-secondary max-w-sm">
                      {m.desc}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

      </EditorialContainer>
    </section>
  );
}
