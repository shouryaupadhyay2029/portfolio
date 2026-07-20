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
export default function SelectedWorks({ isLayer2 = false, placeholderRefs }) {
  // Exactly five projects
  const placeholderIndices = [0, 1, 2, 3, 4];

  return (
    <Section className={cn("selected-works-section", isLayer2 && "selected-works-layer2")}>
      <ShowcaseContainer>
        <div className="selected-works-header grid-12">
          <div className="col-editorial-left">
            <h2 className="selected-works-title text-heading">
              Selected Work
            </h2>
          </div>
          <div className="col-editorial-right selected-works-subtitle text-caption">
            <span>A collection of digital installations detailing design precision, creative engineering and visual systems.</span>
          </div>
        </div>

        <div className="selected-works-grid grid-12">
          {placeholderIndices.map((idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (placeholderRefs) {
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
