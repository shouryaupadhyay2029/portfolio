import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Canvas from '../Canvas/Canvas';
import Hero from '../Hero/Hero';
import ProjectShowcase from '../ProjectShowcase/ProjectShowcase';
import ManifestoScene from '../ManifestoScene/ManifestoScene';
import AboutScene from '../AboutScene/AboutScene';
import ContactScene from '../ContactScene/ContactScene';
import ProjectCard from '../WorksScene/ProjectCard';
import BootSequence from '../BootSequence/BootSequence';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const LERP_POS  = 0.40;
const LERP_SIZE = 0.20;

// Card lerp speeds
const LERP_ORBIT      = 0.55;  // Fast — follows orbit directly
const LERP_TRANSITION = 0.055; // Cinematic — smooth physical motion
const LERP_PARADE     = 0.07;  // Responsive but silky

// Wheel sensitivity: maps accumulated wheel delta → showcaseProgress (0→1)
// ~2200px total wheel travel through the full showcase
const SENSITIVITY = 0.00045;

// showcaseProgress thresholds
// No expand phase — ALIGN ends directly at strip positions
const SP_PARADE_END   = 0.92;  // 0 → 0.92: slide through all 5 projects
const SP_HOLD_END     = 1.00;  // 0.92 → 1.00: hold on final project

// Pre-pin scroll phase thresholds (relative to heroH)
// Transition begins IMMEDIATELY as soon as user starts scrolling down from Hero
const SETTLE_START = 0.01;
const SETTLE_END   = 0.12;
const ALIGN_START  = 0.12;
const ALIGN_END    = 0.82; // pin activates smoothly after cards dock in strip

// Scene heights (in units of vh)
const MANIFESTO_VH = 5;

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

const ORBIT_PHYSICS = [
  { phase: 0 },
  { phase: (2 * Math.PI) / 5 },
  { phase: (4 * Math.PI) / 5 },
  { phase: (6 * Math.PI) / 5 },
  { phase: (8 * Math.PI) / 5 }
];

const MANIFESTO_COUNT = 5;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;

const smoothstep = (lo, hi, v) => {
  if (Math.abs(hi - lo) < 0.0001) return v >= hi ? 1 : 0;
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOutQuart = (t) => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
};

const normWheelDelta = (e) => {
  if (e.deltaMode === 1) return e.deltaY * 16;   // line mode
  if (e.deltaMode === 2) return e.deltaY * window.innerHeight; // page mode
  return e.deltaY;
};

