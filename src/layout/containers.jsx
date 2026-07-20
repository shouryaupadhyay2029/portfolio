import React from 'react';
import { cn } from '../lib/utils';

/**
 * FullWidthContainer: Edge-to-edge layout wrapper (100% width).
 */
export function FullWidthContainer({ children, className, ...props }) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * EditorialContainer: Layout container capped at 1536px.
 */
export function EditorialContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn("w-full mx-auto max-w-container-editorial px-section-padding-x", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ShowcaseContainer: Layout container capped at 1800px.
 */
export function ShowcaseContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn("w-full mx-auto max-w-container-showcase px-section-padding-x", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ContentContainer: Layout container capped at 1200px.
 */
export function ContentContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn("w-full mx-auto max-w-container-content px-section-padding-x", className)} 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * NarrowReadingContainer: Layout container capped at 800px for copy readability.
 */
export function NarrowReadingContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn("w-full mx-auto max-w-container-narrow px-section-padding-x", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
