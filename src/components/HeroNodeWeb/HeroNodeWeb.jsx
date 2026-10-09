import React, { useEffect, useRef, useState } from 'react';
import './HeroNodeWeb.css';

const CONCEPT_TAGS = [
  { id: 'threejs', text: 'three.js', x: 18, y: 22 },
  { id: 'precision', text: 'precision', x: 26, y: 36 },
  { id: 'creative', text: 'creative dev', x: 14, y: 52 },
  { id: 'design', text: 'design systems', x: 22, y: 76 },
  { id: 'craft', text: 'craft', x: 34, y: 84 },
  { id: 'react', text: 'react & next.js', x: 62, y: 26 },
  { id: 'motion', text: 'motion & gsap', x: 78, y: 22 },
  { id: 'ai', text: 'ai workflows', x: 84, y: 38 },
  { id: 'webgl', text: 'webgl shaders', x: 72, y: 64 },
  { id: 'fullstack', text: 'full stack', x: 82, y: 78 },
  { id: 'uiux', text: 'interface design', x: 68, y: 86 },
  { id: 'experience', text: 'digital experience', x: 48, y: 16 },
];

export default function HeroNodeWeb() {
  const containerRef = useRef(null);
  const wordmarkRef = useRef(null);
  const [nodes, setNodes] = useState(CONCEPT_TAGS);
  const [lines, setLines] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [timeString, setTimeString] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeString(now.toLocaleTimeString('en-US', options) + ' IST');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute SVG Ray Lines connecting wordmark center to each node tag
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current || !wordmarkRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const wordmarkRect = wordmarkRef.current.getBoundingClientRect();

      const centerX = wordmarkRect.left + wordmarkRect.width / 2 - containerRect.left;
      const centerY = wordmarkRect.top + wordmarkRect.height / 2 - containerRect.top;

      const newLines = nodes.map((node) => {
        const nodeX = (node.x / 100) * containerRect.width;
        const nodeY = (node.y / 100) * containerRect.height;
        return {
          id: node.id,
          x1: centerX,
          y1: centerY,
          x2: nodeX,
          y2: nodeY,
        };
      });

      setLines(newLines);
    };

    updateLines();
    window.addEventListener('resize', updateLines);
    return () => window.removeEventListener('resize', updateLines);
  }, [nodes]);

  // Subtle Physics Mouse Repulsion on Nodes
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 100;
      mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <section className="hero-nodeweb-section" ref={containerRef}>
      {/* Background Architectural Grid & Grain */}
      <div className="nodeweb-grid-overlay" />
      <div className="nodeweb-noise-overlay" />

      {/* SVG Connecting Ray Lines */}
      <svg className="nodeweb-svg-layer" aria-hidden="true">
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={`nodeweb-ray-line ${activeTag === line.id ? 'is-active' : ''}`}
          />
        ))}
      </svg>

      {/* Top Architectural Header */}
      <header className="nodeweb-header">
        <div className="nodeweb-brand">
          <span className="brand-dot" />
          <span className="brand-name">SHOURYA UPADHYAY</span>
        </div>

        <nav className="nodeweb-nav-pill">
          <a href="#works" className="nav-pill-link" data-cursor="VIEW">
            <span className="nav-index">001/</span> WORKS
          </a>
          <a href="#manifesto" className="nav-pill-link" data-cursor="READ">
            <span className="nav-index">002/</span> MANIFESTO
          </a>
          <a href="#about" className="nav-pill-link" data-cursor="EXPLORE">
            <span className="nav-index">003/</span> ABOUT
          </a>
          <a href="#contact" className="nav-pill-link" data-cursor="CONNECT">
            <span className="nav-index">004/</span> CONTACT
          </a>
        </nav>

        <div className="nodeweb-clock-pill">
          <span className="clock-city">NEW DELHI</span>
          <span className="clock-divider">|</span>
          <span className="clock-time">{timeString}</span>
        </div>
      </header>

      {/* Central Wordmark */}
      <div className="nodeweb-center-block" ref={wordmarkRef}>
        <h1 className="nodeweb-wordmark">
          <span className="line-shourya">SHOURYA</span>
          <span className="line-foundry">
            <span className="slash-accent">//</span> FOUNDRY
          </span>
        </h1>
        <p className="nodeweb-subtitle">
          CRAFTING HIGH-PERFORMANCE DIGITAL EXPERIENCES AT THE INTERSECTION OF ART & CODE
        </p>
      </div>

      {/* Floating 2.5D Concept Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`nodeweb-tag ${activeTag === node.id ? 'is-active' : ''}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          onMouseEnter={() => setActiveTag(node.id)}
          onMouseLeave={() => setActiveTag(null)}
          data-cursor="INFO"
        >
          {node.text}
        </div>
      ))}

      {/* Scroll Hint */}
      <div className="nodeweb-scroll-hint">
        <span className="scroll-hint-text">SCROLL TO EXPLORE</span>
        <div className="scroll-hint-line" />
      </div>
    </section>
  );
}
