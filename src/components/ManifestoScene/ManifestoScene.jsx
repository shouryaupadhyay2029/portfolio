import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import './ManifestoScene.css';

const MANIFESTO_LINES = [
  {
    number: '01',
    text: 'I build experiences,\nnot interfaces.',
    emphasis: 'experiences',
  },
  {
    number: '02',
    text: 'Design without restraint\nis decoration.',
    emphasis: 'restraint',
  },
  {
    number: '03',
    text: 'Every pixel should\nearn its position.',
    emphasis: 'earn',
  },
  {
    number: '04',
    text: 'Craft is the discipline\nof invisible decisions.',
    emphasis: 'invisible',
  },
  {
    number: '05',
    text: 'The work speaks.\nThe designer disappears.',
    emphasis: 'disappears',
  },
];

/**
 * ManifestoScene — Scene 03
 *
 * A typography-driven manifesto where one statement at a time
 * is active and fully visible. Controlled by manifestoP (0–1)
 * via DOM mutations from the parent tick loop.
 */
export default function ManifestoScene({ isLayer2 = false, manifestoRef: externalRef }) {
  const rootRef = useRef(null);
  const lineRefs = useRef([]);
  const numberRefs = useRef([]);
  const progressBarRef = useRef(null);

  // Register DOM nodes for parent direct mutation
  useEffect(() => {
    if (externalRef) {
      externalRef.rootEl = rootRef.current;
      externalRef.lineEls = lineRefs.current;
      externalRef.numberEls = numberRefs.current;
      externalRef.progressBarEl = progressBarRef.current;
    }
  }, [externalRef]);

  return (
    <div
      ref={rootRef}
      className={cn('manifesto-root', isLayer2 && 'manifesto-layer2')}
      aria-label="Personal Manifesto"
    >
      {/* Left: Vertical Progress Bar */}
      <div className="manifesto-progress-track" aria-hidden="true">
        <div ref={progressBarRef} className="manifesto-progress-bar" />
      </div>

      {/* Center: Statements */}
      <div className="manifesto-center">
        <span className="manifesto-eyebrow">PHILOSOPHY</span>

        <div className="manifesto-lines">
          {MANIFESTO_LINES.map((line, idx) => (
            <div
              key={line.number}
              ref={(el) => (lineRefs.current[idx] = el)}
              className="manifesto-line"
              data-index={idx}
            >
              <span
                ref={(el) => (numberRefs.current[idx] = el)}
                className="manifesto-line-number"
              >
                {line.number}
              </span>
              <p className="manifesto-line-text">
                {line.text.split('\n').map((segment, si) => (
                  <span key={si} className="manifesto-line-segment">
                    {segment.split(line.emphasis).map((part, pi, arr) => (
                      <React.Fragment key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          <em className="manifesto-emphasis">{line.emphasis}</em>
                        )}
                      </React.Fragment>
                    ))}
                    {si < line.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Right: Attribution */}
      <div className="manifesto-attribution" aria-hidden="true">
        <span>SHOURYA // FOUNDRY</span>
        <span className="manifesto-year">2025</span>
      </div>
    </div>
  );
}
