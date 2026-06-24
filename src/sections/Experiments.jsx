import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { ShowcaseContainer } from '../layouts/Containers';
import { cn } from '../utils/cn';

/**
 * Experiments Section (Section 07) for SHOURYA // FOUNDRY.
 * A modular playground displaying motion studies, interactions,
 * and vector schematic experiments.
 */
export default function Experiments() {
  const containerRef = useRef(null);

  // GSAP Entrance reveals for all experiment modules
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 75%',
        end: 'bottom 40%',
        toggleActions: 'play none none reverse',
      }
    });

    // 1. Draw structural title underline
    tl.fromTo(
      '.experiments-title-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2, transformOrigin: 'left', ease: 'power3.inOut' }
    );

    // 2. Staggered reveal of experiment cards
    tl.fromTo(
      '.experiment-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: 'power3.out' },
      '-=0.8'
    );

    // 3. Staggered reveal of internal vector elements
    tl.fromTo(
      '.blueprint-element',
      { opacity: 0, scale: 0.9 },
      { opacity: 0.6, scale: 1, duration: 0.8, stagger: 0.05, ease: 'power2.out' },
      '-=0.6'
    );

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="experiments"
      className="section-spacing border-t border-white/5 relative z-10 select-none overflow-hidden"
    >
      <ShowcaseContainer>
        
        {/* Section Index Header & Massive Editorial Title */}
        <div className="grid-12 heading-gap">
          <div className="col-span-12 lg:col-span-4 flex flex-col items-start justify-start">
            <div className="flex items-center gap-2 text-label-custom text-[10px] text-accent/80 mb-4">
              <span className="accent-dot" />
              <span>[SECTION.05 // EXPERIMENTS]</span>
            </div>
            
            {/* Title with editorial weight tension */}
            <h2 className="text-display-l leading-none tracking-tight uppercase flex flex-col">
              <span className="font-black text-text-primary">07 //</span>
              <span className="font-extralight text-text-secondary -mt-1">EXPERIMENTS</span>
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-8 flex flex-col justify-end">
            <p className="text-section-subtitle font-light leading-relaxed max-w-2xl">
              A collision of pure geometry, tactile interactions, and animation studies forged in the digital workshop.
            </p>
            <div className="experiments-title-line h-[1px] bg-white/10 w-full mt-8 transform origin-left" />
          </div>
        </div>

        {/* Asymmetrical Workshop Workspace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ==========================================================
              1. Centerpiece Panel: Interactive Grid Study (Cols 1-8)
             ========================================================== */}
          <div className="col-span-1 md:col-span-2 lg:col-span-8">
            <InteractiveGridStudy />
          </div>

          {/* ==========================================================
              2. Variable Typography Sandbox (Cols 9-12)
             ========================================================== */}
          <div className="col-span-1 lg:col-span-4">
            <TypographySandbox />
          </div>

          {/* ==========================================================
              3. Grid Reactions Crosshair Blueprint (Cols 1-4)
             ========================================================== */}
          <div className="col-span-1 lg:col-span-4">
            <GridReactions />
          </div>

          {/* ==========================================================
              4. Scroll Dial Rotation Simulator (Cols 5-8)
             ========================================================== */}
          <div className="col-span-1 lg:col-span-4">
            <ScrollDialSimulator />
          </div>

          {/* ==========================================================
              5. Tactile Control Interface Sandbox (Cols 9-12)
             ========================================================== */}
          <div className="col-span-1 lg:col-span-4">
            <ControlInterface />
          </div>

          {/* ==========================================================
              6. Motion Easing Studies Track (Cols 1-12)
             ========================================================== */}
          <div className="col-span-1 md:col-span-2 lg:col-span-12">
            <MotionEasingStudies />
          </div>

        </div>

      </ShowcaseContainer>
    </section>
  );
}

/* ============================================================================
   1. Interactive Grid Study (Standout Centerpiece Panel)
   ============================================================================ */
