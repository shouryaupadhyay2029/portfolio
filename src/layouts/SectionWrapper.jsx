import React from 'react';
import { cn } from '../utils/cn';

/**
 * SectionWrapper is a semantic container for page sections.
 * Ensures consistent padding and max-widths across the viewport.
 * 
 * @param {string} id - Unique identifier for anchoring and ScrollTrigger.
 * @param {string} [className] - Optional extra classes for the section.
 * @param {string} [containerClassName] - Optional extra classes for the inner container.
 * @param {boolean} [useContainer=true] - Set to false if you want full width without standard bounds.
 * @param {React.ReactNode} children - The section contents.
 */
export default function SectionWrapper({
  id,
  className = '',
  containerClassName = '',
  useContainer = true,
  children,
}) {
  return (
    <section
      id={id}
      className={cn(
        'section-padding relative w-full overflow-hidden',
        className
      )}
    >
      {useContainer ? (
        <div className={cn('container-custom relative', containerClassName)}>
          {children}
        </div>
      ) : (
        <div className={cn('relative w-full', containerClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}
