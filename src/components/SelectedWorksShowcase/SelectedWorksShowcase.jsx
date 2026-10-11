import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SelectedWorksShowcase.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PROJECTS = [
  {
    id: 'ekspi',
    title: 'EKSPI',
    category: 'FULL STACK PLATFORM',
    year: '2026',
    subtitle: 'Every Campus Event. One Platform. Built for Seamless Campus Scale.',
    tags: ['React', 'Firebase', 'Tailwind CSS', 'GSAP'],
    image: '/LOGO1.webm',
    link: '#',
  },
  {
    id: 'foundry-ds',
    title: 'FOUNDRY DESIGN SYSTEM',
    category: 'UI / UX SYSTEM',
    year: '2026',
    subtitle: 'Architectural Component Engine & Fluid Design System.',
    tags: ['React', 'Design Systems', 'Framer Motion'],
    image: '/LOGO2.webm',
    link: '#',
  },
  {
    id: 'neveiro',
    title: 'ROTA DO NEVEIRO',
    category: '3D WEBGL EXPERIENCE',
    year: '2025',
    subtitle: 'Immersive Spatial 3D Narrative & Architectural Heritage.',
    tags: ['Three.js', 'WebGL', 'GSAP', 'GLSL'],
    image: '/LOGO3.webm',
    link: '#',
  },
  {
    id: 'repulsor',
    title: 'REPULSOR',
    category: 'AUDIO & MOTION ENGINE',
    year: '2025',
    subtitle: 'High-Frequency Physics-Driven Audio Visualizer.',
    tags: ['Web Audio API', 'Canvas API', 'Physics'],
    image: '/LOGO1.webm',
    link: '#',
  },
];

export default function SelectedWorksShowcase() {
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);
  const sectionRef  = useRef(null);
  const headerRef   = useRef(null);
  const listRef     = useRef(null);
  const stageRef    = useRef(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    // Header fade-in
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 88%' },
      }
    );

    // Card stagger entrance
    const cards = listRef.current?.querySelectorAll('.works-card');
    if (cards?.length) {
      gsap.fromTo(cards,
        { opacity: 0, x: -28 },
        {
          opacity: 1, x: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: listRef.current, start: 'top 82%' },
        }
      );
    }

    // Stage reveal
    gsap.fromTo(stageRef.current,
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: stageRef.current, start: 'top 80%' },
      }
    );
  }, { scope: sectionRef });

  return (
    <section className="works-showcase-section" id="works" ref={sectionRef}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="works-header font-mono" ref={headerRef}>
        <div className="works-badge">
          <span className="badge-num">001 /</span> SELECTED WORKS
        </div>
        <div className="works-count">SHOWCASING [ 04 ] PROJECTS</div>
      </div>

      <div className="works-container">

        {/* Left Side: Interactive Project List */}
        <div className="works-list" ref={listRef}>
          {PROJECTS.map((project, idx) => (
            <div
              key={project.id}
              className={`works-card ${activeProject.id === project.id ? 'is-active' : ''}`}
              onMouseEnter={() => setActiveProject(project)}
              data-cursor="VIEW"
            >
              <div className="card-top">
                <span className="card-index">0{idx + 1}</span>
                <span className="card-category">{project.category}</span>
                <span className="card-year">{project.year}</span>
              </div>
              <h3 className="card-title">{project.title}</h3>
              <p className="card-subtitle">{project.subtitle}</p>
              <div className="card-tags">
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Dynamic Active Preview Stage */}
        <div className="works-stage" ref={stageRef}>
          <div className="stage-frame">
            <video
              key={activeProject.id}
              src={activeProject.image}
              autoPlay
              muted
              playsInline
              loop
              className="stage-video"
            />
            <div className="stage-caption">
              <span className="stage-title">{activeProject.title}</span>
              <span className="stage-cat">{activeProject.category}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
