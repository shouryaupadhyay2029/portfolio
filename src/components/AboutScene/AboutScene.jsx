import React from 'react';
import { cn } from '../../lib/utils';
import { ShowcaseContainer } from '../../layout/containers';
import Section from '../../layout/Section';
import './AboutScene.css';

/**
 * Scene 04 — About (Reading Room Environment)
 * Material: Soft Limestone / Warm Architectural Plaster
 * Mood: Calm, personal, readable, unhurried
 */
export default function AboutScene({ isLayer2 = false }) {
  return (
    <Section className={cn('about-section', isLayer2 && 'about-layer2')}>
      <ShowcaseContainer>
        <div className="about-header">
          <span className="about-tag text-label">SCENE 04 // READING ROOM</span>
          <h2 className="about-title">
            <span className="title-line">DESIGN</span>
            <span className="title-line">PHILOSOPHY</span>
          </h2>
        </div>

        <div className="about-grid grid-12">
          <div className="about-col-left">
            <p className="about-lead">
              I view digital products as physical architecture—where every pixel, transition, and interaction carries structural weight, clarity, and purpose.
            </p>
          </div>

          <div className="about-col-right">
            <div className="about-principle">
              <span className="principle-num">01 /</span>
              <h3>RESTRAINT & CLARITY</h3>
              <p>Removing everything decorative until only essential craftsmanship remains. True quality speaks quietly.</p>
            </div>

            <div className="about-principle">
              <span className="principle-num">02 /</span>
              <h3>PHYSICAL INTERACTION</h3>
              <p>Treating web interfaces like precision hardware objects—with weight, inertia, and calm cinematic progression.</p>
            </div>

            <div className="about-principle">
              <span className="principle-num">03 /</span>
              <h3>FULL-STACK PRECISION</h3>
              <p>Bridging creative engineering with production system architecture to build products that feel magical and load instantly.</p>
            </div>
          </div>
        </div>
      </ShowcaseContainer>
    </Section>
  );
}
