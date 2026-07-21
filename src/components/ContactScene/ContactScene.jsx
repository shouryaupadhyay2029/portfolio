import React from 'react';
import { cn } from '../../lib/utils';
import { ShowcaseContainer } from '../../layout/containers';
import Section from '../../layout/Section';
import './ContactScene.css';

/**
 * Scene 05 — Contact (Final Sanctuary Environment)
 * Material: Deep Architectural Charcoal
 * Mood: Quiet, serene, elegant, confident
 */
export default function ContactScene({ isLayer2 = false }) {
  return (
    <Section className={cn('contact-section', isLayer2 && 'contact-layer2')}>
      <ShowcaseContainer>
        <div className="contact-header">
          <span className="contact-tag text-label">SCENE 05 // INITIATE COLLABORATION</span>
          <h2 className="contact-title">
            <span className="title-line">LET'S BUILD</span>
            <span className="title-line">SOMETHING</span>
            <span className="title-line title-accent">EXTRAORDINARY</span>
          </h2>
        </div>

        <div className="contact-grid grid-12">
          <div className="contact-col-main">
            <a href="mailto:shourya@foundry.design" className="contact-email">
              shourya@foundry.design
            </a>
            <p className="contact-subtext">
              Available for select digital product design, creative engineering systems, and architectural web installations.
            </p>
          </div>

          <div className="contact-col-meta">
            <div className="meta-block">
              <span className="meta-label">LOCATION</span>
              <span className="meta-value">INDIA // GLOBAL REMOTE</span>
            </div>

            <div className="meta-block">
              <span className="meta-label">DIRECT CONTACT</span>
              <span className="meta-value">+91 (FOUNDRY DIRECT)</span>
            </div>

            <div className="meta-block">
              <span className="meta-label">SOCIAL SYSTEMS</span>
              <div className="meta-links">
                <a href="https://github.com" target="_blank" rel="noreferrer">GITHUB ↗</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN ↗</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">X (TWITTER) ↗</a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-footer-mark">
          <span className="mark-text">SHOURYA // FOUNDRY © 2026 — ALL RIGHTS RESERVED</span>
        </div>
      </ShowcaseContainer>
    </Section>
  );
}
