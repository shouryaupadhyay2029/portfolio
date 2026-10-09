import React, { useState } from 'react';
import './ExperienceMatrix.css';

const SKILLS = [
  { name: 'React / Next.js', category: 'Frontend', level: 'Mastery', icon: '⚡' },
  { name: 'GSAP & Motion', category: 'Animation', level: 'Advanced', icon: '✨' },
  { name: 'Three.js & WebGL', category: '3D Graphics', level: 'Advanced', icon: '🌐' },
  { name: 'Tailwind CSS', category: 'Styling', level: 'Mastery', icon: '🎨' },
  { name: 'Firebase & Node.js', category: 'Backend', level: 'Proficient', icon: '🔥' },
  { name: 'UI / UX & Design Systems', category: 'Design', level: 'Advanced', icon: '📐' },
  { name: 'AI Workflows & LLM APIs', category: 'AI Integration', level: 'Advanced', icon: '🤖' },
  { name: 'Performance & Optimization', category: 'Engineering', level: 'Mastery', icon: '🚀' },
];

const EXPERIENCE = [
  {
    role: 'Creative Full Stack Developer',
    company: 'FOUNDRY Studio',
    period: '2025 — PRESENT',
    desc: 'Engineering high-performance web applications, custom WebGL canvas shaders, and editorial interactive design systems.',
  },
  {
    role: 'Frontend & Interactive Engineer',
    company: 'Independent Practice',
    period: '2024 — 2025',
    desc: 'Designed & developed bespoke digital products, brand platforms, and real-time dashboard systems.',
  },
];

export default function ExperienceMatrix() {
  const [activeTab, setActiveTab] = useState('stack');

  return (
    <section className="experience-matrix-section" id="about">
      <div className="matrix-header font-mono">
        <div className="matrix-badge">
          <span className="badge-num">003 /</span> EXPERIENCE & CAPABILITIES
        </div>
        <div className="matrix-tabs">
          <button
            className={`tab-btn ${activeTab === 'stack' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('stack')}
            data-cursor="SELECT"
          >
            01. STACK & TOOLS
          </button>
          <button
            className={`tab-btn ${activeTab === 'exp' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('exp')}
            data-cursor="SELECT"
          >
            02. JOURNEY
          </button>
        </div>
      </div>

      <div className="matrix-content">
        {activeTab === 'stack' ? (
          <div className="stack-grid">
            {SKILLS.map((skill, idx) => (
              <div key={idx} className="skill-card" data-cursor="SKILL">
                <div className="skill-icon">{skill.icon}</div>
                <div className="skill-info">
                  <h4 className="skill-name">{skill.name}</h4>
                  <span className="skill-cat">{skill.category}</span>
                </div>
                <span className="skill-level">{skill.level}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="timeline-list">
            {EXPERIENCE.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-meta">
                  <span className="timeline-period">{item.period}</span>
                  <span className="timeline-company">{item.company}</span>
                </div>
                <div className="timeline-body">
                  <h3 className="timeline-role">{item.role}</h3>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
