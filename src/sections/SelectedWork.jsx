import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { ShowcaseContainer } from '../layouts/Containers';
import { cn } from '../utils/cn';

/**
 * Project data structure outlining technical engineering details.
 * Focuses on Problem, Approach, and Outcome (Case Study style).
 */
const projects = [
  {
    id: '01',
    name: 'DEVSTAGE',
    tagline: 'CONTAINER ORCHESTRATION PIPELINE',
    problem: 'Manual multi-environment configuration was causing slow deployment cycles and visual discrepancies.',
    approach: 'Engineered an automated container pipeline compiled with instant layout preview servers.',
    outcome: 'Reduced deployment feedback cycles from 40 minutes to under 30 seconds.',
    tech: ['React', 'Docker', 'Node.js', 'AWS ECS'],
    gridSpan: 'col-span-12 lg:col-span-7',
    previewType: 'terminal'
  },
  {
    id: '02',
    name: 'PLACEPRO',
    tagline: 'MATCHING ENGINE & PORTFOLIO COMPILER',
    problem: 'Candidates lacked centralized channels to compile profiles and match with opportunities.',
    approach: 'Forged a high-throughput matching engine using reactive scoring and cached compiler buffers.',
    outcome: 'Connected 1,200+ active candidates with recruit pipelines in local Delhi hubs.',
    tech: ['Next.js', 'PostgreSQL', 'Redis', 'Node'],
    gridSpan: 'col-span-12 lg:col-span-5',
    previewType: 'graph'
  },
  {
    id: '03',
    name: 'EVENTRA',
    tagline: 'WEBSOCKET STATE MACHINE ENGINE',
    problem: 'Real-time multi-user event synchronization suffered from heavy socket delay and grid layout shifts.',
    approach: 'Built a websocket state machine synchronizing coordinate grids across visual client states.',
    outcome: 'Successfully scaled transaction capacities to 10k concurrent active visual states.',
    tech: ['React', 'Go', 'WebSockets', 'Docker'],
    gridSpan: 'col-span-12 lg:col-span-8',
    previewType: 'pulse'
  }
];

