import React from 'react';
import { cn } from '../../lib/utils';
import { ShowcaseContainer } from '../../layout/containers';
import Section from '../../layout/Section';
import './SelectedWorks.css';

/**
 * SelectedWorks renders the project gallery structure.
 * It contains a grid of invisible placeholder elements that outline
 * the staggered grid composition.
 * 
 * The parent controller measures these placeholders to determine where the
 * project placards should lock in when scrolled down.
 */
export default function SelectedWorks({ isLayer2 = false, placeholderRefs, isSettled = true }) {
  // Exactly five projects
  const placeholderIndices = [0, 1, 2, 3, 4];

  return (
    <Section className={cn("selected-works-section", isSettled && "is-settled", isLayer2 && "selected-works-layer2")}>
      {/* Ambient Lighting Shift Background */}
      <div className="selected-works-ambient-light" aria-hidden="true" />

      <ShowcaseContainer>
        <div className="selected-works-header">
          <div className="selected-works-header-top">
            <span className="selected-works-tag text-label">CURATED EXHIBITION</span>
            <h2 className="selected-works-title">
              <span className="title-line title-line-1">SELECTED</span>
              <span className="title-line title-line-2">WORK</span>
            </h2>
          </div>
          <div className="selected-works-subtitle">
            <p>A collection of projects exploring thoughtful interfaces, interactive experiences and digital craftsmanship.</p>
          </div>
        </div>

        <div className="selected-works-grid grid-12">
          {placeholderIndices.map((idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (placeholderRefs && placeholderRefs.current) {
                  placeholderRefs.current[idx] = el;
                }
              }}
              className={cn("project-placeholder", `project-placeholder-${idx}`)}
            />
          ))}
        </div>
      </ShowcaseContainer>
    </Section>
  );
}
