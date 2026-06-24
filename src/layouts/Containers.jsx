import React from 'react';
import { cn } from '../utils/cn';

/**
 * FullWidthContainer stretches edge-to-edge (100% viewport width).
 * Recommended for hero backdrops, immersive canvases, or large galleries.
 */
export function FullWidthContainer({ children, className = '' }) {
  return (
    <div className={cn('container-full', className)}>
      {children}
    </div>
  );
}

/**
 * EditorialContainer defines a wide, generous layout (max 1536px).
 * Recommended for section headers, complex multi-column grids, and side-by-side components.
 */
export function EditorialContainer({ children, className = '' }) {
  return (
    <div className={cn('container-editorial', className)}>
      {children}
    </div>
  );
}

/**
 * ContentContainer defines a standard reading and layout container (max 1200px).
 * Recommended for standard lists, standard pages, grids, and description areas.
 */
export function ContentContainer({ children, className = '' }) {
  return (
    <div className={cn('container-content', className)}>
      {children}
    </div>
  );
}

/**
 * NarrowReadingContainer bounds readable copy for clean vertical editorial alignment (max 800px).
 * Recommended for project details, text blocks, bios, and editorial reading.
 */
export function NarrowReadingContainer({ children, className = '' }) {
  return (
    <div className={cn('container-narrow', className)}>
      {children}
    </div>
  );
}

/**
 * ShowcaseContainer spans ultra-wide boundaries (max 1800px).
 * Recommended for massive showcase blocks, portfolio grids, and visual media slates.
 */
export function ShowcaseContainer({ children, className = '' }) {
  return (
    <div className={cn('container-showcase', className)}>
      {children}
    </div>
  );
}
