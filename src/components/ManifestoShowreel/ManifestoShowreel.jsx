import React, { useRef } from 'react';
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

  useGSAP(() => {
    if (!rootRef.current || !linesContainerRef.current) return;

    const lines = lineRefs.current.filter(Boolean);
    if (!lines.length) return;

    // Alternating horizontal drift distances:
    // Left lines glide in from the left, right lines glide in from the right
    lines.forEach((line, i) => {
      const isLeft = i % 2 === 0;
      // Controlled drift (4.5vw to 7.5vw) so long sentences never clip past screen boundaries
      const dist = isLeft ? -(4.5 + (i % 3) * 1.5) : (4.5 + (i % 3) * 1.5);

      gsap.fromTo(
        line,
        {
          x: `${dist}vw`,
          opacity: 0.25,
        },
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
        {/* Central Converging Lines (Synapser Studio alternating slide-in) */}
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
