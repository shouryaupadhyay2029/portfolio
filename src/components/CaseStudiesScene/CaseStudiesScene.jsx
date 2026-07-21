import React from 'react';
import { cn } from '../../lib/utils';
import { ShowcaseContainer } from '../../layout/containers';
import Section from '../../layout/Section';
import './CaseStudiesScene.css';

/**
 * Scene 03 — Case Studies (Workspace Environment)
 * Material: Dark Anodized Aluminium
 * Mood: Technical, focused, high-contrast, workspace
 */
export default function CaseStudiesScene({ isLayer2 = false }) {
  const caseStudies = [
    {
      id: 'system-01',
      code: 'CS-01',
      title: 'INSTITUTIONAL PLACEMENT ENGINE',
      category: 'SYSTEM ARCHITECTURE & REALTIME DATA',
      metrics: '3.4x INGESTION SPEED / ZERO LATENCY',
      description: 'A ground-up platform overhaul engineering high-throughput student placement metrics and automated career intelligence pipelines.'
    },
    {
      id: 'system-02',
      code: 'CS-02',
      title: 'DEVELOPER SHOWCASE INFRASTRUCTURE',
      category: 'CREATIVE ENGINEERING & COLLABORATION',
      metrics: '10K+ MONTHLY ACTIVE BUILDERS',
      description: 'Distributed project showcase architecture empowering student developers to share, benchmark, and deploy software.'
    }
  ];

  return (
    <Section className={cn('case-studies-section', isLayer2 && 'case-studies-layer2')}>
      <ShowcaseContainer>
        <div className="case-studies-header">
          <span className="case-studies-tag text-label">SCENE 03 // WORKSPACE</span>
          <h2 className="case-studies-title">
            <span className="title-line">SYSTEM</span>
            <span className="title-line">ARCHITECTURE</span>
          </h2>
          <p className="case-studies-subtitle">
            Deep-dive technical case studies detailing production systems, performance engineering, and product infrastructure.
          </p>
        </div>

        <div className="case-studies-grid">
          {caseStudies.map((cs) => (
            <div key={cs.id} className="case-study-card">
              <div className="case-study-top">
                <span className="cs-code">{cs.code}</span>
                <span className="cs-metrics">{cs.metrics}</span>
              </div>
              <h3 className="cs-title">{cs.title}</h3>
              <p className="cs-description">{cs.description}</p>
              <div className="cs-footer">
                <span className="cs-category">{cs.category}</span>
                <span className="cs-link">READ SYSTEM ARCHITECTURE ↗</span>
              </div>
            </div>
          ))}
        </div>
      </ShowcaseContainer>
    </Section>
  );
}