function InteractiveGridStudy() {
  const centerpieceRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  // SVG grid configuration
  const cols = 15;
  const rows = 9;
  const spacingX = 28;
  const spacingY = 24;
  const offsetX = 32;
  const offsetY = 28;
  const maxDistance = 65; // Influence radius

  const handleMouseMove = (e) => {
    if (!centerpieceRef.current) return;
    const rect = centerpieceRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
    setIsHovered(false);
  };

  // Generate grid points and compute displacements dynamically
  const gridDots = useMemo(() => {
    const dots = [];
    let active = 0;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const cx = offsetX + c * spacingX;
        const cy = offsetY + r * spacingY;
        
        // Base coordinate positions
        let px = cx;
        let py = cy;
        let isDisplaced = false;

        if (isHovered) {
          const dx = cx - mousePos.x;
          const dy = cy - mousePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && distance > 0) {
            const force = (maxDistance - distance) / maxDistance;
            const strength = force * 14; // Max offset displacement
            px += (dx / distance) * strength;
            py += (dy / distance) * strength;
            isDisplaced = true;
            active++;
          }
        }

        dots.push({
          id: `${c}-${r}`,
          cx,
          cy,
          px,
          py,
          isDisplaced
        });
      }
    }

    return { dots, active };
  }, [mousePos, isHovered]);

  // Sync active count state to update coordinates readout
  useEffect(() => {
    setActiveCount(gridDots.active);
  }, [gridDots.active]);

  return (
    <motion.div
      ref={centerpieceRef}
      className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between select-none min-h-[380px] relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Blueprint background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:28px_24px] pointer-events-none opacity-40" />

      {/* Header coordinates readout */}
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
            [TRIAL.SYS.01 // CENTERPIECE]
          </span>
          <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase">
            Interactive Grid Study
          </h3>
        </div>

        {/* HUD Data Readout */}
        <div className="text-right font-mono text-[8px] text-text-muted space-y-0.5">
          <div>READOUT: {isHovered ? 'ACTIVE' : 'STANDBY'}</div>
          <div>DISPLACED_NODES: {activeCount} // 135</div>
          <div>COORD: {isHovered ? `[X: ${mousePos.x.toFixed(0)}, Y: ${mousePos.y.toFixed(0)}]` : '[X: 000, Y: 000]'}</div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="w-full flex-1 flex items-center justify-center min-h-[220px] relative z-10">
        <svg className="w-full h-full max-h-[250px]" viewBox="0 0 450 250">
          {/* Outer alignment guidelines */}
          <rect x="10" y="10" width="430" height="230" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" strokeDasharray="3 3" />
          
          {/* Active spotlight coordinates crosshair inside canvas */}
          {isHovered && (
            <g className="opacity-25">
              <line x1="10" y1={mousePos.y} x2="440" y2={mousePos.y} stroke="#C96A2B" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1={mousePos.x} y1="10" x2={mousePos.x} y2="240" stroke="#C96A2B" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx={mousePos.x} cy={mousePos.y} r="2" fill="#C96A2B" />
              <circle cx={mousePos.x} cy={mousePos.y} r="8" fill="none" stroke="#C96A2B" strokeWidth="0.5" />
            </g>
          )}

          {/* Grid Dots */}
          {gridDots.dots.map((dot) => (
            <circle
              key={dot.id}
              cx={dot.px}
              cy={dot.py}
              r={dot.isDisplaced ? 1.5 : 1}
              fill={dot.isDisplaced ? '#C96A2B' : 'rgba(255,255,255,0.15)'}
              className="transition-all duration-300 ease-out"
            />
          ))}
        </svg>
      </div>

      {/* Footer system details */}
      <div className="flex justify-between items-end border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted z-10">
        <span>MATH.DISPLACEMENT // VECTOR_RADIAL</span>
        <span>Delhi Foundry Workspace // EST.2007</span>
      </div>
    </motion.div>
  );
}

/* ============================================================================
   2. Typography Motion Sandbox
   ============================================================================ */