// ─────────────────────────────────────────────────────────────
export default function RevealLensContainer() {

  // ── Layer & Scene DOM refs ──────────────────────────────────
  const layer2Ref    = useRef(null);
  const content1Ref  = useRef(null);
  const content2Ref  = useRef(null);
  const heroRef1     = useRef(null);
  const heroRef2     = useRef(null);
  const sceneRefs1   = useRef([]);
  const sceneRefs2   = useRef([]);

  // ── Card DOM refs ───────────────────────────────────────────
  const cardRefs1 = useRef([]);
  const cardRefs2 = useRef([]);

  // ── Info overlay refs (showcase backdrop) ──────────────────
  const infoRef1 = useRef({});
  const infoRef2 = useRef({});

  // ── Manifesto DOM refs ──────────────────────────────────────
  const manifestoRef1 = useRef({ lineEls: [], progressBarEl: null });
  const manifestoRef2 = useRef({ lineEls: [], progressBarEl: null });

  // ── Scroll & scene metrics ──────────────────────────────────
  const [contentHeight, setContentHeight] = useState(10000);
  const sceneHeights = useRef([]);
  const sceneOffsets = useRef([]);

  // ── Lenis ref (accessible in wheel handler) ─────────────────
  const lenisRef = useRef(null);

  // ── Pin state ───────────────────────────────────────────────
  const isPinned       = useRef(false);
  const pinReleased    = useRef(false);  // showcase was completed, don't re-pin
  const pinCooldown    = useRef(false);  // temporary cooldown after unpinning backward
  const pinnedScrollY  = useRef(0);
  const showcaseProgress = useRef(0);   // 0→1 drives PARADE

  // ── Magnetic Latch System ──────────────────────────────────
  const magnetUpPull   = useRef(0);      // accumulated upward pull delta (at PlacePro)
  const magnetDownPull = useRef(0);      // accumulated downward pull delta (at NexEvent)
  const magnetOffset   = useRef(0);      // visual elastic tension displacement (px)

  // ── Mouse / scroll tracking ─────────────────────────────────
  const scrollY        = useRef(0);
  const scrollVelocity = useRef(0);
  const smoothVelocity = useRef(0);
  const targetPos      = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
  const currentPos     = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 });
  const currentSize    = useRef({ w: 0, h: 0, r: 0, proximity: 0 });

  // ── Orbital animation ───────────────────────────────────────
  const animTime     = useRef(0);
  const currentSpeed = useRef(1.0);
  const hoveredIdx   = useRef(null);
  const imagesReady  = useRef(true);

  // ── Viewport cache ──────────────────────────────────────────
  const vp = useRef({
    w: typeof window !== 'undefined' ? window.innerWidth  : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // ── Per-card smooth state (lerped every frame) ─────────────
  const cardStates = useRef(
    projects.map(() => ({
      x: vp.current.w * 0.70,
      y: vp.current.h * 0.50,
      w: 240, h: 150,
      opacity: 0, scale: 1.0, blur: 0, zIndex: 10,
      hoverDepth: 0,
    }))
  );

  // Frozen orbital positions captured when orbit decelerates
  const frozenOrbit = useRef(projects.map(() => ({ x: 0, y: 0 })));
  const orbitFrozen = useRef(false); // flag: freeze positions taken?

  // ── Scene measurement ───────────────────────────────────────
  const measureScenes = () => {
    vp.current.w = window.innerWidth;
    vp.current.h = window.innerHeight;
    const vh = window.innerHeight;

    // Scene 02 is just 1×vh — the showcase lives OUTSIDE scroll via pin
    const h0 = vh;
    const h1 = vh;               // Scene 02 backdrop: 1 viewport
    const h2 = vh * MANIFESTO_VH;
    const h3 = vh;
    const h4 = vh;

    sceneHeights.current = [h0, h1, h2, h3, h4];

    let off = 0;
    const offsets = [0];
    [h0, h1, h2, h3, h4].forEach(h => { off += h; offsets.push(off); });
    sceneOffsets.current = offsets;
    setContentHeight(off + 300);
  };

  useEffect(() => {
    // ── Image preload ─────────────────────────────────────────
    let loaded = 0;
    projects.forEach(p => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === projects.length) imagesReady.current = true;
      };
      img.src = p.image;
    });

    // ── Lenis smooth scroll ───────────────────────────────────
    const lenis = new Lenis({
      duration: 0.45,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      syncTouch: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', e => {
      scrollY.current = e.scroll;
      scrollVelocity.current = e.velocity || 0;
    });

    // ── Mouse tracking ────────────────────────────────────────
    const onMouseMove = e => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', measureScenes);

    // ── Wheel interceptor (CAPTURE phase → runs before Lenis) ─
    const MAGNET_THRESHOLD = 300; // 2-3 deliberate wheel inputs required to un-latch at boundaries

    const onWheel = (e) => {
      if (!isPinned.current) return;

      // Block all browser scroll during pin
      e.preventDefault();
      e.stopPropagation();

      const delta = normWheelDelta(e);

      // ── 1. AT START (PlacePro, showcaseProgress <= 0.005) ──
      // Scrolling UP holds position rock-solid stable for 2-3 scroll inputs before moving up to Hero
      if (showcaseProgress.current <= 0.005 && delta < 0) {
        magnetDownPull.current = 0;
        magnetUpPull.current += Math.abs(delta);
        magnetOffset.current = 0;

        if (magnetUpPull.current >= MAGNET_THRESHOLD) {
          // Latch breaks → release pin backward to Hero smoothly
          pinCooldown.current = true;
          isPinned.current = false;
          magnetUpPull.current = 0;
          magnetOffset.current = 0;
          showcaseProgress.current = 0;
          lenis.start();
          lenis.scrollTo(0, {
            duration: 0.95,
            easing: t => 1 - Math.pow(1 - t, 3)
          });
          setTimeout(() => {
            pinCooldown.current = false;
          }, 1000);
        }
        return;
      }

      // ── 2. AT END (NexEvent, showcaseProgress >= 0.995) ──
      // Scrolling DOWN holds position rock-solid stable for 2-3 scroll inputs before moving to Section 3
      if (showcaseProgress.current >= 0.995 && delta > 0) {
        magnetUpPull.current = 0;
        magnetDownPull.current += Math.abs(delta);
        magnetOffset.current = 0;

        if (magnetDownPull.current >= MAGNET_THRESHOLD) {
          // Latch breaks → advance to Section 3 (Manifesto)
          isPinned.current = false;
          pinReleased.current = true;
          magnetDownPull.current = 0;
          magnetOffset.current = 0;
          lenis.start();
          const offsets = sceneOffsets.current;
          lenis.scrollTo(offsets[2], {
            duration: 1.1,
            easing: t => 1 - Math.pow(1 - t, 3)
          });
        }
        return;
      }

      // ── 3. IN BETWEEN: Normal Horizontal Showcase Progression ──
      magnetUpPull.current = 0;
      magnetDownPull.current = 0;
      magnetOffset.current = 0;
      const next = showcaseProgress.current + delta * SENSITIVITY;
      showcaseProgress.current = clamp(next, 0, 1.0);
    };

    // ── Touch support for mobile ──────────────────────────────
    let lastTouchY = 0;
    const onTouchStart = (e) => {
      if (!isPinned.current) return;
      lastTouchY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (!isPinned.current) return;
      e.preventDefault();
      const dy = lastTouchY - e.touches[0].clientY; // + = scroll down, - = scroll up
      lastTouchY = e.touches[0].clientY;

      if (showcaseProgress.current <= 0.005 && dy < 0) {
        magnetUpPull.current += Math.abs(dy);
        magnetOffset.current = 0;
        if (magnetUpPull.current >= MAGNET_THRESHOLD) {
          pinCooldown.current = true;
          isPinned.current = false;
          magnetUpPull.current = 0;
          magnetOffset.current = 0;
          showcaseProgress.current = 0;
          lenis.start();
          lenis.scrollTo(0, {
            duration: 0.95,
            easing: t => 1 - Math.pow(1 - t, 3)
          });
          setTimeout(() => {
            pinCooldown.current = false;
          }, 1000);
        }
        return;
      }

      if (showcaseProgress.current >= 0.995 && dy > 0) {
        magnetDownPull.current += Math.abs(dy);
        magnetOffset.current = 0;
        if (magnetDownPull.current >= MAGNET_THRESHOLD) {
          isPinned.current = false;
          pinReleased.current = true;
          magnetDownPull.current = 0;
          magnetOffset.current = 0;
          lenis.start();
          const offsets = sceneOffsets.current;
          lenis.scrollTo(offsets[2], {
            duration: 1.1,
            easing: t => 1 - Math.pow(1 - t, 3)
          });
        }
        return;
      }

      magnetUpPull.current = 0;
      magnetDownPull.current = 0;
      magnetOffset.current = 0;
      showcaseProgress.current = clamp(
        showcaseProgress.current + dy * SENSITIVITY * 1.8,
        0, 1.0
      );
    };

    window.addEventListener('wheel',      onWheel,      { passive: false, capture: true });
    window.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });

    const initTimeout = setTimeout(measureScenes, 150);

    // ─────────────────────────────────────────────────────────
    // UNIFIED RAF GAME LOOP
    // ─────────────────────────────────────────────────────────
    let rafId = null;
    let lastTime = performance.now();
    let lastActiveIdx = -1;

    const tick = (now) => {
      lenis.raf(now);

      const layer2El = layer2Ref.current;
      if (!layer2El) { rafId = requestAnimationFrame(tick); return; }

      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      const rawScroll = scrollY.current;
      const w = vp.current.w;
      const h = vp.current.h;
      const heights = sceneHeights.current;
      const offsets = sceneOffsets.current;
      const heroH = heights[0] || h;

      // ── B: LOCK PAGE WHILE PINNED ──────────────────────────
      if (isPinned.current) {
        window.scrollTo(0, pinnedScrollY.current);
      }

      // Effective scroll used for scene physics
      const sv = isPinned.current ? pinnedScrollY.current : rawScroll;

      // ── A: REVEAL LENS — only near SHOURYA // FOUNDRY ─────
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * LERP_POS;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * LERP_POS;

      let targetProx = 0;
      if (rawScroll < 30 && heroRef1.current && heroRef1.current.wordmark) {
        const rect = heroRef1.current.wordmark.getBoundingClientRect();
        const pad = 40, fade = 100;
        const cx = currentPos.current.x, cy = currentPos.current.y;
        let dx = 0, dy = 0;
        if (cx < rect.left - pad)  dx = (rect.left - pad) - cx;
        else if (cx > rect.right + pad) dx = cx - (rect.right + pad);
        if (cy < rect.top - pad)   dy = (rect.top - pad) - cy;
        else if (cy > rect.bottom + pad) dy = cy - (rect.bottom + pad);
        const dist = Math.sqrt(dx * dx + dy * dy);
        targetProx = dist === 0 ? 1 : dist < fade ? 1 - dist / fade : 0;
      }

      currentSize.current.proximity += (targetProx - currentSize.current.proximity) * 0.15;
      const lp = currentSize.current.proximity;
      let tW = 0, tH = 0, tR = 26;
      if (lp > 0.01) {
        const ts = now * 0.001;
        tW = 75 + Math.sin(ts * (2 * Math.PI / 9)) * 6;
        tH = 65 + Math.cos(ts * (2 * Math.PI / 11)) * 6;
        tR = 18 + Math.sin(ts * (2 * Math.PI / 10)) * 4;
      }
      currentSize.current.w += (tW - currentSize.current.w) * LERP_SIZE;
      currentSize.current.h += (tH - currentSize.current.h) * LERP_SIZE;
      if (!currentSize.current.r) currentSize.current.r = 0;
      currentSize.current.r += (tR - currentSize.current.r) * LERP_SIZE;

      const lw = currentSize.current.w * lp, lh = currentSize.current.h * lp;
      if (lw > 0.01 && lh > 0.01) {
        const lcx = currentPos.current.x, lcy = currentPos.current.y;
        const rr = (currentSize.current.w / 120) * currentSize.current.r * lp;
        const clip = `inset(${lcy - lh / 2}px ${w - lcx - lw / 2}px ${h - lcy - lh / 2}px ${lcx - lw / 2}px round ${rr}px)`;
        const op = lp.toFixed(3);
        if (layer2El._lc !== clip)   { layer2El.style.clipPath = clip; layer2El._lc = clip; }
        if (layer2El._lo !== op)     { layer2El.style.opacity = op;   layer2El._lo = op; }
        if (layer2El._ld !== 'block') { layer2El.style.display = 'block'; layer2El._ld = 'block'; }
      } else if (layer2El._ld !== 'none') {
        layer2El.style.clipPath = 'inset(100% 100% 100% 100%)';
        layer2El.style.opacity  = '0';
        layer2El.style.display  = 'none';
        layer2El._lc = 'none'; layer2El._ld = 'none';
      }

      // ── C: SCENE STACKING PHYSICS ──────────────────────────
      if (heights.length >= 5 && offsets.length >= 6) {
        const recessP = clamp(sv / heroH, 0, 1);
        const heroScale = 1.0 - 0.04 * recessP;
        [sceneRefs1.current[0], sceneRefs2.current[0]].forEach(s => {
          if (s) s.style.transform = `translate3d(0, 0, 0) scale(${heroScale.toFixed(4)})`;
        });

        [[1, 1], [2, 2], [3, 3], [4, 4]].forEach(([si, oi]) => {
          const offV = offsets[oi];
          const yV = sv < offV ? offV - sv : -(sv - offV);
          [sceneRefs1.current[si], sceneRefs2.current[si]].forEach(s => {
            if (s) s.style.transform = `translate3d(0, ${yV.toFixed(1)}px, 0)`;
          });
        });
      }

      // ── D: PIN ACTIVATION ──────────────────────────────────
      const alignP_forPin = smoothstep(heroH * ALIGN_START, heroH * ALIGN_END, rawScroll);
      const canPin = !isPinned.current && !pinReleased.current && !pinCooldown.current;
      const shouldPin = canPin && alignP_forPin >= 0.94 && rawScroll >= heroH * 0.88;

      if (shouldPin) {
        isPinned.current = true;
        pinnedScrollY.current = heroH; // lock at Scene 02 fully covering Hero
        showcaseProgress.current = 0;
        window.scrollTo(0, heroH);
        lenis.stop();
      }

      // Reset pin eligibility after scrolling well back into Hero
      if ((pinReleased.current || pinCooldown.current) && rawScroll < heroH * 0.25) {
        pinReleased.current = false;
        pinCooldown.current = false;
        showcaseProgress.current = 0;
      }

      // ── E: MANIFESTO SCROLL DRIVE ──────────────────────────
      if (heights.length >= 3 && offsets.length >= 4) {
        const mStart = offsets[2], mRange = heights[2] || (h * MANIFESTO_VH);
        const mP = clamp((sv - mStart) / mRange, 0, 1);
        const mActiveIdx = Math.round(mP * (MANIFESTO_COUNT - 1));
        [manifestoRef1.current, manifestoRef2.current].forEach(mr => {
          if (!mr?.lineEls?.length) return;
          mr.lineEls.forEach((el, i) => {
            if (!el) return;
            el.classList.toggle('is-active', i === mActiveIdx);
            el.classList.toggle('is-past',   i < mActiveIdx);
          });
          if (mr.progressBarEl) mr.progressBarEl.style.height = `${(mP * 100).toFixed(1)}%`;
        });
      }

      // ── F: ORBITAL ANIMATION TIME ──────────────────────────
      if (imagesReady.current) {
        // Speed decreases as settle phase begins
        const settleP = smoothstep(heroH * SETTLE_START, heroH * SETTLE_END, rawScroll);
        const orbitTarget = hoveredIdx.current !== null ? 0 : clamp(1 - settleP * 1.4, 0, 1);
        currentSpeed.current += (orbitTarget - currentSpeed.current) * 0.04;
        animTime.current += dt * currentSpeed.current;
      }

      // ── G: CARD STATE MACHINE ──────────────────────────────
      smoothVelocity.current += (scrollVelocity.current - smoothVelocity.current) * 0.1;

      // Orbit ellipse
      let oCx = w * 0.70, oCy = h * 0.65, oRX = w * 0.175;
      if (w >= 1024)      { oCx = w * 0.70; oCy = h * 0.65; oRX = w * 0.175; }
      else if (w >= 768)  { oCx = w * 0.68; oCy = h * 0.65; oRX = w * 0.22; }
      else                { oCx = w * 0.50; oCy = h * 0.78; oRX = w * 0.32; }
      const oRY = oRX * 0.60;
      const globalAngle = (animTime.current / 100) * Math.PI * 2;

      // Pre-pin scroll phases
      const settleP = smoothstep(heroH * SETTLE_START, heroH * SETTLE_END, rawScroll);
      const alignP  = smoothstep(heroH * ALIGN_START,  heroH * ALIGN_END,  rawScroll);

      // Post-pin showcase phases
      // ── IPER Strip geometry ─────────────────────────────────────
      // Cards live in lower half of viewport (top 45% -> 94%), leaving generous breathing room below header
      const stripTop  = h * 0.45;                          // shifted down from 0.36 to 0.45 for spacious layout
      const stripH    = h * 0.49;                          // card height fills down to 94% vh
      const cardW     = clamp(w * 0.52, 380, 780);         // increased card length/width for cinematic presence!
      const cardH     = stripH;                             // fills strip height
      const cardGap   = clamp(w * 0.025, 14, 32);          // gap between cards
      const trackLeft = clamp(w * 0.04, 24, 64);           // left & right margin padding

      // Exact mathematical calculation so the last card stops with clean right margin (trackLeft) from screen edge
      const totalTrackSpan = (projects.length - 1) * (cardW + cardGap);
      const availableSpan  = Math.max(1, w - 2 * trackLeft - cardW);
      const maxScrollDist  = Math.max(0, totalTrackSpan - availableSpan);
      const maxActiveF     = maxScrollDist / (cardW + cardGap);

      // Post-pin showcase phases
      const sp = showcaseProgress.current;
      const paradeRaw = clamp(sp / Math.max(0.001, SP_PARADE_END), 0, 1);
      const activeF   = paradeRaw * maxActiveF;

      // Active project index for header info (0 -> 4)
      const activeIdx = Math.min(
        projects.length - 1,
        Math.floor(paradeRaw * projects.length)
      );

      // ── Magnetic Elastic Decay ──────────────────────────────────
      magnetUpPull.current   *= 0.88;
      magnetDownPull.current *= 0.88;
      magnetOffset.current   += (0 - magnetOffset.current) * 0.14;

      // Strip card position for index idx at current activeF
      // = slide the track left as activeF increases + magnetic elastic displacement
      const stripX = (idx) => trackLeft + (idx - activeF) * (cardW + cardGap);
      const stripY = stripTop + magnetOffset.current;

      // Orbit sculpture size (unchanged)
      const sculptW = w >= 768 ? 242 : 200;
      const sculptH = sculptW * 0.625;

      // Pre-pin align row (small) — cards gather in lower area before pin
      // Target the strip positions but slightly smaller for smooth grow-in
      const preW = clamp(w * 0.135, 130, 200);
      const preH = preW * 0.625;
      const preGap = cardW + cardGap;
      const preTotalW = (projects.length - 1) * preGap;
      const preStartX = w / 2 - preTotalW / 2 + (0 - activeF) * preGap;
      const preAlignX = (idx) => trackLeft + idx * (cardW + cardGap);
      const preAlignY = stripTop + stripH / 2 - preH / 2;

      // Post-showcase fade (after pin released, cards disappear as Scene 03 rises)
      const postFade = pinReleased.current
        ? clamp((sv - offsets[1]) / (heroH * 0.6), 0, 1)
        : 0;

      projects.forEach((proj, idx) => {
        const phys  = ORBIT_PHYSICS[idx];
        const state = cardStates.current[idx];

        // ── Orbital physics ───────────────────────────────────
        const theta       = globalAngle + phys.phase;
        const depthFactor = (Math.sin(theta) + 1) / 2;
        const orbitX      = oCx + Math.cos(theta) * oRX - sculptW / 2;
        const orbitY      = oCy + Math.sin(theta) * oRY - sculptH / 2;

        // Capture frozen positions just before align begins
        if (!orbitFrozen.current && settleP > 0.02) {
          // Will be captured per-card below
        }
        if (settleP < 0.05) {
          frozenOrbit.current[idx].x = orbitX;
          frozenOrbit.current[idx].y = orbitY;
          orbitFrozen.current = false;
        } else {
          orbitFrozen.current = true;
        }
        const frzX = frozenOrbit.current[idx].x;
        const frzY = frozenOrbit.current[idx].y;

        const offsetFromActive = idx - activeF;
        const absOff = Math.abs(offsetFromActive);

        // ── Decide target state by phase ─────────────────────
        let tX, tY, tW, tH, tOp, tBlur, tScale, tZ;
        let lerpSpeed = LERP_ORBIT;

        const inPinPhase   = isPinned.current || pinReleased.current;
        const isOrbitPhase  = !inPinPhase && settleP < 0.05;
        const isSettlePhase = !inPinPhase && settleP >= 0.05 && alignP < 0.02;
        const isAlignPhase  = !inPinPhase && alignP >= 0.02;
        const isParadePhase = inPinPhase;

        if (isOrbitPhase) {
          // ─ ORBIT: Normal ellipse sculpture ─
          tX = orbitX; tY = orbitY; tW = sculptW; tH = sculptH;
          const baseOp = imagesReady.current ? 0.65 + 0.35 * depthFactor : 0;
          const hovFactor = hoveredIdx.current !== null && hoveredIdx.current !== idx ? 0.85 : 1;
          tOp = baseOp * hovFactor;
          tBlur = 1.8 * (1 - depthFactor);
          tScale = 0.94 + 0.06 * depthFactor;
          tZ = 10 + Math.floor(depthFactor * 40);
          lerpSpeed = LERP_ORBIT;

        } else if (isSettlePhase) {
          // ─ SETTLE: Orbit speed drops, positions held ─
          tX = orbitX; tY = orbitY; tW = sculptW; tH = sculptH;
          tOp = imagesReady.current ? 0.65 + 0.35 * depthFactor : 0;
          tBlur = 1.8 * (1 - depthFactor);
          tScale = 0.94 + 0.06 * depthFactor;
          tZ = 10 + Math.floor(depthFactor * 40);
          lerpSpeed = LERP_ORBIT;

        } else if (isAlignPhase) {
          // ─ ALIGN: Orbit → IPER strip positions (full card size)
          // Cards lerp from frozen orbit positions directly to their strip slots
          const aE = easeInOutQuart(alignP);
          tX = lerp(frzX, preAlignX(idx), aE);
          tY = lerp(frzY, stripY, aE);
          tW = lerp(sculptW, cardW, aE);
          tH = lerp(sculptH, cardH, aE);
          tOp = lerp(imagesReady.current ? 0.65 + 0.35 * depthFactor : 0, 1.0, aE);
          tBlur = lerp(1.8 * (1 - depthFactor), 0, aE);
          tScale = lerp(0.94 + 0.06 * depthFactor, 1.0, aE);
          tZ = 20;
          lerpSpeed = LERP_TRANSITION;

        } else if (isParadePhase) {
          // ─ PARADE: IPER-style horizontal strip ─
          // All cards stay at same Y (strip), slide left as activeF grows
          const sX = stripX(idx);
          const cardRight = sX + cardW;

          tX = sX;
          tY = stripY;
          tW = cardW;
          tH = cardH;

          // Silky smooth edge fade-in & blur-in (entering right) and fade-out & blur-out (exiting left)
          const leftFadeZone  = smoothstep(-cardW * 0.35, cardW * 0.25, cardRight);
          const rightFadeZone = 1.0 - smoothstep(w - cardW * 0.25, w + cardW * 0.35, sX);
          tOp = leftFadeZone * rightFadeZone;

          // Edge blur: 0px in active viewport -> 10px as cards slide into/out of boundaries
          tBlur  = (1.0 - tOp) * 10;
          tScale = 1.0;
          tZ = tOp > 0.05 ? Math.max(5, 20 - Math.floor(absOff * 4)) : 1;
          lerpSpeed = LERP_PARADE;

        } else {
          // ─ POST-SHOWCASE or fallback ─
          tX = stripX(0); tY = stripY;
          tW = cardW; tH = cardH;
          tOp = 0; tBlur = 0; tScale = 1.0; tZ = 5;
          lerpSpeed = LERP_TRANSITION;
        }

        // Apply post-showcase global fade
        tOp *= (1 - postFade);

        // ── Lerp toward targets ───────────────────────────────
        const pLerp  = lerpSpeed;
        const pFast  = Math.min(pLerp * 2.5, 0.35);
        const inAnim = settleP > 0.02 || inPinPhase;

        state.x += (tX - state.x) * (inAnim ? pLerp : pFast);
        state.y += (tY - state.y) * (inAnim ? pLerp : pFast);
        state.w += (tW - state.w) * pLerp;
        state.h += (tH - state.h) * pLerp;
        state.opacity += (tOp - state.opacity) * (inAnim ? pLerp * 1.4 : 0.12);
        state.scale   += (tScale - state.scale) * pLerp;
        state.blur    += (tBlur - state.blur) * 0.10;
        state.zIndex   = tZ;

        // Hover lift in orbit only
        const hoverLiftY = isOrbitPhase || isSettlePhase
          ? (-5 * (state.hoverDepth || 0))
          : 0;

        // Hover state (orbit + settle only)
        const thisHovered = hoveredIdx.current === idx;
        if (isOrbitPhase || isSettlePhase) {
          if (state.hoverDepth === undefined) state.hoverDepth = 0;
          state.hoverDepth += ((thisHovered ? 1 : 0) - state.hoverDepth) * 0.15;
        } else {
          state.hoverDepth = (state.hoverDepth || 0) * 0.9;
        }

        // Velocity tilt (orbit/settle only)
        const tiltX = (isOrbitPhase || isSettlePhase)
          ? clamp(smoothVelocity.current * -0.05, -2, 2)
          : 0;

        // ── Write to DOM ──────────────────────────────────────
        const applyStyle = (el, prop, val) => {
          const k = '_' + prop;
          if (el[k] !== val) { el.style[prop] = val; el[k] = val; }
        };

        const finalBlur = state.blur > 0.15 ? `blur(${state.blur.toFixed(1)}px)` : 'none';
        const tx = state.x.toFixed(1);
        const ty = (state.y + hoverLiftY).toFixed(1);
        const sc = state.scale.toFixed(3);
        const rx = tiltX.toFixed(2);
        const transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sc}) rotateX(${rx}deg)`;

        const isFeaturedCard = isParadePhase && (absOff < 0.5 || activeIdx === idx);
        const isPassiveCard  = isParadePhase && !isFeaturedCard && absOff < 2.5;
        const inShowcaseCard = isParadePhase || alignP > 0.25;

        // Calculate inner image horizontal parallax offset as card moves left on scroll
        const cardCenterX  = state.x + state.w / 2;
        const relativeX    = (cardCenterX - w * 0.5) / (w * 0.5); // -1.5 to +1.5 relative to screen center
        const imgParallaxX = clamp(-relativeX * 52, -55, 55);    // image glides smoothly inside fixed card frame

        [cardRefs1.current[idx], cardRefs2.current[idx]].forEach(el => {
          if (!el) return;
          applyStyle(el, 'transform', transform);
          applyStyle(el, 'width',   `${state.w.toFixed(1)}px`);
          applyStyle(el, 'height',  `${state.h.toFixed(1)}px`);
          applyStyle(el, 'opacity', clamp(state.opacity, 0, 1).toFixed(3));
          applyStyle(el, 'filter',  finalBlur);
          applyStyle(el, 'zIndex',  Math.round(state.zIndex));
          el.classList.toggle('is-featured', isFeaturedCard);
          el.classList.toggle('is-passive',  isPassiveCard);
          el.classList.toggle('in-showcase', inShowcaseCard);

          const imgEl = el.querySelector('.project-card-image');
          if (imgEl) {
            const imgTx = (isParadePhase || alignP > 0.5) ? imgParallaxX.toFixed(1) : 0;
            applyStyle(imgEl, 'transform', `translate3d(${imgTx}px, 0, 0) scale(1.14)`);
          }
        });
      });

      // ── H: INFO OVERLAY UPDATE ─────────────────────────────
      // Header fades in smoothly as Section 02 covers Hero, stays 1.0 while pinned
      const sec2Coverage = smoothstep(heroH * 0.35, heroH * 0.85, sv);
      const infoOp  = isPinned.current ? 1.0 : sec2Coverage;
      const dotsOp  = isPinned.current ? 1.0 : sec2Coverage;

      if (activeIdx !== lastActiveIdx || infoOp > 0) {
        lastActiveIdx = activeIdx;
        const proj = projects[Math.min(activeIdx, projects.length - 1)];

        [infoRef1.current, infoRef2.current].forEach(ir => {
          if (!ir) return;
          if (ir.titleEl)    ir.titleEl.textContent    = proj.title;
          if (ir.subtitleEl) ir.subtitleEl.textContent = proj.subtitle;
          if (ir.categoryEl) ir.categoryEl.textContent = proj.category;
          if (ir.numberEl)   ir.numberEl.textContent   = proj.number;
          if (ir.yearEl)     ir.yearEl.textContent     = proj.number;
          if (ir.infoBlockEl) {
            ir.infoBlockEl.style.opacity = infoOp.toFixed(3);
            ir.infoBlockEl.style.transform = Math.abs(magnetOffset.current) > 0.1 
              ? `translate3d(0, ${magnetOffset.current.toFixed(1)}px, 0)` 
              : 'none';
          }

          if (ir.dotEls) {
            const dotsParent = ir.dotEls[0]?.parentElement;
            if (dotsParent) dotsParent.style.opacity = dotsOp.toFixed(3);
            ir.dotEls.forEach((dot, di) => {
              if (dot) dot.classList.toggle('is-active', di === activeIdx);
            });
          }
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove',   onMouseMove);
      window.removeEventListener('resize',      measureScenes);
      window.removeEventListener('wheel',       onWheel,      { capture: true });
      window.removeEventListener('touchstart',  onTouchStart, { capture: true });
      window.removeEventListener('touchmove',   onTouchMove,  { capture: true });
      clearTimeout(initTimeout);
      lenis.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // JSX — identical layered structure
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full">
      {/* ── SCROLL SPACER ── */}
      <div
        style={{ height: `${contentHeight}px` }}
        className="w-full relative pointer-events-none"
      />

      {/* ══ LAYER 1: BASE ══════════════════════════════════════ */}
      <div className="fixed inset-0 w-full h-full z-10 overflow-hidden pointer-events-none">
        <Canvas isLayer2={false} />
        <div
          ref={content1Ref}
          className="absolute top-0 left-0 w-full h-full pointer-events-auto z-10"
        >
          {/* Scene 01 — Hero */}
          <div
            ref={(el) => (sceneRefs1.current[0] = el)}
            className="scene-environment material-concrete scene-01"
            style={{ top: 0, height: '100vh', zIndex: 1 }}
          >
            <Hero ref={heroRef1} isLayer2={false} />
          </div>

          {/* Scene 02 — Exhibition Backdrop */}
          <div
            ref={(el) => (sceneRefs1.current[1] = el)}
            className="scene-environment scene-02"
            style={{ top: 0, height: '100vh', zIndex: 2 }}
          >
            <ProjectShowcase isLayer2={false} infoRef={infoRef1.current} />
          </div>

          {/* Scene 03 — Manifesto */}
          <div
            ref={(el) => (sceneRefs1.current[2] = el)}
            className="scene-environment material-anodized-aluminium scene-03"
            style={{ top: 0, height: '100vh', zIndex: 3 }}
          >
            <ManifestoScene isLayer2={false} manifestoRef={manifestoRef1.current} />
          </div>

          {/* Scene 04 — About */}
          <div
            ref={(el) => (sceneRefs1.current[3] = el)}
            className="scene-environment material-limestone-plaster scene-04"
            style={{ top: 0, zIndex: 4 }}
          >
            <AboutScene isLayer2={false} />
          </div>

          {/* Scene 05 — Contact */}
          <div
            ref={(el) => (sceneRefs1.current[4] = el)}
            className="scene-environment material-deep-charcoal scene-05"
            style={{ top: 0, zIndex: 5 }}
          >
            <ContactScene isLayer2={false} />
          </div>

          {/* ── Project Cards (Layer 1) ── */}
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              isLayer2={false}
              cardRef={(el) => (cardRefs1.current[idx] = el)}
              onPointerEnter={() => { hoveredIdx.current = idx; }}
              onPointerLeave={() => { hoveredIdx.current = null; }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ══ LAYER 2: INVERTED CLIPPED ══════════════════════════ */}
      <div
        ref={layer2Ref}
        className="fixed inset-0 w-full h-full z-20 overflow-hidden pointer-events-none select-none"
      >
        <Canvas isLayer2={true} />
        <div
          ref={content2Ref}
          className="absolute top-0 left-0 w-full h-full z-10"
        >
          {/* Scene 01 — Hero (L2) */}
          <div
            ref={(el) => (sceneRefs2.current[0] = el)}
            className="scene-environment scene-layer2 scene-01"
            style={{ top: 0, height: '100vh', zIndex: 1, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <Hero ref={heroRef2} isLayer2={true} />
          </div>

          {/* Scene 02 — Backdrop (L2) */}
          <div
            ref={(el) => (sceneRefs2.current[1] = el)}
            className="scene-environment scene-layer2 scene-02"
            style={{ top: 0, height: '100vh', zIndex: 2, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <ProjectShowcase isLayer2={true} infoRef={infoRef2.current} />
          </div>

          {/* Scene 03 — Manifesto (L2) */}
          <div
            ref={(el) => (sceneRefs2.current[2] = el)}
            className="scene-environment scene-layer2 scene-03"
            style={{ top: 0, height: '100vh', zIndex: 3, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <ManifestoScene isLayer2={true} manifestoRef={manifestoRef2.current} />
          </div>

          {/* Scene 04 — About (L2) */}
          <div
            ref={(el) => (sceneRefs2.current[3] = el)}
            className="scene-environment scene-layer2 scene-04"
            style={{ top: 0, zIndex: 4, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <AboutScene isLayer2={true} />
          </div>

          {/* Scene 05 — Contact (L2) */}
          <div
            ref={(el) => (sceneRefs2.current[4] = el)}
            className="scene-environment scene-layer2 scene-05"
            style={{ top: 0, zIndex: 5, backgroundColor: 'transparent', backgroundImage: 'none' }}
          >
            <ContactScene isLayer2={true} />
          </div>

          {/* ── Project Cards (Layer 2) ── */}
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

      {/* ── BOOT SEQUENCE ── */}
      <BootSequence currentPos={currentPos} currentSize={currentSize} />
    </div>
  );
}
