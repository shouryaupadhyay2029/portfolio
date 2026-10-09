import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './IntroOverlay.css';

/**
 * IntroOverlay — Awwwards-style name intro animation
 *
 * Unique vs Alberto Oviedo:
 *  1. Letter-by-letter stagger (not word-level)
 *  2. Two lines — "SHOURYA" + "UPADHYAY" — split directions on exit
 *  3. "UPADHYAY" slides down/fades out while "SHOURYA" flies to nav
 *  4. Hero content reveals simultaneously (mirror counterpoint)
 */
export default function IntroOverlay({ brandRef, onComplete }) {
  const overlayRef  = useRef(null);
  const line1Ref    = useRef(null);
  const line2Ref    = useRef(null);
  const letters1Ref = useRef([]);
  const letters2Ref = useRef([]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const brand   = brandRef?.current;
    if (!overlay || !brand) {
      onComplete?.();
      return;
    }

    const L1 = letters1Ref.current.filter(Boolean);
    const L2 = letters2Ref.current.filter(Boolean);
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;

    // Lock scroll during intro
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        onComplete?.();
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => {
            overlay.style.display = 'none';
          },
        });
      },
    });

    // ── Phase 1: Letters stagger in — "SHOURYA" ─────────────────
    tl.fromTo(
      L1,
      { opacity: 0, y: 32, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.055,
      }
    );

    // ── Phase 2: "UPADHYAY" fades in below, slightly delayed ─────
    tl.fromTo(
      L2,
      { opacity: 0, y: 20, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.04,
      },
      '-=0.3'
    );

    // ── Phase 3: Hold ─────────────────────────────────────────────
    tl.to({}, { duration: 0.55 });

    // ── Phase 4: SPLIT EXIT ───────────────────────────────────────
    // "UPADHYAY" slides down + fades out
    tl.to(
      line2,
      {
        y: 60,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.75,
        ease: 'power3.in',
      },
      'split'
    );

    // "SHOURYA" scales down + flies to nav brand position
    tl.add(() => {
      const brandRect = brand.getBoundingClientRect();
      const line1Rect = line1.getBoundingClientRect();

      // Distance from current center of line1 to center of brand nav element
      const currentCX = line1Rect.left + line1Rect.width  / 2;
      const currentCY = line1Rect.top  + line1Rect.height / 2;
      const targetCX  = brandRect.left + brandRect.width  / 2;
      const targetCY  = brandRect.top  + brandRect.height / 2;

      const dx = targetCX - currentCX;
      const dy = targetCY - currentCY;

      // Scale = ratio of brand height to line1 height (approximate)
      const scaleRatio = (brandRect.height * 0.85) / line1Rect.height;

      gsap.to(line1, {
        x: dx,
        y: dy,
        scale: scaleRatio,
        transformOrigin: 'center center',
        duration: 0.95,
        ease: 'power4.inOut',
      });

      // Fade line1 out near the end so brand logo takes over
      gsap.to(line1, {
        opacity: 0,
        duration: 0.3,
        delay: 0.7,
        ease: 'power2.in',
      });
    }, 'split');

    // ── Phase 5: Wait for motion to finish ────────────────────────
    tl.to({}, { duration: 1.0 });

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, []);

  const NAME1 = 'SHOURYA';
  const NAME2 = 'UPADHYAY';

  return (
    <div ref={overlayRef} className="intro-overlay" aria-hidden="true">
      <div className="intro-stage">

        {/* Line 1 — flies to nav on exit */}
        <div ref={line1Ref} className="intro-line intro-line--1">
          {NAME1.split('').map((ch, i) => (
            <span
              key={i}
              ref={(el) => (letters1Ref.current[i] = el)}
              className="intro-letter"
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Line 2 — falls away on exit */}
        <div ref={line2Ref} className="intro-line intro-line--2">
          {NAME2.split('').map((ch, i) => (
            <span
              key={i}
              ref={(el) => (letters2Ref.current[i] = el)}
              className="intro-letter intro-letter--sub"
            >
              {ch}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
