import React from 'react';
import SmoothScroll from '../components/SmoothScroll';
import NoiseOverlay from '../components/NoiseOverlay';
import GridBackground from '../components/GridBackground';

/**
 * PageContainer provides the base layout wrapper for all page views,
 * embedding Lenis smooth scrolling, layout grids, and noise overlays.
 * 
 * @param {React.ReactNode} children - The pages content.
 */
export default function PageContainer({ children }) {
  return (
    <SmoothScroll>
      <div className="layout-wrapper bg-background text-text-primary min-h-screen relative w-full">
        {/* Grain Overlay */}
        <NoiseOverlay />

        {/* Dynamic Grid GridBackground */}
        <GridBackground />

        {/* Core Content Container */}
        <main id="main-content" className="flex-1 w-full relative z-10">
          {children}
        </main>
      </div>
    </SmoothScroll>
  );
}
