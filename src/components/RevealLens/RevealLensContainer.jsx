import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Canvas from '../Canvas/Canvas';
import Hero from '../Hero/Hero';
import SelectedWorks from '../WorksScene/SelectedWorks';
import CaseStudiesScene from '../CaseStudiesScene/CaseStudiesScene';
import AboutScene from '../AboutScene/AboutScene';
import ContactScene from '../ContactScene/ContactScene';
import ProjectCard from '../WorksScene/ProjectCard';
import BootSequence from '../BootSequence/BootSequence';

const LERP_POS = 0.40; // hardware pointer polling smoothing
const LERP_SIZE = 0.20; // snappy clip expansion/contraction

const projects = [
  {
    id: 'placepro',
    number: '01',
    title: 'PLACEPRO',
    subtitle: 'Institutional Placement & Career Intelligence Platform',
    category: 'FULL STACK / ARCHITECTURE',
    year: '2025',
    image: '/PLACEPRO.png'
  },
  {
    id: 'devstage',
    number: '02',
    title: 'DEVSTAGE',
    subtitle: 'Student Showcase & Project Collaboration Engine',
    category: 'CREATIVE ENGINEERING',
    year: '2024',
    image: '/DEVSTAGE.png'
  },
  {
    id: 'eventra',
    number: '03',
    title: 'EVENTRA',
    subtitle: 'Immersive Event Discovery & Ticket Engine',
    category: 'UI/UX ARCHITECTURE',
    year: '2024',
    image: '/EVENTRA.png'
  },
  {
    id: 'tattva',
    number: '04',
    title: 'TATTVA',
    subtitle: 'Cultural Heritage & Digital Archive Experience',
    category: 'DIGITAL STUDIO / SYSTEMS',
    year: '2023',
    image: '/TATTVA.png'
  },
  {
    id: 'nexevent',
    number: '05',
    title: 'NEXEVENT',
    subtitle: 'Next-Generation Campus Event Management Suite',
    category: 'PRODUCT INFRASTRUCTURE',
    year: '2023',
    image: '/NEXEVENT.png'
  }
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

  // Refs for the 5 Environmental Scene Boards
  const sceneRefs1 = useRef([]);
  const sceneRefs2 = useRef([]);
  const sceneHeights = useRef([800, 1200, 1000, 1000, 900]);
  const sceneOffsets = useRef([0, 800, 2000, 3000, 4000]);

  // Measured placeholder coordinates
  const placeholderPositions = useRef([]);
  const [contentHeight, setContentHeight] = useState(4900);
  const [isScene2Settled, setIsScene2Settled] = useState(false);
  const isScene2SettledRef = useRef(false);

  // Real-time mouse coordinates (in viewport pixels)
  const targetPos = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
  const currentPos = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });

  // Current animated dimensions of the clipping box
  const currentSize = useRef({ w: 0, h: 0, r: 0, proximity: 0 });

  // Smooth scroll tracking
  const scrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const smoothVelocity = useRef(0);
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

  // Cache placeholder & scene board coordinates
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

    // Measure Project Card Placeholders
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
    }

    // Measure Scene Board Heights & Offsets
    const heroH = window.innerHeight;
    sceneHeights.current[0] = heroH;

    let accumulatedOffset = heroH;
    const newHeights = [heroH];
    const newOffsets = [0, heroH];

    sceneRefs1.current.forEach((sceneEl, i) => {
      if (i > 0 && sceneEl) {
        const h = sceneEl.offsetHeight || 1000;
        newHeights[i] = h;
        accumulatedOffset += h;
        newOffsets[i + 1] = accumulatedOffset;
      }
    });

    if (newHeights.length >= 2) {
      sceneHeights.current = newHeights;
      sceneOffsets.current = newOffsets;
      setContentHeight(accumulatedOffset + 200);
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

    // 1. Initialize Lenis Smooth Scroll (Instant & Responsive Tuning)
    const lenis = new Lenis({
      duration: 0.45,
      easing: (t) => 1 - Math.pow(1 - t, 3), // Instant cubic ease out for immediate response
      syncTouch: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', (e) => {
      scrollY.current = e.scroll;
      scrollVelocity.current = e.velocity || 0;
    });

    // 2. Mouse Move Tracking
    const onMouseMove = (e) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', measurePlaceholders);

    // Trigger initial placeholder & scene measurement after short render delay
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
      // B. PAGE SCROLL & LAYERED SCENE BOARD PHYSICS
      // Hero (Scene 01) remains stationary at top: 0!
      // Scene 02, 03, 04, 05 slide UP as stacked layers over Hero!
      // ────────────────────────────────────────────────────────
      const scrollVal = scrollY.current;
      smoothVelocity.current += (scrollVelocity.current - smoothVelocity.current) * 0.1;
      const heroH = window.innerHeight;

      // 1. Scene 01 (Hero) stays stationary at top: 0 with subtle scaling recession
      const heroRecessP = Math.min(1, Math.max(0, scrollVal / heroH));
      const heroScale = 1.0 - 0.04 * heroRecessP;

      [sceneRefs1.current[0], sceneRefs2.current[0]].forEach((sceneEl) => {
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, 0, 0) scale(${heroScale.toFixed(4)})`;
        }
      });

      // 2. Scene 02 (Selected Work): Slides UP over Hero from bottom (100vh -> 0px)
      const h1 = sceneHeights.current[1] || 1200;
      const scene1Y = scrollVal < heroH ? (heroH - scrollVal) : -(scrollVal - heroH);

      [sceneRefs1.current[1], sceneRefs2.current[1]].forEach((sceneEl) => {
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, ${scene1Y.toFixed(1)}px, 0)`;
        }
      });

      // 3. Scene 03 (Case Studies): Slides UP over Scene 02
      const h2 = sceneHeights.current[2] || 1000;
      const offset2 = heroH + h1;
      const scene2Y = scrollVal < offset2 ? (offset2 - scrollVal) : -(scrollVal - offset2);

      [sceneRefs1.current[2], sceneRefs2.current[2]].forEach((sceneEl) => {
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, ${scene2Y.toFixed(1)}px, 0)`;
        }
      });

      // 4. Scene 04 (About): Slides UP over Scene 03
      const h3 = sceneHeights.current[3] || 1000;
      const offset3 = offset2 + h2;
      const scene3Y = scrollVal < offset3 ? (offset3 - scrollVal) : -(scrollVal - offset3);

      [sceneRefs1.current[3], sceneRefs2.current[3]].forEach((sceneEl) => {
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, ${scene3Y.toFixed(1)}px, 0)`;
        }
      });

      // 5. Scene 05 (Contact): Slides UP over Scene 04
      const offset4 = offset3 + h3;
      const scene4Y = scrollVal < offset4 ? (offset4 - scrollVal) : -(scrollVal - offset4);

      [sceneRefs1.current[4], sceneRefs2.current[4]].forEach((sceneEl) => {
        if (sceneEl) {
          sceneEl.style.transform = `translate3d(0, ${scene4Y.toFixed(1)}px, 0)`;
        }
      });

      // B3. Selected Work Scene Settlement State Trigger
      const isSettledNow = scrollVal >= heroH - window.innerHeight * 0.45;
      if (isSettledNow !== isScene2SettledRef.current) {
        isScene2SettledRef.current = isSettledNow;
        setIsScene2Settled(isSettledNow);
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
      if (placeholderPositions.current.length === 0 || sceneHeights.current[0] === 800) {
        measurePlaceholders();
      }

      // ────────────────────────────────────────────────────────
      // D. PROJECT CARDS LAYOUT, VIEWPORT FOCUS & PHYSICS INJECTION
      // ────────────────────────────────────────────────────────
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scrollProgress = Math.min(Math.max(scrollVal / (height * 0.95), 0), 1);
      const smoothP = scrollProgress * scrollProgress * (3 - 2 * scrollProgress); // Smoothstep

      // Base sculpture center (Empty middle) and Ellipse Radii
      let cx = 0;
      let cy = 0;
      let RX = 0;
      let RY = 0;

      if (width >= 1024) {
        cx = width * 0.70;
        cy = height * 0.50;
        RX = width * 0.175;
        RY = RX * 0.60;
      } else if (width >= 768) {
        cx = width * 0.68;
        cy = height * 0.50;
        RX = width * 0.22;
        RY = RX * 0.60;
      } else {
        cx = width * 0.5;
        cy = height * 0.70;
        RX = width * 0.32;
        RY = RX * 0.55;
      }

      // Global rotation (1 rev every 100 sec)
      const globalAngle = (animTime.current / 100) * Math.PI * 2;

      const isAnyHovered = hoveredIndexRef.current !== null;
      const viewportCenterY = height / 2;

      projects.forEach((_, idx) => {
        const phys = ORBIT_PHYSICS[idx];
        const state = cardVisualStates.current[idx];

        // 1. Orbital position
        const theta = globalAngle + phys.phase;

        const dx = Math.cos(theta) * RX;
        const dy = Math.sin(theta) * RY;

        const depthFactor = (Math.sin(theta) + 1) / 2;

        const xs_final = cx + dx * (1 - smoothP);
        const ys_final = cy + dy * (1 - smoothP);

        // 3. Grid placeholder position
        const pos = placeholderPositions.current[idx] || { x: xs_final, y: ys_final, w: 320, h: 220 };

        // 5. Staggered Entrance & Interpolation between Sculpture (Hero) and Exhibition (Gallery) states
        const staggerStart = idx * 0.10;
        const cardP = Math.min(Math.max((smoothP - staggerStart) / Math.max(0.01, 1.0 - staggerStart), 0), 1);
        const cardEase = cardP * cardP * (3 - 2 * cardP); // Smoothstep curve

        const targetX = xs_final + (pos.x - xs_final) * cardEase;
        const targetY = ys_final + (pos.y - ys_final) * cardEase;

        // Landscape presentation boards
        const sculptureW = width >= 768 ? 240 : 208;
        const sculptureH = width >= 768 ? 150 : 130;

        const targetW = sculptureW + (pos.w - sculptureW) * cardEase;
        const targetH = sculptureH + (pos.h - sculptureH) * cardEase;

        // Depth parameters mapped from depthFactor
        const baseScale = 0.94 + 0.06 * depthFactor;
        const baseOpacity = imagesReady.current ? (0.65 + 0.35 * depthFactor) : 0;
        const baseBlur = 1.8 * (1 - depthFactor);
        const baseZ = 10 + Math.floor(depthFactor * 40);

        // 6. Viewport Center Focus Dynamics
        const cardCenterY = targetY - (scrollVal > heroH ? (scrollVal - heroH) : 0) + (targetH / 2);
        const distFromCenter = Math.abs(cardCenterY - viewportCenterY);
        const maxFocusDist = height * 0.45;
        const rawCenterFactor = Math.max(0, 1 - distFromCenter / maxFocusDist);
        const centerFocusP = rawCenterFactor * rawCenterFactor * cardEase; // Active in exhibition state

        const focusScale = 1.0 + 0.02 * centerFocusP;
        const focusLiftY = -6 * centerFocusP;

        // 7. Hover & Neighbor Interactions (4-6px lift, 1.015 scale, 5% neighbor dimming)
        const isThisHovered = hoveredIndexRef.current === idx;
        let targetHoverDepth = isThisHovered ? 1.0 : 0.0;
        let targetHoverBlur = isThisHovered ? -baseBlur : 0.0;
        let neighborOpacityFactor = (isAnyHovered && !isThisHovered) ? 0.88 : (0.92 + 0.08 * centerFocusP);

        if (state.hoverDepth === undefined) {
          state.hoverDepth = 0.0;
          state.hoverBlur = 0.0;
        }

        // Gentle ease ~200ms
        state.hoverDepth += (targetHoverDepth - state.hoverDepth) * 0.15;
        state.hoverBlur += (targetHoverBlur - state.hoverBlur) * 0.15;

        // 8. Calculate Absolute Visual States
        state.x = targetX;
        state.y = targetY;
        state.w = targetW;
        state.h = targetH;

        const hoverScale = 1.0 + 0.015 * state.hoverDepth;
        const interpolatedScale = (baseScale + (1.0 - baseScale) * cardEase) * hoverScale * focusScale;
        const interpolatedOpacity = (baseOpacity + (1.0 - baseOpacity) * cardEase) * neighborOpacityFactor;
        const interpolatedBlur = (baseBlur * (1 - cardEase)) + state.hoverBlur;

        state.scale = interpolatedScale;
        state.opacity = Math.min(1.0, Math.max(0.0, interpolatedOpacity));
        state.blur = Math.max(interpolatedBlur, 0);
        state.zIndex = Math.round(baseZ + (state.hoverDepth * 50) + Math.round(centerFocusP * 20));

        // Lift ~5px on hover + focus lift
        const liftY = (-5 * state.hoverDepth) + focusLiftY;

        // Velocity tilt back for cards
        const tiltX = Math.max(-2, Math.min(2, smoothVelocity.current * -0.05));

        // 9. Style DOM nodes directly with Cache (GPU friendly)
        const el1 = cardRefs1.current[idx];
        const el2 = cardRefs2.current[idx];

        const applyStyle = (el, prop, val) => {
          const cacheKey = '_' + prop;
          if (el[cacheKey] !== val) {
            el.style[prop] = val;
            el[cacheKey] = val;
          }
        };

        const finalFilter = state.blur > 0.25 ? `blur(${state.blur.toFixed(1)}px)` : 'none';

        if (el1) {
          applyStyle(el1, 'perspective', '800px');
          applyStyle(el1, 'transform', `translate3d(${state.x.toFixed(1)}px, ${(state.y + liftY).toFixed(1)}px, 0) scale(${state.scale.toFixed(3)}) rotateX(${tiltX.toFixed(2)}deg)`);
          applyStyle(el1, 'width', `${state.w.toFixed(1)}px`);
          applyStyle(el1, 'height', `${state.h.toFixed(1)}px`);
          applyStyle(el1, 'opacity', state.opacity.toFixed(3));
          applyStyle(el1, 'filter', finalFilter);
          applyStyle(el1, 'zIndex', Math.round(state.zIndex));
        }

        if (el2) {
          applyStyle(el2, 'perspective', '800px');
          applyStyle(el2, 'transform', `translate3d(${state.x.toFixed(1)}px, ${(state.y + liftY).toFixed(1)}px, 0) scale(${state.scale.toFixed(3)}) rotateX(${tiltX.toFixed(2)}deg)`);
          applyStyle(el2, 'width', `${state.w.toFixed(1)}px`);
          applyStyle(el2, 'height', `${state.h.toFixed(1)}px`);
          applyStyle(el2, 'opacity', state.opacity.toFixed(3));
          applyStyle(el2, 'filter', finalFilter);
          applyStyle(el2, 'zIndex', Math.round(state.zIndex));
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

      {/* ── LAYER 1: BASE DESIGN (5 STACKED ENVIRONMENTAL SCENE BOARDS) ── */}
      <div className="fixed inset-0 w-full h-full z-10 overflow-hidden pointer-events-none">
        <Canvas isLayer2={false} />
        <div
          ref={content1Ref}
          className="absolute top-0 left-0 w-full h-full pointer-events-auto z-10"
        >
          {/* Scene 01 — Identity (Dark Concrete - Stationary at top:0) */}
          <div
            ref={(el) => (sceneRefs1.current[0] = el)}
            className="scene-environment material-concrete scene-01"
            style={{ top: 0, height: '100vh', zIndex: 1 }}
          >
            <Hero ref={heroRef} isLayer2={false} />
          </div>

          {/* Scene 02 — Selected Work (Luxury Museum Paper - Slides UP over Hero) */}
          <div
            ref={(el) => (sceneRefs1.current[1] = el)}
            className="scene-environment material-luxury-paper scene-02"
            style={{ top: 0, zIndex: 2 }}
          >
            <SelectedWorks isLayer2={false} placeholderRefs={placeholderRefs} isSettled={isScene2Settled} />
          </div>

          {/* Scene 03 — Case Studies (Dark Anodized Aluminium - Slides UP over Scene 02) */}
          <div
            ref={(el) => (sceneRefs1.current[2] = el)}
            className="scene-environment material-anodized-aluminium scene-03"
            style={{ top: 0, zIndex: 3 }}
          >
            <CaseStudiesScene isLayer2={false} />
          </div>

          {/* Scene 04 — About (Soft Limestone Plaster - Slides UP over Scene 03) */}
          <div
            ref={(el) => (sceneRefs1.current[3] = el)}
            className="scene-environment material-limestone-plaster scene-04"
            style={{ top: 0, zIndex: 4 }}
          >
            <AboutScene isLayer2={false} />
          </div>

          {/* Scene 05 — Contact (Deep Architectural Charcoal - Slides UP over Scene 04) */}
          <div
            ref={(el) => (sceneRefs1.current[4] = el)}
            className="scene-environment material-deep-charcoal scene-05"
            style={{ top: 0, zIndex: 5 }}
          >
            <ContactScene isLayer2={false} />
          </div>

          {/* Layer 1 Project Cards overlay */}
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              isLayer2={false}
              cardRef={(el) => (cardRefs1.current[idx] = el)}
              onPointerEnter={() => { hoveredIndexRef.current = idx; }}
              onPointerLeave={() => { hoveredIndexRef.current = null; }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── LAYER 2: REVEALED INVERTED DESIGN (CLIPPED 5 SCENES) ── */}
      <div
        ref={layer2Ref}
        className="fixed inset-0 w-full h-full z-20 overflow-hidden pointer-events-none select-none"
      >
        <Canvas isLayer2={true} />
        <div
          ref={content2Ref}
          className="absolute top-0 left-0 w-full h-full z-10"
        >
          {/* Scene 01 — Identity (Layer 2 Inverted - Transparent background so WebGL Orange Lens shows through) */}
          <div
            ref={(el) => (sceneRefs2.current[0] = el)}
            className="scene-environment scene-layer2 scene-01"
            style={{ top: 0, height: '100vh', zIndex: 1, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <Hero isLayer2={true} />
          </div>

          {/* Scene 02 — Selected Work (Layer 2 Inverted) */}
          <div
            ref={(el) => (sceneRefs2.current[1] = el)}
            className="scene-environment scene-layer2 scene-02"
            style={{ top: 0, zIndex: 2, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <SelectedWorks isLayer2={true} placeholderRefs={null} isSettled={isScene2Settled} />
          </div>

          {/* Scene 03 — Case Studies (Layer 2 Inverted) */}
          <div
            ref={(el) => (sceneRefs2.current[2] = el)}
            className="scene-environment scene-layer2 scene-03"
            style={{ top: 0, zIndex: 3, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <CaseStudiesScene isLayer2={true} />
          </div>

          {/* Scene 04 — About (Layer 2 Inverted) */}
          <div
            ref={(el) => (sceneRefs2.current[3] = el)}
            className="scene-environment scene-layer2 scene-04"
            style={{ top: 0, zIndex: 4, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <AboutScene isLayer2={true} />
          </div>

          {/* Scene 05 — Contact (Layer 2 Inverted) */}
          <div
            ref={(el) => (sceneRefs2.current[4] = el)}
            className="scene-environment scene-layer2 scene-05"
            style={{ top: 0, zIndex: 5, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <ContactScene isLayer2={true} />
          </div>

          {/* Layer 2 Project Cards overlay */}
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
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
