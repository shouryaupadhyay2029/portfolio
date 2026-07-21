import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import './ProjectShowcase.css';

/**
 * ProjectShowcase — IPER-style pinned exhibition backdrop
 *
 * Layout:
 *  ┌────────────────────────────────────────────┐
 *  │  THE WORK              (01 / 05)           │  ← eyebrow row  ~8vh
 *  │  ──────────────────────────────────────    │  ← top divider
 *  │                                            │
 *  │  SELECTED              PLACEPRO            │  ← headline     ~16vh
 *  │  WORK                                      │
 *  │                                            │
 *  │  ──────────────────────────────────────    │  ← bottom divider
 *  │  Subtitle                        2025      │  ← meta row     ~6vh
 *  ├────────────────────────────────────────────┤  ← h * 0.36
 *  │                                            │
 *  │   [ card ]   [ card ]   [ card peek ]      │  ← card strip   ~56vh
 *  │                                            │
 *  │              ● ○ ○ ○ ○                     │  ← progress     ~4vh
 *  └────────────────────────────────────────────┘
 *
 * Cards are positioned by RevealLensContainer's RAF loop.
 * All text nodes are mutated directly from the tick via infoRef.
 */
export default function ProjectShowcase({ isLayer2 = false, infoRef }) {
  const rootRef       = useRef(null);
  const titleRef      = useRef(null);
  const subtitleRef   = useRef(null);
  const categoryRef   = useRef(null);
  const numberRef     = useRef(null);
  const yearRef       = useRef(null);
  const dotsRef       = useRef([]);
  const infoBlockRef  = useRef(null);

  // Register DOM refs for RAF mutation
  useEffect(() => {
    if (infoRef) {
      infoRef.titleEl     = titleRef.current;
      infoRef.subtitleEl  = subtitleRef.current;
      infoRef.categoryEl  = categoryRef.current;
      infoRef.numberEl    = numberRef.current;
      infoRef.yearEl      = yearRef.current;
      infoRef.dotEls      = dotsRef.current;
      infoRef.infoBlockEl = infoBlockRef.current;
    }
  }, [infoRef]);

  return (
    <div
      ref={rootRef}
      className={cn('sc-backdrop', isLayer2 && 'sc-backdrop--layer2')}
      aria-hidden={isLayer2}
    >
      {/* ── HEADER BLOCK (top ~36% of viewport) ─────────────────── */}
      <div ref={infoBlockRef} className="sc-header">


        {/* Headline + rotating "THE WORK" circle badge & project name */}
        <div className="sc-headline-row">
          <h2 className="sc-headline">
            Selected<br />Work
          </h2>

          {/* Right side: Rotating "THE WORK" circular badge + active project title */}
          <div className="sc-right-badge-wrap">
            <div className="sc-rotating-badge" aria-hidden="true">
              <svg viewBox="0 0 120 120" className="sc-badge-svg">
                <path
                  id={isLayer2 ? 'scTextPathLayer2' : 'scTextPathLayer1'}
                  d="M 60, 60 m -42, 0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
                  fill="none"
                />
                <text className="sc-badge-text">
                  <textPath href={isLayer2 ? '#scTextPathLayer2' : '#scTextPathLayer1'} startOffset="0%">
                    THE WORK • THE WORK • THE WORK • 
                  </textPath>
                </text>
              </svg>
              <div className="sc-badge-center-dot" />
            </div>
            <span ref={titleRef} className="sc-project-name">PLACEPRO</span>
          </div>
        </div>

        {/* Bottom thin divider */}
        <div className="sc-rule" />

        {/* Meta row */}
        <div className="sc-meta-row">
          <span ref={categoryRef} className="sc-meta-category">
            FULL STACK / ARCHITECTURE
          </span>
          <span ref={yearRef} className="sc-meta-year">01</span>
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} className="sc-subtitle">
          Institutional Placement &amp; Career Intelligence Platform
        </p>
      </div>

      {/* ── CARD STRIP ZONE (bottom ~60%) — no DOM needed, RAF handles cards ── */}
      <div className="sc-strip-zone" aria-hidden="true" />


    </div>
  );
}
