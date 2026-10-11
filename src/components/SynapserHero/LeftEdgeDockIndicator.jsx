import React, { forwardRef } from 'react';
import './LeftEdgeDockIndicator.css';

/**
 * LeftEdgeDockIndicator — Architectural Edge Dock Indicator
 * Physically attached flush to the viewport's middle-left boundary.
 */
const LeftEdgeDockIndicator = forwardRef((props, ref) => {
  const handleClick = () => {
    const nextSection = document.querySelector('#works') || document.querySelector('#manifesto');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  return (
    <aside
      className="left-edge-dock"
      ref={ref}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Proceed to works archive"
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* 1. Top Section Index Indicator */}
      <div className="dock-head">
        <span className="dock-badge font-mono">01</span>
        <div className="dock-notch" aria-hidden="true" />
      </div>

      {/* 2. Middle Vertical Architectural Typography */}
      <div className="dock-spine">
        <span className="dock-label font-mono">INDEX // DESCENT</span>
      </div>

      {/* 3. Bottom Kinetic Slit Arrow Chamber */}
      <div className="dock-arrow-chamber" aria-hidden="true">
        <svg
          className="dock-arrow-svg"
          viewBox="0 0 14 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="7"
            y1="2"
            x2="7"
            y2="16"
            stroke="#ad7b73"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M 3.5 12.5 L 7 16 L 10.5 12.5"
            stroke="#ad7b73"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </aside>
  );
});

export default LeftEdgeDockIndicator;
