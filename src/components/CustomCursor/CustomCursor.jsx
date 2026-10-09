import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

/**
 * CustomCursor — Awwwards SOTD-level fluid trailing cursor
 * Morphs contextually:
 *  - default: hairline ring + dot
 *  - over clickable/interactive: ring expands into pill with label ("VIEW", "DRAG", "EXPLORE")
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const [label, setLabel] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let rafId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check hover targets
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const cursorType = target.getAttribute('data-cursor');
        setLabel(cursorType || '');
        setIsHovered(true);
      } else if (e.target.closest('a, button, input, [role="button"]')) {
        setLabel('');
        setIsHovered(true);
      } else {
        setLabel('');
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);

    const loop = () => {
      // Lerp for smooth trailing inertia
      followerX += (mouseX - followerX) * 0.14;
      followerY += (mouseY - followerY) * 0.14;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Precise Center Dot */}
      <div ref={cursorRef} className="custom-cursor-dot" />

      {/* Smooth Trailing Ring / Pill */}
      <div
        ref={followerRef}
        className={`custom-cursor-follower ${isHovered ? 'is-hovered' : ''} ${
          isMouseDown ? 'is-active' : ''
        } ${label ? 'has-label' : ''}`}
      >
        {label && <span className="custom-cursor-label">{label}</span>}
      </div>
    </>
  );
}
