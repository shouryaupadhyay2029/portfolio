import React, { useEffect } from 'react';
import { usePageTransition } from '../../context/PageTransitionContext';

export default function TransitionTestPill() {
  const { triggerTransition, isTransitioning } = usePageTransition();

  const handleTest = () => {
    if (isTransitioning) return;
    triggerTransition({
      targetId: null,
      label: 'blend',
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 't' || e.key === 'T') {
        handleTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning]);

  return (
    <button
      onClick={handleTest}
      className="blend-test-trigger-btn font-mono"
      data-cursor="TEST"
      aria-label="Test Blend Modes Page Transition (Press 'T')"
      title="Test Blend Modes Page Transition (or Press 'T')"
    >
      <span className="btn-indicator" />
      <span className="btn-label">TEST TRANSITION [T] ↗</span>
    </button>
  );
}
