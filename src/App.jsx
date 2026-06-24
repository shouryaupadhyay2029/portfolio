import React from 'react';
import PageContainer from './layouts/PageContainer';
import SectionWrapper from './layouts/SectionWrapper';
import Hero from './sections/Hero';
import SelectedWork from './sections/SelectedWork';
import Philosophy from './sections/Philosophy';
import Journey from './sections/Journey';
import Experiments from './sections/Experiments';
import { 
  EditorialContainer, 
  ContentContainer, 
  ShowcaseContainer, 
  NarrowReadingContainer 
} from './layouts/Containers';

/**
 * Main application wireframe structure.
 * Implements the structural blueprint layout for the entire website.
 */
export default function App() {
  return (
    <PageContainer>
      
      {/* 1. Hero Section (Real UI with animations) */}
      <Hero />

      {/* 2. Selected Work Section (Real UI with animations) */}
      <SelectedWork />

      {/* 3. Philosophy Section (Real UI with animations) */}
      <Philosophy />

      {/* 4. Journey Section (Real UI with animations) */}
      <Journey />

      {/* 5. Experiments Section (Real UI with animations) */}
      <Experiments />

      {/* 6. Contact Layout Wireframe */}
      <SectionWrapper id="contact-wireframe" className="large-section-break pb-20" useContainer={false}>
        <EditorialContainer className="flex flex-col justify-between min-h-[40vh] gap-16">
          
          {/* Contact Structure Grid */}
          <div className="grid-12 items-end gap-12">
            
            {/* Signature Area (Cols 1-8) */}
            <div className="col-span-12 lg:col-span-8 border border-dashed border-white/15 bg-surface/20 rounded-sm p-12 min-h-[220px] flex flex-col justify-between">
              <div className="text-caption-custom font-mono text-[9px]">[SIGNATURE_STAGE]</div>
              <div className="h-12 w-5/6 bg-white/5 rounded-xs animate-pulse" />
              <div className="text-caption-custom font-mono text-[8px] opacity-60">
                ALIGN: LEFT // COLS: 1-8 // ACTION: CONTACT
              </div>
            </div>

            {/* Direct Channels / Quick Links (Cols 9-12) */}
            <div className="col-span-12 lg:col-span-4 border border-dashed border-white/15 bg-surface/10 rounded-sm p-8 min-h-[220px] flex flex-col justify-between">
              <div className="text-caption-custom font-mono text-[9px]">[CHANNELS_ZONE]</div>
              <div className="space-y-4 my-auto">
                <div className="h-3 w-2/3 bg-white/5 rounded-xs" />
                <div className="h-3 w-1/2 bg-white/5 rounded-xs" />
                <div className="h-3 w-3/4 bg-white/5 rounded-xs" />
              </div>
              <div className="text-caption-custom font-mono text-[8px] opacity-60">
                ALIGN: RIGHT // COLS: 9-12
              </div>
            </div>

          </div>

          {/* Blueprint Footer Coordinate Alignment */}
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 text-[9px] font-mono text-text-muted gap-4">
            <div>[SHOURYA.FOUNDRY // FRAMEWORK_STAGE_1.0]</div>
            <div>LAT.40.7128 / LON.-74.0060</div>
            <div>ALL RIGHTS RECORDED © 2026</div>
          </div>

        </EditorialContainer>
      </SectionWrapper>

    </PageContainer>
  );
}
