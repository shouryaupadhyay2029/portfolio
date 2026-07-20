import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes cleanly.
 * 
 * @param {...ClassValue} inputs - The class values to merge.
 * @returns {string} The merged class name string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
