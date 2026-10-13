import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const PageTransitionContext = createContext(null);

export function PageTransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState({
    targetId: null,
    label: 'blend',
  });
  const onMidpointRef = useRef(null);
  const onCompleteRef = useRef(null);

  const triggerTransition = useCallback((targetOrOptions, maybeOptions = {}) => {
    let target = null;
    let options = {};

    if (typeof targetOrOptions === 'string') {
      target = targetOrOptions;
      options = maybeOptions;
    } else if (typeof targetOrOptions === 'function') {
      onMidpointRef.current = targetOrOptions;
      options = maybeOptions;
    } else if (typeof targetOrOptions === 'object' && targetOrOptions !== null) {
      target = targetOrOptions.targetId || null;
      options = targetOrOptions;
    }

    if (options.onMidpoint) {
      onMidpointRef.current = options.onMidpoint;
    }
    if (options.onComplete) {
      onCompleteRef.current = options.onComplete;
    }

    setTransitionData({
      targetId: target,
      label: options.label || 'blend',
    });

    setIsTransitioning(true);
  }, []);

  const handleMidpoint = useCallback(() => {
    if (transitionData.targetId) {
      const el = document.querySelector(transitionData.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' });
      }
    }
    if (onMidpointRef.current) {
      onMidpointRef.current();
      onMidpointRef.current = null;
    }
  }, [transitionData.targetId]);

  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
    if (onCompleteRef.current) {
      onCompleteRef.current();
      onCompleteRef.current = null;
    }
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        transitionData,
        triggerTransition,
        handleMidpoint,
        handleComplete,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}
