import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes, resolving conflicts.
 * @param {...import('clsx').ClassValue} inputs - The classes to merge.
 * @returns {string} - The merged classes.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
