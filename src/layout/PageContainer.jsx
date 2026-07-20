import React from 'react';
import { cn } from '../lib/utils';

/**
 * PageContainer provides the root layout wrapper for the website,
 * setting the min-height, background color, and default text color.
 * 
 * @param {Object} props - React props.
 * @param {string} [props.className] - Extra class names.
 */
export default function PageContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn("min-h-screen w-full text-text-primary", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
