import React from 'react';
import { cn } from '../lib/utils';

/**
 * Section primitive representing a semantic content section.
 * Automatically handles the vertical section gap rhythm between components.
 * 
 * @param {Object} props - React props.
 * @param {boolean} [props.disableGap=false] - If true, disables the default section-gap margin.
 * @param {string} [props.className] - Extra class names.
 */
export default function Section({ children, className, disableGap = false, ...props }) {
  return (
    <section 
      className={cn(
        "w-full",
        !disableGap && "section-gap",
        className
      )} 
      {...props}
    >
      {children}
    </section>
  );
}