function TypographySandbox() {
  const words = ['VARIABLE', 'WEIGHT', 'MOTION', 'KINETIC', 'GEOMETRY', 'FOUNDRY'];
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between min-h-[380px]">
      <div>
        <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
          [TRIAL.SYS.02]
        </span>
        <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase mb-6">
          Typography Wave
        </h3>

        {/* Interactive Text Sandbox */}
        <div className="flex flex-col gap-3 pt-4 select-none">
          {words.map((word, idx) => {
            // wave weights mapping
            let weight = 200;
            let opacity = 0.5;

            if (hoveredIdx === idx) {
              weight = 900;
              opacity = 1;
            } else if (hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1) {
              weight = 500;
              opacity = 0.8;
            } else if (hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 2) {
              weight = 300;
              opacity = 0.6;
            }

            return (
              <span
                key={word}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ 
                  fontWeight: weight, 
                  opacity: opacity,
                  transition: 'font-weight 0.25s ease-out, opacity 0.25s ease-out' 
                }}
                className="text-[22px] tracking-widest uppercase cursor-pointer text-text-primary select-none w-fit"
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted flex justify-between items-center">
        <span>VARIABLE_WEIGHT // WAVE_SMOOTH</span>
        <span>SYS_VAR: [100-900]</span>
      </div>
    </div>
  );
}

/* ============================================================================
   3. Grid Reactions (Crosshair Blueprint)
   ============================================================================ */
function GridReactions() {
  const panelRef = useRef(null);
  const [crosshair, setCrosshair] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshair({ x, y });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={panelRef}
      className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between min-h-[340px] relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 2x2 grid lines */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none" />

      {/* Interactive hover crosshairs */}
      {isHovered && (
        <>
          <div 
            className="absolute left-0 right-0 h-[1px] bg-accent/25 pointer-events-none" 
            style={{ top: `${crosshair.y}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-accent/25 pointer-events-none" 
            style={{ left: `${crosshair.x}%` }}
          />
        </>
      )}

      <div>
        <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
          [TRIAL.SYS.03]
        </span>
        <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase mb-2">
          Grid Coordinate Reaction
        </h3>
        <p className="text-[10px] text-text-secondary leading-relaxed max-w-[220px]">
          Hover to project horizontal and vertical coordinate lines across grid lines.
        </p>
      </div>

      {/* Center blueprint readout */}
      <div className="flex-1 flex items-center justify-center">
        <div className="font-mono text-[9px] text-text-secondary border border-dashed border-white/10 p-4 rounded-sm bg-[#181818]/50 min-w-[140px] text-center space-y-1">
          <div className="text-text-muted">[SUBGRID_COORDS]</div>
          <div className="text-accent">X_AXIS: {isHovered ? `${crosshair.x.toFixed(1)}%` : '50.0%'}</div>
          <div className="text-accent">Y_AXIS: {isHovered ? `${crosshair.y.toFixed(1)}%` : '50.0%'}</div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted flex justify-between items-center">
        <span>CROSSHAIR_ALIGN // REALTIME_CLIP</span>
        <span>GRID: 2X2 // POS_READ</span>
      </div>
    </div>
  );
}

/* ============================================================================
   4. Scroll Dial Simulator
   ============================================================================ */
function ScrollDialSimulator() {
  const dialRef = useRef(null);
  const containerRef = useRef(null);

  // Bind GSAP ScrollTrigger to rotate the visual dial based on scroll progress
  useGSAP(() => {
    gsap.fromTo(
      dialRef.current,
      { rotate: 0 },
      {
        rotate: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between min-h-[340px]"
    >
      <div>
        <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
          [TRIAL.SYS.04]
        </span>
        <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase mb-2">
          Scroll-Bound Dial
        </h3>
        <p className="text-[10px] text-text-secondary leading-relaxed max-w-[220px]">
          The dial vector rotates dynamically based on the current viewport vertical position.
        </p>
      </div>

      {/* Visual Rotating Dial */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div ref={dialRef} className="w-24 h-24 rounded-full border border-dashed border-white/10 flex items-center justify-center relative">
          
          {/* Inner ticks and pointer guidelines */}
          <div className="absolute top-1 bottom-1 left-1/2 w-[1px] bg-white/10 -translate-x-1/2" />
          <div className="absolute left-1 right-1 top-1/2 h-[1px] bg-white/10 -translate-y-1/2" />
          
          {/* Core rotating center point and indicator needle */}
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-[#1c1c1c]">
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-2 bottom-1/2 left-1/2 w-[1.5px] bg-accent -translate-x-1/2 origin-bottom" />
          </div>

          {/* Exterior blueprint coordinate tags */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[6px] text-text-muted">000°</div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 font-mono text-[6px] text-text-muted">090°</div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 font-mono text-[6px] text-text-muted">180°</div>
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 font-mono text-[6px] text-text-muted">270°</div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted flex justify-between items-center">
        <span>TIMELINE_DIAL // GSAP_SCRUB</span>
        <span>INDEX: ANGLE_SYS // ROT.Z</span>
      </div>
    </div>
  );
}

/* ============================================================================
   5. Tactile Control Interface
   ============================================================================ */
function ControlInterface() {
  const [sliderVal, setSliderVal] = useState(50);
  const [switches, setSwitches] = useState({
    TRIAL_A: true,
    TRIAL_B: false,
    TRIAL_C: true
  });

  const handleToggle = (key) => {
    setSwitches(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between min-h-[340px]">
      <div>
        <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
          [TRIAL.SYS.05]
        </span>
        <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase mb-4">
          Tactile Control Panel
        </h3>

        {/* Industrial Interface Mockups */}
        <div className="space-y-6 pt-2">
          
          {/* Custom Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-[8px] text-text-secondary">
              <span>VARIABLE_FREQUENCY // RES.X</span>
              <span className="text-accent">{sliderVal}%</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full accent-accent bg-white/5 h-[2px] rounded-xs cursor-pointer focus:outline-none"
              />
            </div>
            <div className="flex justify-between font-mono text-[6px] text-text-muted">
              <span>MIN // 0.0</span>
              <span>MED // 50.0</span>
              <span>MAX // 100.0</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2.5">
            <div className="font-mono text-[8px] text-text-secondary mb-1">MODULE_TRIGGERS // CALIBRATION</div>
            
            {Object.entries(switches).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center border border-dashed border-white/5 px-3 py-1.5 bg-[#181818] rounded-xs">
                <span className="font-mono text-[8px] text-text-secondary">{key}</span>
                <button
                  onClick={() => handleToggle(key)}
                  className={cn(
                    'w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none border',
                    val ? 'bg-accent/20 border-accent/40' : 'bg-white/5 border-white/10'
                  )}
                >
                  <div 
                    className={cn(
                      'w-2 h-2 rounded-full transition-transform duration-200',
                      val ? 'bg-accent translate-x-4' : 'bg-text-secondary translate-x-0'
                    )}
                  />
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted flex justify-between items-center">
        <span>TACTILE_STATE // REACT_BIND</span>
        <span>STATUS: {switches.TRIAL_A ? 'ACTIVE' : 'STANDBY'} // FREQ: {sliderVal * 4}Hz</span>
      </div>
    </div>
  );
}

/* ============================================================================
   6. Motion Easing Studies Track
   ============================================================================ */
function MotionEasingStudies() {
  const [activeCurve, setActiveCurve] = useState('sine');

  // Easing curve coordinates mapping
  const curvePaths = {
    sine: 'M 20 100 C 60 100, 40 20, 180 20', // ease-in-out
    expo: 'M 20 100 C 120 100, 160 80, 180 20', // ease-in
    quad: 'M 20 100 C 20 40, 100 20, 180 20' // ease-out
  };

  return (
    <div className="experiment-card surface-elevated border border-white/5 rounded-sm p-6 flex flex-col justify-between min-h-[300px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Info & Selectors (Cols 1-5) */}
        <div className="col-span-1 lg:col-span-5 space-y-4">
          <div>
            <span className="text-[8px] font-mono text-accent/90 tracking-widest block uppercase mb-1">
              [TRIAL.SYS.06 // VISUALIZER]
            </span>
            <h3 className="text-label-custom text-[11px] font-semibold tracking-wider text-text-primary uppercase mb-2">
              Motion Easing Curves
            </h3>
            <p className="text-[10px] text-text-secondary leading-relaxed max-w-sm">
              Comparative study of transition easing formulas. Hover to trigger kinetic particles traveling along specific curves.
            </p>
          </div>

          {/* Selectors Button Stack */}
          <div className="flex gap-2">
            {Object.keys(curvePaths).map((curve) => (
              <button
                key={curve}
                onClick={() => setActiveCurve(curve)}
                className={cn(
                  'px-3 py-1 font-mono text-[8px] tracking-wider uppercase rounded-xs border transition-colors focus:outline-none',
                  activeCurve === curve
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-white/5 bg-[#181818] text-text-secondary hover:border-white/10'
                )}
              >
                {curve}
              </button>
            ))}
          </div>
        </div>

        {/* Right Curve Plot visualizer (Cols 6-12) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col md:flex-row gap-6 items-center justify-end w-full">
          
          {/* Active travel track demo */}
          <div className="w-full max-w-[200px] space-y-4 border border-dashed border-white/5 bg-[#181818]/60 p-4 rounded-sm relative">
            <span className="absolute top-2 left-2 text-[6px] font-mono text-text-muted">[TRAVEL_TRACK]</span>
            
            <div className="pt-4 pb-2 space-y-2">
              <div className="h-1 w-full bg-white/5 rounded-full relative overflow-hidden">
                {/* Traveling dot indicator */}
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-accent absolute top-1/2 -translate-y-1/2"
                  style={{ left: '-5px' }}
                  animate={{ left: ['0%', '95%', '0%'] }}
                  transition={{
                    duration: 2.0,
                    repeat: Infinity,
                    ease: activeCurve === 'sine' ? 'easeInOut' : activeCurve === 'expo' ? 'easeIn' : 'easeOut'
                  }}
                />
              </div>
              <div className="flex justify-between text-[6px] font-mono text-text-muted">
                <span>0.0s</span>
                <span>VELOCITY_SHIFT</span>
                <span>2.0s</span>
              </div>
            </div>
          </div>

          {/* SVG coordinate grid and curve rendering */}
          <div className="w-full max-w-[220px] aspect-[1.1] border border-dashed border-white/5 bg-[#181818]/40 p-4 rounded-sm flex items-center justify-center relative">
            <span className="absolute top-2 left-2 text-[6px] font-mono text-text-muted">[COORDS_GRID]</span>
            <span className="absolute bottom-2 right-2 text-[6px] font-mono text-text-muted">Y: TIME // X: POS</span>

            <svg className="w-full h-full max-h-[140px]" viewBox="0 0 200 120">
              {/* Grid guide ticks */}
              <line x1="20" y1="20" x2="180" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="20" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="20" y1="20" x2="20" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="100" y1="20" x2="100" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="180" y1="20" x2="180" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

              {/* Curve Line Drawing */}
              <path
                d={curvePaths[activeCurve]}
                fill="none"
                stroke="#C96A2B"
                strokeWidth="1.5"
                className="transition-all duration-500 ease-in-out"
              />

              {/* Drawing anchor nodes */}
              <circle cx="20" cy="100" r="2.5" fill="#C96A2B" />
              <circle cx="180" cy="20" r="2.5" fill="#C96A2B" />
            </svg>
          </div>

        </div>

      </div>

      <div className="border-t border-white/5 pt-4 text-[7px] font-mono text-text-muted flex justify-between items-center mt-4">
        <span>MATH_TRANSITIONS // EASING_STUDY</span>
        <span>ACTIVE_EASE: {activeCurve.toUpperCase()}</span>
      </div>
    </div>
  );
}
