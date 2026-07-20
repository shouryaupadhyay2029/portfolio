import React from 'react';
import PageContainer from './layout/PageContainer';
import RevealLensContainer from './components/RevealLens/RevealLensContainer';

/**
 * Main App entry point.
 * Renders the RevealLensContainer which stacks and masks Layer 1 (base design)
 * and Layer 2 (inverted design) dynamically under the cursor.
 */
export default function App() {
  return (
    <PageContainer className="relative select-none">
      <RevealLensContainer />
    </PageContainer>
  );
}


