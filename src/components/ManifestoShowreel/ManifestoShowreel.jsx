import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ManifestoShowreel.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MANIFESTO_LINES = [
  "CRAFTING IMMERSIVE DIGITAL EXPERIENCES WITH PRECISION",
  "WHERE MODERN WEB ARCHITECTURE MEETS MOTION AND ART",
  "EXPLORING BOUNDARIES BEYOND THE ORDINARY SYSTEM",
  "WEBSITES THAT BREATHE & BRANDS THAT RESONATE",
  "EVERY PIXEL PLACED WITH INTENTION & PURPOSE",
];

export default function ManifestoShowreel() {
  const rootRef     = useRef(null);
  const textRef     = useRef(null);
  const badgeRef    = useRef(null);
  const videoCardRef = useRef(null);

  useGSAP(() => {
    if (!rootRef.current) return;

    // Badge entrance
    gsap.fromTo(badgeRef.current,
      { opacity: 0, x: -16 },
      {
        opacity: 1, x: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: {
          trigger: badgeRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Line-by-line word scrub reveal
    const lines = textRef.current.querySelectorAll('.manifesto-line');
    lines.forEach((line) => {
      gsap.fromTo(
        line,
        { opacity: 0.1, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 88%',
            end: 'top 52%',
            scrub: 1.2,
          },
        }
      );
    });

    // Video Reel Scale & Clip Expansion
    if (videoCardRef.current) {
      gsap.fromTo(
        videoCardRef.current,
        { scale: 0.86, borderRadius: '20px' },
        {
          scale: 1.0,
          borderRadius: '0px',
          ease: 'none',
          scrollTrigger: {
            trigger: videoCardRef.current,
            start: 'top 80%',
            end: 'top 15%',
            scrub: true,
          },
        }
      );
    }
  }, { scope: rootRef });

  return (
    <section className="manifesto-showreel-section" ref={rootRef} id="manifesto">

      {/* Section Badge */}
      <div className="manifesto-header-badge" ref={badgeRef}>
        <span className="badge-number font-mono">002 /</span>
        <span className="badge-title font-mono">PHILOSOPHY &amp; MANIFESTO</span>
      </div>

      {/* Manifesto Lines */}
      <div className="manifesto-text-container" ref={textRef}>
        {MANIFESTO_LINES.map((line, idx) => (
          <h2 key={idx} className="manifesto-line">
            {line}
          </h2>
        ))}
      </div>

      {/* Embedded Showreel Preview */}
      <div
        className="showreel-card-wrapper"
        ref={videoCardRef}
        data-cursor="SHOWREEL"
      >
        <video
          src="/WEBNAME.webm"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="showreel-video"
        />
        <div className="showreel-overlay">
          <span className="showreel-label">FOUNDRY SHOWREEL 2026</span>
          <span className="showreel-tag font-mono">HIGH FREQUENCY MOTION</span>
        </div>
      </div>

    </section>
  );
}
