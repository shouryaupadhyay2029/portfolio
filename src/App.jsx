import React from 'react';
import SmoothScroll from './components/SmoothScroll/SmoothScroll';
import BlockNavigation from './components/BlockNavigation/BlockNavigation';
import SynapserHero from './components/SynapserHero/SynapserHero';
import ManifestoShowreel from './components/ManifestoShowreel/ManifestoShowreel';
import SelectedWorksShowcase from './components/SelectedWorksShowcase/SelectedWorksShowcase';
import ExperienceMatrix from './components/ExperienceMatrix/ExperienceMatrix';
import ContactFooter from './components/ContactFooter/ContactFooter';

/**
 * FOUNDRY — Exact Synapser Studio Hero Replica & Awwwards Architecture
 */
export default function App() {
  return (
    <SmoothScroll>
      <div className="relative w-full overflow-x-hidden select-none bg-[#dcd8c0]">
        {/* Kyma-Style Staggered Block Curtain Navigation & Hamburger */}
        <BlockNavigation />

        {/* 1. Exact Synapser Studio Hero Replica */}
        <SynapserHero />

        {/* 2. Manifesto & Showreel: Line-by-Line Scrub & Expanding Video Stage */}
        <ManifestoShowreel />

        {/* 3. Selected Works: Interactive Stage Showcase */}
        <SelectedWorksShowcase />

        {/* 4. Experience & Tech Stack Matrix */}
        <ExperienceMatrix />

        {/* 5. Contact Scene: Kinetic Headline & One-Click Copy Action */}
        <ContactFooter />
      </div>
    </SmoothScroll>
  );
}
