import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SmoothScroll component wraps the application and initializes Lenis.
 * It synchronizes Lenis with GSAP ScrollTrigger to ensure smooth animations.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with clean, standard scroll settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium smooth exponential decay
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Synchronize ScrollTrigger with Lenis scroll events
    lenis.on('scroll', ScrollTrigger.update);

    // Sync the RAF loop with GSAP's ticker
    const updatePhysics = (time) => {
      lenis.raf(time * 1000); // GSAP ticker passes time in seconds, Lenis needs ms
    };

    gsap.ticker.add(updatePhysics);

    // Disable lagSmoothing safely if supported to prevent jumps/stuttering during heavy scroll events
    if (gsap.ticker && typeof gsap.ticker.lagSmoothing === 'function') {
      gsap.ticker.lagSmoothing(0);
    } else if (typeof gsap.lagSmoothing === 'function') {
      gsap.lagSmoothing(0);
    }

    // Clean up on unmount to prevent memory leaks
    return () => {
      gsap.ticker.remove(updatePhysics);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
