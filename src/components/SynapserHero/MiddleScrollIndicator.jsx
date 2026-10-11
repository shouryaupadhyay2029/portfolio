import React, { forwardRef } from 'react';
import './MiddleScrollIndicator.css';

/**
 * MiddleScrollIndicator — Architectural Studio Scroll Indicator
 * Positioned on the middle-left of the Hero section.
 */
const MiddleScrollIndicator = forwardRef((props, ref) => {
  const handleClick = () => {
    // Smooth scroll to next scene (#works or manifesto)
    const nextSection = document.querySelector('#works') || document.querySelector('#manifesto');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="middle-scroll-indicator"
      ref={ref}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Proceed to archive"
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* 1. Header Index Tag */}
      <div className="scroll-tag-header">
        <span className="scroll-crosshair" aria-hidden="true">┼</span>
        <span className="scroll-index-code font-mono">[ 01 // 05 ]</span>
      </div>

      {/* 2. Kinetic Hairline Axis */}
      <div className="scroll-track-axis" aria-hidden="true">
        <div className="scroll-axis-line" />
        <div className="scroll-axis-pulse-node" />
      </div>

      {/* 3. Professional Editorial Action Label */}
      <div className="scroll-label-wrapper font-mono">
        <span className="scroll-action-text">PROCEED TO ARCHIVE</span>
        <svg className="scroll-arrow-svg" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M 6 1 L 6 11 M 2 7 L 6 11 L 10 7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
});

export default MiddleScrollIndicator;
