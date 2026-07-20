import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Canvas from '../Canvas/Canvas';
import Hero from '../Hero/Hero';
import SelectedWorks from '../WorksScene/SelectedWorks';
import ProjectCard from '../WorksScene/ProjectCard';
import BootSequence from '../BootSequence/BootSequence';

const LERP_POS = 0.40; // hardware pointer polling smoothing
const LERP_SIZE = 0.20; // snappy clip expansion/contraction

const projects = [
  { id: 'placepro', image: '/PLACEPRO.png' },
  { id: 'devstage', image: '/DEVSTAGE.png' },
  { id: 'eventra', image: '/EVENTRA.png' },
  { id: 'tattva', image: '/TATTVA.png' },
  { id: 'nexevent', image: '/NEXEVENT.png' }
];

// Orbital sculpture properties (Elliptical orbit, empty center)
const ORBIT_PHYSICS = [
  { phase: 0 },
  { phase: (2 * Math.PI) / 5 },
  { phase: (4 * Math.PI) / 5 },
  { phase: (6 * Math.PI) / 5 },
  { phase: (8 * Math.PI) / 5 }
];

export default function RevealLensContainer() {
  const layer2Ref = useRef(null);
  const content1Ref = useRef(null);
  const content2Ref = useRef(null);
  const heroRef = useRef(null);
  const wordmarkRect = useRef(null);

  const cardRefs1 = useRef([]);
  const cardRefs2 = useRef([]);
  const placeholderRefs = useRef([]);

  // Measured placeholder coordinates
  const placeholderPositions = useRef([]);
  const [contentHeight, setContentHeight] = useState(1200);

  // Real-time mouse coordinates (in viewport pixels)
  const targetPos = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
  const currentPos = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });

  // Current animated dimensions of the clipping box
  const currentSize = useRef({ w: 0, h: 0, r: 0, proximity: 0 });

  // Smooth scroll tracking
  const scrollY = useRef(0);
  const animTime = useRef(0);
  const currentSpeed = useRef(1.0);
  const hoveredIndexRef = useRef(null);

  // Image preload state
  const imagesReady = useRef(false);

  // Cache window dimensions to prevent synchronous layout thrashing
  const viewportParams = useRef({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });

  // Initialize visual states for cards
  const cardVisualStates = useRef(
    ORBIT_PHYSICS.map(() => {
      const cx = viewportParams.current.w * 0.70;
      const cy = viewportParams.current.h * 0.50;
      return {
        x: cx,
        y: cy,
        w: 240, // 16:10 Landscape width
        h: 150, // 16:10 Landscape height
        scale: 1.0,
        opacity: 0, // Start hidden to fade in smoothly
        blur: 0,
        zIndex: 10
      };
    })
  );

  // Cache placeholder coordinates relative to content wrapper
  const measurePlaceholders = () => {
    viewportParams.current.w = window.innerWidth;
    viewportParams.current.h = window.innerHeight;

    if (!content1Ref.current) return;
    const parentRect = content1Ref.current.getBoundingClientRect();

    if (heroRef.current && heroRef.current.wordmark) {
      const heroRect = heroRef.current.wordmark.getBoundingClientRect();
      wordmarkRect.current = {
        left: heroRect.left,
        top: heroRect.top,
        right: heroRect.right,
        bottom: heroRect.bottom,
        width: heroRect.width,
        height: heroRect.height
      };
    }

    const newPositions = placeholderRefs.current.map((placeholder) => {
      if (!placeholder) return null;
      const rect = placeholder.getBoundingClientRect();
      return {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
        w: rect.width,
        h: rect.height
      };
    });

    if (newPositions.every(pos => pos !== null && pos.w > 0)) {
      placeholderPositions.current = newPositions;
      setContentHeight(content1Ref.current.offsetHeight);
    }
  };

  useEffect(() => {
    // 0. Preload Project Images
    let loadedCount = 0;
    projects.forEach((p) => {
      const img = new window.Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === projects.length) imagesReady.current = true;
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === projects.length) imagesReady.current = true;
      };
      img.src = p.image;
    });

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      syncTouch: true
    });

    lenis.on('scroll', (e) => {
      scrollY.current = e.scroll;
    });

    // 2. Mouse Move Tracking
    const onMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', measurePlaceholders);

    // Trigger initial placeholder measurement after short render delay
    const initialMeasureTimeout = setTimeout(measurePlaceholders, 150);

    // 3. Unified Animation Game Loop
    let mainRafId = null;
    let lastTime = performance.now();

    const tick = (now) => {
      lenis.raf(now); // Unified Lenis tick

      const el = layer2Ref.current;
      if (!el) {
        mainRafId = requestAnimationFrame(tick);
        return;
      }

      // Delta time calculation for frame-rate independence
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      // ────────────────────────────────────────────────────────
      // A. MOUSE CURSOR & LENS CLIPPING
      // ────────────────────────────────────────────────────────
      // Re-introduce slight lerp to smooth out hardware pointer polling jitter
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * LERP_POS;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * LERP_POS;

      let targetProximityScale = 0;
      if (wordmarkRect.current) {
        const padding = 100;
        const fadeDist = 150;
        const rect = wordmarkRect.current;
        const minX = rect.left - padding;
        const maxX = rect.right + padding;
        const minY = rect.top - padding;
        const maxY = rect.bottom + padding;

        const cx = currentPos.current.x;
        const cy = currentPos.current.y;

        let dx = 0; let dy = 0;
        if (cx < minX) dx = minX - cx;
        else if (cx > maxX) dx = cx - maxX;
        
        if (cy < minY) dy = minY - cy;
        else if (cy > maxY) dy = cy - maxY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) targetProximityScale = 1.0;
        else if (dist < fadeDist) targetProximityScale = 1.0 - (dist / fadeDist);
      }

      currentSize.current.proximity += (targetProximityScale - currentSize.current.proximity) * 0.15;
      const p = currentSize.current.proximity;

      let targetW = 0; let targetH = 0; let targetR = 26;

      if (p > 0.01) {
        const timeSec = now * 0.001;
        const widthMod = Math.sin(timeSec * (2 * Math.PI / 9.0));
        const heightMod = Math.cos(timeSec * (2 * Math.PI / 11.0));
        const radiusMod = Math.sin(timeSec * (2 * Math.PI / 10.0));
        targetW = 75 + widthMod * 6;
        targetH = 65 + heightMod * 6;
        targetR = 18 + radiusMod * 4;
      }

      currentSize.current.w += (targetW - currentSize.current.w) * LERP_SIZE;
      currentSize.current.h += (targetH - currentSize.current.h) * LERP_SIZE;
      if (currentSize.current.r === undefined) currentSize.current.r = 0;
      currentSize.current.r += (targetR - currentSize.current.r) * LERP_SIZE;

      const w = currentSize.current.w * p;
      const h = currentSize.current.h * p;
      
      if (w > 0.01 && h > 0.01) {
        const cx = currentPos.current.x;
        const cy = currentPos.current.y;
        
        const finalTop = cy - h / 2;
        const finalLeft = cx - w / 2;
        const finalBottom = viewportParams.current.h - (cy + h / 2);
        const finalRight = viewportParams.current.w - (cx + w / 2);
        const finalR = (currentSize.current.w / 120) * currentSize.current.r * p;

        const newClip = `inset(${finalTop}px ${finalRight}px ${finalBottom}px ${finalLeft}px round ${finalR}px)`;
        const newOpacity = p.toFixed(3);

        // Performance Optimization: Cache DOM writes
        if (el._lastClip !== newClip) {
          el.style.clipPath = newClip;
          el._lastClip = newClip;
        }
        if (el._lastOpacity !== newOpacity) {
          el.style.opacity = newOpacity;
          el._lastOpacity = newOpacity;
        }
        if (el._lastDisplay !== 'block') {
          el.style.display = 'block';
          el._lastDisplay = 'block';
        }
      } else {
        const newClip = 'inset(100% 100% 100% 100%)';
        if (el._lastClip !== newClip) {
          el.style.clipPath = newClip;
          el.style.opacity = '0';
          el.style.display = 'none';
          el._lastClip = newClip;
          el._lastOpacity = '0';
          el._lastDisplay = 'none';
        }
      }

      // ────────────────────────────────────────────────────────
      // B. PAGE SCROLL TRANSLATION (SYNCED LAYERS)
      // ────────────────────────────────────────────────────────
      const scrollVal = scrollY.current;
      if (content1Ref.current) {
        content1Ref.current.style.transform = `translate3d(0, ${-scrollVal.toFixed(1)}px, 0)`;
      }
      if (content2Ref.current) {
        content2Ref.current.style.transform = `translate3d(0, ${-scrollVal.toFixed(1)}px, 0)`;
      }

      // ────────────────────────────────────────────────────────
      // C. DRIFT TIME FACTOR & DRIFT LAUNCH
      // ────────────────────────────────────────────────────────
      if (imagesReady.current) {
        const targetSpeed = hoveredIndexRef.current !== null ? 0.0 : 1.0;
        currentSpeed.current += (targetSpeed - currentSpeed.current) * 0.08;
        animTime.current += dt * currentSpeed.current;
      }

      // Lazy measurement backup
      if (placeholderPositions.current.length === 0) {
        measurePlaceholders();
      }

      // ────────────────────────────────────────────────────────
      // D. PROJECT CARDS LAYOUT & PHYSICS INJECTION
      // ────────────────────────────────────────────────────────
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scrollRange = height * 0.85;
      const scrollProgress = Math.min(Math.max(scrollVal / scrollRange, 0), 1);
      const smoothP = scrollProgress * scrollProgress * (3 - 2 * scrollProgress); // Smoothstep

      // Base sculpture center (Empty middle) and Ellipse Radii
      let cx = 0;
      let cy = 0;
      let RX = 0;
      let RY = 0;

      // Reduced footprint by ~15-20% for tighter layout
      if (width >= 1024) {
        cx = width * 0.70; // Adjusted for reduced footprint
        cy = height * 0.50;
        RX = width * 0.175; // Reduced from 0.21
        RY = RX * 0.60;
      } else if (width >= 768) {
        cx = width * 0.68;
        cy = height * 0.50;
        RX = width * 0.22; // Reduced from 0.26
        RY = RX * 0.60;
      } else {
        cx = width * 0.5;
        cy = height * 0.70; // Pushed down for mobile
        RX = width * 0.32; // Reduced from 0.38
        RY = RX * 0.55;
      }

      // Global rotation (1 rev every 100 sec)
      const globalAngle = (animTime.current / 100) * Math.PI * 2;

      projects.forEach((_, idx) => {
        const phys = ORBIT_PHYSICS[idx];
        const state = cardVisualStates.current[idx];

        // 1. Orbital position
        const theta = globalAngle + phys.phase;

        // Elliptical coordinates around empty center
        const dx = Math.cos(theta) * RX;
        const dy = Math.sin(theta) * RY;

        // Depth calculations based on sin(theta) -> mapped to [0, 1] (1 is frontmost, bottom of screen)
        const depthFactor = (Math.sin(theta) + 1) / 2;

        const xs_final = cx + dx * (1 - smoothP);
        const ys_final = cy + dy * (1 - smoothP);

        // 3. Grid placeholder position
        const pos = placeholderPositions.current[idx] || { x: xs_final, y: ys_final, w: 240, h: 150 };

        // 4. Interpolate coordinates & dimensions between Sculpture and Gallery states
        const targetX = xs_final + (pos.x - xs_final) * smoothP;
        const targetY = ys_final + (pos.y - ys_final) * smoothP;

        // Landscape presentation boards (16:10 aspect ratio)
        const sculptureW = width >= 768 ? 240 : 208;
        const sculptureH = width >= 768 ? 150 : 130;

        const targetW = sculptureW + (pos.w - sculptureW) * smoothP;
        const targetH = sculptureH + (pos.h - sculptureH) * smoothP;

        // Depth parameters mapped from depthFactor
        const baseScale = 0.94 + 0.06 * depthFactor; // Front: 100%, Back: 94%
        const baseOpacity = imagesReady.current ? (0.65 + 0.35 * depthFactor) : 0; // Hidden until loaded
        const baseBlur = 1.8 * (1 - depthFactor); // Front: 0, Back: 1.8
        const baseZ = 10 + Math.floor(depthFactor * 40); // 10 to 50

        // 5. Apply Hover Overrides (Strictly No Scaling / Tilt / Glow per Phase 08.6)
        let targetHoverDepth = 0.0; // 0.0 = grounded, 1.0 = elevated
        let targetHoverOpacity = 1.0;
        let targetHoverBlur = 0.0;

        if (hoveredIndexRef.current === idx) {
          targetHoverDepth = 1.0;
          targetHoverOpacity = baseOpacity > 0 ? (1.0 / baseOpacity) : 1.0; // Image remains perfectly sharp/opaque
          targetHoverBlur = -baseBlur;
        } else {
          // Unhovered cards remain EXACTLY as they are (no dimming, no blur)
          targetHoverOpacity = 1.0;
          targetHoverBlur = 0.0;
        }

        // 6. Temporally Lerp ONLY the hover states (Keeps orbit mathematically continuous)
        if (state.hoverDepth === undefined) {
          state.hoverDepth = 0.0;
          state.hoverOpacity = 1.0;
          state.hoverBlur = 0.0;
        }
        
        // Gentle ease 180-220ms. lerp factor ~0.15 gives a smooth ~200ms ease at 60fps.
        state.hoverDepth += (targetHoverDepth - state.hoverDepth) * 0.15;
        state.hoverOpacity += (targetHoverOpacity - state.hoverOpacity) * 0.15;
        state.hoverBlur += (targetHoverBlur - state.hoverBlur) * 0.15;

        // 7. Calculate Absolute Visual States
        state.x = targetX;
        state.y = targetY;
        state.w = targetW;
        state.h = targetH;

        const interpolatedBaseScale = baseScale + (1.0 - baseScale) * smoothP;
        const interpolatedOpacity = baseOpacity + (1.0 - baseOpacity) * smoothP;
        const interpolatedBlur = baseBlur + (0.0 - baseBlur) * smoothP;

        state.scale = interpolatedBaseScale; // NO hover scaling
        state.opacity = interpolatedOpacity * state.hoverOpacity;
        state.blur = Math.max(interpolatedBlur + state.hoverBlur, 0);
        state.zIndex = Math.round(baseZ + (state.hoverDepth * 50)); // Increase z-index
        
        // Compute subtle Y-translation for elevation (~16px of perceived depth)
        const liftY = -16 * state.hoverDepth;

        // 8. Style DOM nodes directly with Cache (GPU friendly)
        const el1 = cardRefs1.current[idx];
        const el2 = cardRefs2.current[idx];

        const applyStyle = (el, prop, val) => {
          const cacheKey = '_' + prop;
          if (el[cacheKey] !== val) {
            el.style[prop] = val;
            el[cacheKey] = val;
          }
        };

        if (el1) {
          applyStyle(el1, 'transform', `translate3d(${state.x.toFixed(1)}px, ${(state.y + liftY).toFixed(1)}px, 0) scale(${state.scale.toFixed(3)})`);
          applyStyle(el1, 'width', `${state.w.toFixed(1)}px`);
          applyStyle(el1, 'height', `${state.h.toFixed(1)}px`);
          applyStyle(el1, 'opacity', state.opacity.toFixed(3));
          applyStyle(el1, 'filter', state.blur > 0.05 ? `blur(${state.blur.toFixed(2)}px)` : 'none');
          applyStyle(el1, 'zIndex', Math.round(state.zIndex));
          
          // Dynamic box shadow and border for depth
          const shadowY = 4 + 8 * state.hoverDepth;
          const shadowBlur = 15 + 15 * state.hoverDepth;
          const shadowAlpha = 0.3 - 0.05 * state.hoverDepth;
          const borderAlpha = 0.08 + 0.07 * state.hoverDepth;
          
          applyStyle(el1, 'boxShadow', `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, ${shadowAlpha.toFixed(2)})`);
          applyStyle(el1, 'border', `1px solid rgba(255, 255, 255, ${borderAlpha.toFixed(3)})`);
        }
        
        if (el2) {
          applyStyle(el2, 'transform', `translate3d(${state.x.toFixed(1)}px, ${(state.y + liftY).toFixed(1)}px, 0) scale(${state.scale.toFixed(3)})`);
          applyStyle(el2, 'width', `${state.w.toFixed(1)}px`);
          applyStyle(el2, 'height', `${state.h.toFixed(1)}px`);
          applyStyle(el2, 'opacity', state.opacity.toFixed(3));
          applyStyle(el2, 'filter', state.blur > 0.05 ? `blur(${state.blur.toFixed(2)}px)` : 'none');
          applyStyle(el2, 'zIndex', Math.round(state.zIndex));
          
          // Layer 2 shadow/border (Terracotta orange context)
          const shadowY = 4 + 8 * state.hoverDepth;
          const shadowBlur = 15 + 15 * state.hoverDepth;
          const shadowAlpha = 0.05 + 0.05 * state.hoverDepth;
          const borderAlpha = 0.15 + 0.10 * state.hoverDepth;
          
          applyStyle(el2, 'boxShadow', `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px rgba(0, 0, 0, ${shadowAlpha.toFixed(2)})`);
          applyStyle(el2, 'border', `1px solid rgba(24, 24, 24, ${borderAlpha.toFixed(3)})`);
        }
      });

      mainRafId = requestAnimationFrame(tick);
    };

    mainRafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', measurePlaceholders);
      clearTimeout(initialMeasureTimeout);
      lenis.destroy();
      if (mainRafId) cancelAnimationFrame(mainRafId);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* ── DUMMY SCROLL SPACER (Creates native browser scroll height) ── */}
      <div
        style={{ height: `${contentHeight}px` }}
        className="w-full relative pointer-events-none"
      />

      {/* ── LAYER 1: BASE DESIGN ── */}
      <div className="fixed inset-0 w-full h-full z-10 overflow-hidden pointer-events-none">
        <Canvas isLayer2={false} />
        <div
          ref={content1Ref}
          className="absolute top-0 left-0 w-full pointer-events-auto z-10"
        >
          <Hero ref={heroRef} isLayer2={false} />
          <SelectedWorks isLayer2={false} placeholderRefs={placeholderRefs} />

          {/* Layer 1 Cards overlay */}
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              isLayer2={false}
              cardRef={(el) => (cardRefs1.current[idx] = el)}
              onPointerEnter={() => { hoveredIndexRef.current = idx; }}
              onPointerLeave={() => { hoveredIndexRef.current = null; }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── LAYER 2: REVEALED INVERTED DESIGN (CLIPPED) ── */}
      <div
        ref={layer2Ref}
        className="fixed inset-0 w-full h-full z-20 overflow-hidden pointer-events-none select-none"
      >
        <Canvas isLayer2={true} />
        <div
          ref={content2Ref}
          className="absolute top-0 left-0 w-full z-10"
        >
          <Hero isLayer2={true} />
          <SelectedWorks isLayer2={true} placeholderRefs={null} />

          {/* Layer 2 Cards overlay (identical mapping) */}
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              isLayer2={true}
              cardRef={(el) => (cardRefs2.current[idx] = el)}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── BOOT SEQUENCE OVERLAY (GSAP Master Timeline) ── */}
      <BootSequence currentPos={currentPos} currentSize={currentSize} />
    </div>
  );
}