export default function SelectedWork() {
  const containerRef = useRef(null);

  // GSAP ScrollTrigger clip-path slide reveal
  useGSAP(() => {
    const panels = gsap.utils.toArray('.project-card');
    
    panels.forEach((panel) => {
      // Reveal the card using clipPath and fade text inside
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          end: 'bottom 50%',
          toggleActions: 'play none none reverse',
        }
      });

      tl.fromTo(
        panel,
        { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.3 },
        { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.4, ease: 'power4.out' }
      );

      tl.fromTo(
        panel.querySelectorAll('.card-fade-up'),
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
        '-=0.8'
      );
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="selected-work"
      className="section-spacing border-t border-white/5 relative z-10 select-none"
    >
      <ShowcaseContainer>
        
        {/* Section Header Title & Statement */}
        <div className="grid-12 heading-gap">
          <div className="col-span-12 lg:col-span-4 flex flex-col items-start justify-start">
            {/* Small architectural label */}
            <div className="flex items-center gap-2 text-label-custom text-[10px] text-accent/80 mb-4">
              <span className="accent-dot" />
              <span>[SECTION.02 // SELECTED_WORK]</span>
            </div>
            <h2 className="text-display-l text-text-primary">SELECTED<br />WORK</h2>
          </div>

          <div className="col-span-12 lg:col-span-8 flex items-end">
            <p className="text-section-subtitle font-light leading-relaxed max-w-2xl">
              Products, platforms and experiences forged through design, engineering and technical experimentation.
            </p>
          </div>
        </div>

        {/* Modular Case Study Grid */}
        <div className="grid-12 gap-y-16 lg:gap-y-24 items-stretch">
          {projects.map((project, idx) => (
            <React.Fragment key={project.id}>
              {/* Asymmetrical Project Card */}
              <motion.div
                className={cn(
                  'project-card surface-elevated hover-lift flex flex-col justify-between overflow-hidden rounded-sm',
                  project.gridSpan
                )}
                initial="initial"
                whileHover="hover"
                viewport={{ once: true }}
              >
                {/* Visual Preview Area */}
                <div className="w-full bg-[#161616] border-b border-white/5 relative overflow-hidden aspect-[16/9]">
                  {/* Blueprint visual schemas */}
                  <div className="absolute inset-0 opacity-[0.25] pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
                  </div>

                  {/* Render Custom SVG Blueprints */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    {project.previewType === 'terminal' && (
                      <TerminalBlueprint />
                    )}
                    {project.previewType === 'graph' && (
                      <GraphBlueprint />
                    )}
                    {project.previewType === 'pulse' && (
                      <PulseBlueprint />
                    )}
                  </div>

                  {/* Panel Coordinates and Tech Indicator Overlay */}
                  <div className="absolute top-4 left-4 font-mono text-[8px] text-text-muted">
                    [STAGE.SYS.{project.id}]
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {/* Active accent highlight dot */}
                    <motion.div 
                      className="w-1.5 h-1.5 bg-text-muted rounded-full"
                      variants={{
                        hover: { backgroundColor: '#C96A2B', scale: 1.2 }
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="font-mono text-[8px] text-text-muted">ONLINE</span>
                  </div>
                </div>

                {/* Content Panel Area */}
                <div className="card-padding flex-1 flex flex-col justify-between gap-8">
                  
                  {/* Top metadata row */}
                  <div className="flex justify-between items-start card-fade-up">
                    <div>
                      <span className="text-caption-custom font-mono text-[9px] block text-accent/80 tracking-widest mb-1">
                        {project.tagline}
                      </span>
                      <h3 className="text-display-l text-text-primary text-[24px] lg:text-[28px] leading-tight font-medium tracking-tight">
                        {project.name}
                      </h3>
                    </div>
                    <span className="font-mono text-text-muted text-[16px] font-light">
                      {project.id}
                    </span>
                  </div>

                  {/* Problem / Approach / Outcome grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6 card-fade-up">
                    <div className="space-y-1">
                      <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase block">[01 // PROBLEM]</span>
                      <p className="text-caption-custom text-[11px] leading-relaxed text-text-secondary">
                        {project.problem}
                      </p>
                    </div>
                    <div className="space-y-1 border-l border-dashed border-white/5 pl-4 md:pl-6">
                      <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase block">[02 // APPROACH]</span>
                      <p className="text-caption-custom text-[11px] leading-relaxed text-text-secondary">
                        {project.approach}
                      </p>
                    </div>
                    <div className="space-y-1 border-l border-dashed border-white/5 pl-4 md:pl-6">
                      <span className="font-mono text-[8px] text-text-muted tracking-wider uppercase block">[03 // OUTCOME]</span>
                      <p className="text-caption-custom text-[11px] leading-relaxed text-text-primary font-medium">
                        {project.outcome}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row: Tech Tagline and CTA */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-white/5 pt-5 gap-4 card-fade-up">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-surface border border-white/5 text-[9px] font-mono text-text-secondary uppercase rounded-xs">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Subtle micro-shift CTA */}
                    <motion.div 
                      className="flex items-center gap-2 cursor-pointer group"
                      variants={{
                        hover: { x: 4 }
                      }}
                      transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                    >
                      <span className="text-label-custom text-[9px] text-text-secondary group-hover:text-accent transition-colors duration-300">
                        VIEW CASE STUDY
                      </span>
                      <span className="text-[10px] text-text-muted group-hover:text-accent transition-colors duration-300">➔</span>
                    </motion.div>
                  </div>

                </div>
              </motion.div>

              {/* Editorial Stats Block injected next to Eventra (Project 3) */}
              {project.id === '03' && (
                <div className="hidden lg:flex col-span-4 border border-dashed border-white/10 rounded-sm card-padding flex-col justify-between min-h-[360px] opacity-[0.8] select-none">
                  <div>
                    <div className="text-caption-custom font-mono text-[9px] text-accent/80 mb-2">[BLUEPRINT_METRICS]</div>
                    <div className="space-y-6 mt-6">
                      <div className="font-mono text-[9px] text-text-secondary">
                        <span className="text-text-muted block mb-1">TOTAL_BUILDS</span>
                        <span>03 SELECTED // 12 INDEXED</span>
                      </div>
                      <div className="font-mono text-[9px] text-text-secondary">
                        <span className="text-text-muted block mb-1">VISUAL_ENGINE</span>
                        <span>GSAP SCROLLTRIGGER // FM.PRESETS</span>
                      </div>
                      <div className="font-mono text-[9px] text-text-secondary">
                        <span className="text-text-muted block mb-1">STATION_LOG</span>
                        <span> delhi.in // stable.devstage</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-caption-custom font-mono text-[8px] text-text-muted">
                    ALIGN: RIGHT_COLUMN // GRID: COLS 9-12
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </ShowcaseContainer>
    </section>
  );
}

/* ==========================================================
   SVG Technical Blueprint Visual Schemas (Preview Zone placeholders)
   ========================================================== */

function TerminalBlueprint() {
  return (
    <div className="w-[85%] h-[80%] border border-white/5 bg-[#121212] rounded-xs font-mono text-[9px] p-4 flex flex-col justify-between overflow-hidden shadow-industrial">
      <div className="flex justify-between border-b border-white/5 pb-2 text-text-muted text-[8px]">
        <span>CONTAINER: DEVSTAGE_01 // SHELL</span>
        <span>ONLINE</span>
      </div>
      <div className="space-y-1.5 my-auto text-text-secondary">
        <div className="text-green-500/80">$ npm run build</div>
        <div className="text-text-muted">✓ transforming modules... (297/297)</div>
        <div className="text-accent/80">➜ bundles optimized. [dist/assets/index.js]</div>
        <div className="text-text-muted">✓ container image compiled successfully.</div>
      </div>
      <div className="flex justify-between items-center text-[7px] text-text-muted pt-2 border-t border-white/5">
        <span>PORT: 5173</span>
        <span>PING: 12ms</span>
      </div>
    </div>
  );
}

function GraphBlueprint() {
  return (
    <div className="w-[85%] h-[80%] border border-white/5 bg-[#121212] rounded-xs p-4 flex flex-col justify-between relative shadow-industrial">
      <div className="flex justify-between items-center text-[8px] font-mono text-text-muted">
        <span>RELATION_MATRIX // PLACEMENT</span>
        <span>LATENCY: 4ms</span>
      </div>
      
      {/* Visual blueprint line connecting nodes */}
      <svg className="w-full h-[60%] my-auto opacity-70" viewBox="0 0 100 60">
        {/* Draw blueprint grid */}
        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        
        {/* Draw graph nodes */}
        <circle cx="20" cy="40" r="1.5" fill="#666" />
        <circle cx="50" cy="20" r="1.5" fill="#666" />
        <circle cx="80" cy="45" r="1.5" fill="#666" />
        <path d="M 20 40 L 50 20 L 80 45" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" strokeDasharray="3 3" />
        
        {/* Accent matched node */}
        <circle cx="50" cy="20" r="2.5" fill="#C96A2B" />
        <circle cx="50" cy="20" r="4.5" fill="none" stroke="#C96A2B" strokeWidth="0.5" className="animate-ping" style={{ transformOrigin: '50px 20px' }} />
      </svg>
      
      <div className="flex justify-between items-center text-[7px] font-mono text-text-muted">
        <span>NODES: 1,200 compiler buffers</span>
        <span>COMP.STAGE: COMPLETE</span>
      </div>
    </div>
  );
}

function PulseBlueprint() {
  return (
    <div className="w-[85%] h-[80%] border border-white/5 bg-[#121212] rounded-xs p-4 flex flex-col justify-between relative shadow-industrial">
      <div className="flex justify-between items-center text-[8px] font-mono text-text-muted">
        <span>STATE_MACHINE // WS_SOCKETS</span>
        <span>FREQ: 60Hz</span>
      </div>
      
      {/* Active pulse chart SVG */}
      <svg className="w-full h-[60%] my-auto opacity-70" viewBox="0 0 100 60">
        <path 
          d="M 0 30 L 30 30 L 35 10 L 40 50 L 45 30 L 60 30 L 65 15 L 70 45 L 75 30 L 100 30" 
          fill="none" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1" 
        />
        {/* Accent peak pulse line */}
        <path 
          d="M 30 30 L 35 10 L 40 50 L 45 30" 
          fill="none" 
          stroke="#C96A2B" 
          strokeWidth="1.2" 
        />
        <circle cx="35" cy="10" r="2" fill="#C96A2B" />
      </svg>
      
      <div className="flex justify-between items-center text-[7px] font-mono text-text-muted">
        <span>CONN: 10,000 ACTIVE</span>
        <span>OUTCOME: STABLE</span>
      </div>
    </div>
  );
}
