import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import BootShader from './BootShader';
import './BootSequence.css';

gsap.registerPlugin(useGSAP);

export default function BootSequence({ currentPos, currentSize }) {
  const [bootComplete, setBootComplete] = React.useState(false);
  const rootRef = useRef(null);
  const shaderRef = useRef(null);
  const slashContainerRef = useRef(null);
  const shouryaLineRef = useRef(null);
  const foundryLineRef = useRef(null);

  // Sticker refs
  const stickerWrappers = useRef([]);
  const stickerInners = useRef([]);

  useGSAP(() => {
    // Master timeline
    const tl = gsap.timeline();

    // 1. 0.00s: Boot shader background fades in over 600ms
    if (shaderRef.current) {
      tl.to(shaderRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.inOut'
      }, 0.0);
    }

    // 2. 0.90s (0.60 + 0.30 pause): Stickers Enter
    const stickersEnterStart = 0.90;
    
    // Reset sticker positions for fromTo and set idle animations
    stickerWrappers.current.forEach((wrapper, idx) => {
      // Entrance Animation
      tl.fromTo(wrapper,
        { opacity: 0, y: 16, scale: 0.88, rotation: (Math.random() > 0.5 ? 4 : -4) },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotation: 0,
          duration: 0.8, 
          ease: 'power3.out' 
        },
        stickersEnterStart + (idx * 0.25)
      );

      // Idle animations (almost imperceptible)
      if (idx === 0) {
        // Sticker 1: tiny breathing scale
        gsap.to(stickerInners.current[0], {
          scale: 1.015,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: stickersEnterStart + 0.8
        });
      } else if (idx === 1) {
        // Sticker 2: slow floating
        gsap.to(stickerInners.current[1], {
          y: '+=6',
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: stickersEnterStart + 0.8
        });
      } else if (idx === 2) {
        // Sticker 3: tiny 2° rotation
        gsap.to(stickerInners.current[2], {
          rotation: '+=2',
          duration: 6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: stickersEnterStart + 0.8
        });
      }
    });

    // Sticker 3 enters at 1.40s, finishes around 2.20s.
    // 600ms pause -> 2.80s
    const typographyStart = 2.80;

    // 3. 2.80s: Outlined "//" draws itself
    const lines = slashContainerRef.current.querySelectorAll('.boot-slash-line');
    tl.to(lines, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    }, typographyStart);

    // 4. 3.60s: SHOURYA reveals
    tl.to(shouryaLineRef.current, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.0,
      ease: 'power3.inOut'
    }, typographyStart + 0.80);

    // 5. 4.40s: FOUNDRY reveals
    tl.to(foundryLineRef.current, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.0,
      ease: 'power3.inOut'
    }, typographyStart + 1.60);

    // Typography finishes at 5.40s.
    const overlayShrinkStart = 5.40;

    // 6. Overlay shrinks into lens
    tl.to(rootRef.current, {
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: function() {
        const p = this.progress();
        
        // Fullscreen bounds
        const fullW = window.innerWidth;
        const fullH = window.innerHeight;
        const fullCx = fullW / 2;
        const fullCy = fullH / 2;

        // Lens bounds (dynamically read from RevealLensContainer's refs)
        const targetCx = currentPos.current.x;
        const targetCy = currentPos.current.y;
        
        // Prevent strictly 0 scale (0.01 minimum for GSAP stability)
        const proxyP = Math.max(0.01, currentSize.current.proximity);
        const targetW = currentSize.current.w * proxyP;
        const targetH = currentSize.current.h * proxyP;
        const targetR = (currentSize.current.w / 120) * currentSize.current.r * proxyP;

        // Lerp bounds
        const currentW = fullW * (1 - p) + targetW * p;
        const currentH = fullH * (1 - p) + targetH * p;
        const currentCx = fullCx * (1 - p) + targetCx * p;
        const currentCy = fullCy * (1 - p) + targetCy * p;

        const finalTop = currentCy - currentH / 2;
        const finalLeft = currentCx - currentW / 2;
        const finalBottom = fullH - (currentCy + currentH / 2);
        const finalRight = fullW - (currentCx + currentW / 2);
        const finalR = targetR * p;

        // Apply clip path dynamically to simulate physical scale
        rootRef.current.style.clipPath = `inset(${finalTop}px ${finalRight}px ${finalBottom}px ${finalLeft}px round ${finalR}px)`;
      },
      onComplete: () => {
        // Overlay is cleanly hidden, revealing the real lens and page
        if (rootRef.current) rootRef.current.style.display = 'none';
        setBootComplete(true);
      }
    }, 7.10);

  }, { scope: rootRef });

  if (bootComplete) return null;

  return (
    <div className="boot-sequence-root" ref={rootRef}>
      {/* Premium WebGL Wave Shader Background (Classy Orange) */}
      <BootShader ref={shaderRef} className="boot-shader-canvas" style={{ opacity: 0 }} />

      {/* True Centred Composition */}
      <div className="boot-centered-layout">
        <h1 className="boot-wordmark">
          <div className="boot-line-shourya select-none" ref={shouryaLineRef}>
            SHOURYA
          </div>

          <div className="boot-axis-row">
            {/* CNC SVG Engraving for // */}
            <span className="boot-slash-container" aria-hidden="true" ref={slashContainerRef}>
              <svg className="boot-slash-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="30" y1="100" x2="55" y2="0" className="boot-slash-line" />
                <line x1="50" y1="100" x2="75" y2="0" className="boot-slash-line" />
              </svg>
            </span>

            <span className="boot-line-foundry select-none" ref={foundryLineRef}>
              FOUNDRY
            </span>
          </div>
        </h1>
      </div>

      {/* Premium Sticker Layer */}
      <div className="boot-stickers-layer">
        <div className="boot-sticker-wrapper sticker-1" ref={el => stickerWrappers.current[0] = el}>
          <video src="/LOGO1.webm" autoPlay muted playsInline loop preload="auto" className="boot-sticker-inner" ref={el => stickerInners.current[0] = el} />
        </div>
        <div className="boot-sticker-wrapper sticker-2" ref={el => stickerWrappers.current[1] = el}>
          <video src="/LOGO2.webm" autoPlay muted playsInline loop preload="auto" className="boot-sticker-inner" ref={el => stickerInners.current[1] = el} />
        </div>
        <div className="boot-sticker-wrapper sticker-3" ref={el => stickerWrappers.current[2] = el}>
          <video src="/LOGO3.webm" autoPlay muted playsInline loop preload="auto" className="boot-sticker-inner" ref={el => stickerInners.current[2] = el} />
        </div>
      </div>
    </div>
  );
}
