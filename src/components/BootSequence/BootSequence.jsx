import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './BootSequence.css';

gsap.registerPlugin(useGSAP);

/**
 * BootSequence — Cinematic Video Intro
 *
 * Layout:  [LOGO1] / [LOGO2] / [LOGO3]
 *          three cartoon videos, side by side, white bg removed via mix-blend-mode
 *          separated by two outlined SVG "/" marks (same style as hero)
 *
 * Timeline:
 *  0.0s  — Screen is cream, all elements invisible
 *  0.3s  — Slashes draw themselves (stroke-dashoffset)
 *  0.6s  — Videos fade in staggered, scale up
 *  3.5s  — Videos & outer slashes fade out, scale
 *  4.2s  — The two slashes merge together (translateX toward each other)
 *  4.8s  — Merged slashes shrink + descend to center of screen (hero position)
 *  5.4s  — Full screen fades out → boot complete
 */
export default function BootSequence({ currentPos, currentSize }) {
  const [bootComplete, setBootComplete] = React.useState(false);

  const rootRef        = useRef(null);
  const slashGroupRef  = useRef(null); // the whole slash+video assembly
  const slash1Ref      = useRef(null); // left "/" (between v1 and v2)
  const slash2Ref      = useRef(null); // right "/" (between v2 and v3)
  const video1WrapRef  = useRef(null);
  const video2WrapRef  = useRef(null);
  const video3WrapRef  = useRef(null);

  useGSAP(() => {
    const root       = rootRef.current;
    const slashGroup = slashGroupRef.current;
    const slash1     = slash1Ref.current;
    const slash2     = slash2Ref.current;
    const v1         = video1WrapRef.current;
    const v2         = video2WrapRef.current;
    const v3         = video3WrapRef.current;

    if (!root || !slashGroup) return;

    // ── INIT: everything hidden ─────────────────────────────────
    gsap.set([v1, v2, v3], { opacity: 0, scale: 0.82, filter: 'blur(8px)' });
    gsap.set([slash1, slash2], { opacity: 0 });
    const lines1 = slash1 ? Array.from(slash1.querySelectorAll('.boot-slash-path')) : [];
    const lines2 = slash2 ? Array.from(slash2.querySelectorAll('.boot-slash-path')) : [];
    if (lines1.length || lines2.length) {
      gsap.set([...lines1, ...lines2], { strokeDashoffset: 120 });
    }

    const tl = gsap.timeline();

    // ── ACT 1: Slashes draw in (stroke animation) ───────────────
    tl.to([slash1, slash2], {
      opacity: 1,
      duration: 0.25,
      ease: 'power2.out',
    }, 0.3);

    tl.to([...lines1, ...lines2], {
      strokeDashoffset: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      stagger: 0.04,
    }, 0.3);

    // ── ACT 2: Videos rise in (staggered, scale from 0.82→1) ────
    tl.to(v1, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 0.75, ease: 'power3.out',
    }, 0.6);

    tl.to(v2, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 0.75, ease: 'power3.out',
    }, 0.72);

    tl.to(v3, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 0.75, ease: 'power3.out',
    }, 0.84);

    // ── HOLD: videos play for ~2.5s ─────────────────────────────
    // (nothing to animate — just let them play)

    // ── ACT 3: Videos fade out + scale down ─────────────────────
    tl.to([v1, v3], {
      opacity: 0, scale: 0.78, filter: 'blur(6px)',
      duration: 0.55, ease: 'power3.in',
    }, 3.5);

    tl.to(v2, {
      opacity: 0, scale: 0.78, filter: 'blur(6px)',
      duration: 0.55, ease: 'power3.in',
    }, 3.58);

    // ── ACT 4: Slashes collapse together ────────────────────────
    // slash1 (left slash) moves RIGHT, slash2 (right slash) moves LEFT
    tl.to(slash1, {
      x: 22,
      duration: 0.55,
      ease: 'power3.inOut',
    }, 4.0);

    tl.to(slash2, {
      x: -22,
      duration: 0.55,
      ease: 'power3.inOut',
    }, 4.0);

    // ── ACT 5: Merged group scales down + moves to hero position ─
    // The hero's oviedo-center-tag is at 50%/50% of the page.
    // We animate the whole slashGroup to shrink and re-center
    tl.to(slashGroup, {
      scale: 0.48,
      duration: 0.5,
      ease: 'power3.inOut',
    }, 4.52);

    // ── ACT 6: Full screen fades out ────────────────────────────
    tl.to(root, {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        if (root) root.style.display = 'none';
        setBootComplete(true);
      },
    }, 5.1);

  }, { scope: rootRef });

  if (bootComplete) return null;

  return (
    <div className="boot-root" ref={rootRef}>
      {/* Grain texture overlay */}
      <div className="boot-grain" aria-hidden="true" />

      {/* Central composition: [Video1] / [Video2] / [Video3] */}
      <div className="boot-stage" ref={slashGroupRef}>

        {/* Video 1 */}
        <div className="boot-video-wrap" ref={video1WrapRef}>
          <video
            src="/LOGO1.webm"
            autoPlay muted playsInline loop preload="auto"
            className="boot-video"
          />
        </div>

        {/* Slash 1 — between Video 1 and Video 2 */}
        <div className="boot-slash-wrap" ref={slash1Ref} aria-hidden="true">
          <svg
            className="boot-slash-svg"
            viewBox="0 0 60 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 42 4 L 18 86"
              className="boot-slash-path"
              stroke="#ad7b73"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Video 2 */}
        <div className="boot-video-wrap" ref={video2WrapRef}>
          <video
            src="/LOGO2.webm"
            autoPlay muted playsInline loop preload="auto"
            className="boot-video"
          />
        </div>

        {/* Slash 2 — between Video 2 and Video 3 */}
        <div className="boot-slash-wrap" ref={slash2Ref} aria-hidden="true">
          <svg
            className="boot-slash-svg"
            viewBox="0 0 60 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 42 4 L 18 86"
              className="boot-slash-path"
              stroke="#ad7b73"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Video 3 */}
        <div className="boot-video-wrap" ref={video3WrapRef}>
          <video
            src="/LOGO3.webm"
            autoPlay muted playsInline loop preload="auto"
            className="boot-video"
          />
        </div>

      </div>
    </div>
  );
}
