import React, { useState } from 'react';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';

import PixelTrail from './components/PixelTrail/PixelTrail';
import BlockNavigation from './components/BlockNavigation/BlockNavigation';
import SynapserHero from './components/SynapserHero/SynapserHero';
import IntroSection from './components/IntroSection';
import SelectedWorksShowcase from './components/SelectedWorksShowcase/SelectedWorksShowcase';
import ExperienceMatrix from './components/ExperienceMatrix/ExperienceMatrix';
import ContactFooter from './components/ContactFooter/ContactFooter';

import { PageTransitionProvider } from './context/PageTransitionContext';
import BlendPageTransition from './components/BlendPageTransition/BlendPageTransition';

/**
 * FOUNDRY — Exact Synapser Studio Hero Replica & Awwwards Architecture
 */
export default function App() {
  const [heroReady, setHeroReady] = useState(false);

  return (
    <PageTransitionProvider>
      {/* High-Resolution Micro-Pixel Cursor Trail (Small Pixel Boxes) */}
      <PixelTrail gridSize={18} fadeDuration={580} />

      {/* Global page transition overlay */}
      <BlendPageTransition />

      <SmoothScroll isLocked={!heroReady}>
        <div className="relative w-full overflow-x-hidden select-none bg-[#dcd8c0]">
          {/* Kyma-Style Staggered Block Curtain Navigation & Hamburger */}
          <BlockNavigation />

          {/* 1. Exact Synapser Studio Hero Replica */}
          <SynapserHero onIntroComplete={() => setHeroReady(true)} />

          {/* 2. Scroll-pinned introduction with a growing portrait reveal */}
          <IntroSection isHeroReady={heroReady} />

          {/* 3. Selected Works: Interactive Stage Showcase */}
          <SelectedWorksShowcase />

          {/* 4. Experience & Tech Stack Matrix */}
          <ExperienceMatrix />

          {/* 5. Contact Scene: Kinetic Headline & One-Click Copy Action */}
          <ContactFooter />
        </div>
      </SmoothScroll>
    </PageTransitionProvider>
  );
}
