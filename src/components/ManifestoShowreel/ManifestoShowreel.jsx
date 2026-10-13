import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PixelScrollTransition from '../PixelScrollTransition/PixelScrollTransition';
import './ManifestoShowreel.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MANIFESTO_LINES = [
  "I'm Shourya, a developer and engineering student based in Delhi, India.",
  "Currently pursuing B.Tech in Industrial Internet of Things at GGSIPU.",
  "I work at the intersection of software engineering, intelligent systems, and design.",
  "My focus is building digital products that are functional, thoughtful, and technically sound.",
  "I work primarily with React, JavaScript, Python, Framer, Gsap and modern web technologies.",
  "From frontend interfaces to backend systems, I enjoy bringing ideas to life.",
  "PlacePro reflects my interest in building practical, real-world web applications.",
  "Beyond development, I explore emerging technologies through engineering projects and hackathons.",
  "I believe good engineering is not just about making things work, but making them work exceptionally well.",
];

export default function ManifestoShowreel({ isHeroReady = true }) {
  const rootRef = useRef(null);
  const linesContainerRef = useRef(null);
  const lineRefs = useRef([]);
  const logoWrapRef = useRef(null);
  const videoRef = useRef(null);

  // Guarantee continuous video playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  }, []);

  useGSAP(() => {
    if (!rootRef.current || !linesContainerRef.current) return;

    // ── Smooth Corner Entrance for LOGO1 ──
    if (logoWrapRef.current) {
      gsap.fromTo(
        logoWrapRef.current,
        { opacity: 0, scale: 0.85, y: -20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 85%',
            end: 'center 45%',
            scrub: 1.2,
          },
        }
      );
    }

    const lines = lineRefs.current.filter(Boolean);
    if (!lines.length) return;

    // Alternating scrub lines entrance from both sides
    lines.forEach((line, i) => {
      const isLeft = i % 2 === 0;
      const dist = isLeft ? -(4.5 + (i % 3) * 1.5) : (4.5 + (i % 3) * 1.5);

      gsap.fromTo(
        line,
        { x: `${dist}vw`, opacity: 0.25 },
        {
          x: '0vw',
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 85%',
            end: 'center 48%',
            scrub: 1.2,
          },
        }
      );
    });

  }, { scope: rootRef, dependencies: [isHeroReady] });

  return (
    <section className="manifesto-showreel-section" ref={rootRef} id="manifesto">
      {/* 1. Pixelated Scroll Curtain Transition from Cream Hero */}
      <PixelScrollTransition
        targetColor="#ff6831"
        parentRef={rootRef}
        isEnabled={isHeroReady}
      />

      <div className="manifesto-inner">
        {/* Animated LOGO1 Background-Removed Mascot in Top-Left Corner */}
        <div className="manifesto-logo-wrap" ref={logoWrapRef}>
          <video
            ref={videoRef}
            src="/LOGO1.webm"
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            className="manifesto-logo-video"
            aria-hidden="true"
          />
        </div>

        {/* Alternating lines slide in from both sides as the section enters view */}
        <div className="manifesto-lines-container" ref={linesContainerRef}>
          {MANIFESTO_LINES.map((text, i) => (
            <p
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              className="manifesto-line"
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
