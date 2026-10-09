import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './BlockNavigation.css';

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { id: '01', label: 'HOMEPAGE',       href: '#hero' },
  { id: '02', label: 'SELECTED WORKS', href: '#works' },
  { id: '03', label: 'MANIFESTO',      href: '#manifesto' },
  { id: '04', label: 'TECH MATRIX',    href: '#experience' },
  { id: '05', label: 'GET IN TOUCH',   href: '#contact' },
];

const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789';

// Interactive Glitch Text Scramble Component
function GlitchTextLink({ item, onLinkClick, linkRef }) {
  const [displayText, setDisplayText] = useState(item.label);
  const intervalRef = useRef(null);

  const triggerGlitch = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        item.label
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return item.label[index];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join('')
      );

      if (iteration >= item.label.length) {
        clearInterval(intervalRef.current);
      }
      iteration += 1 / 2.5; // decoding speed
    }, 28);
  };

  const handleMouseLeave = () => {
    clearInterval(intervalRef.current);
    setDisplayText(item.label);
  };

  return (
    <a
      href={item.href}
      ref={linkRef}
      onClick={(e) => onLinkClick(e, item.href)}
      onMouseEnter={triggerGlitch}
      onMouseLeave={handleMouseLeave}
    >
      <span className="nav-num font-mono">{item.id} //</span>
      <span className="glitch-text-wrapper" data-text={item.label}>
        <span className="nav-text glitch-main">{displayText}</span>
        <span className="nav-text glitch-layer glitch-red" aria-hidden="true">
          {displayText}
        </span>
        <span className="nav-text glitch-layer glitch-blue" aria-hidden="true">
          {displayText}
        </span>
      </span>
    </a>
  );
}

export default function BlockNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef   = useRef(null);
  const blocksRef    = useRef([]);
  const linksRef     = useRef([]);
  const metaRef      = useRef(null);

  useGSAP(() => {
    if (!overlayRef.current) return;

    const overlay = overlayRef.current;
    const blocks  = blocksRef.current.filter(Boolean);
    const links   = linksRef.current.filter(Boolean);

    // Initial state: hide overlay elements offscreen
    gsap.set(overlay, { display: 'none' });
    gsap.set(blocks, { yPercent: 100 });
    gsap.set(links, { y: 40, opacity: 0, filter: 'blur(8px)' });
    if (metaRef.current) {
      gsap.set(metaRef.current, { opacity: 0, y: 30 });
    }
  }, []);

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    const overlay = overlayRef.current;
    const blocks  = blocksRef.current.filter(Boolean);
    const links   = linksRef.current.filter(Boolean);
    const meta    = metaRef.current;

    if (nextState) {
      // ── OPEN SEQUENCE: Staggered Block Columns Slide UP ───────────────────
      document.body.style.overflow = 'hidden';
      gsap.set(overlay, { display: 'flex' });

      const tl = gsap.timeline();

      // 1. Column blocks slide UP staggered
      tl.to(blocks, {
        yPercent: 0,
        duration: 0.85,
        ease: 'power4.inOut',
        stagger: 0.08,
      });

      // 2. Navigation links reveal in staggered text rise
      tl.to(
        links,
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.07,
        },
        '-=0.45'
      );

      // 3. Metadata panel fades in
      if (meta) {
        tl.to(
          meta,
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.5'
        );
      }
    } else {
      // ── CLOSE SEQUENCE: Links fade, Blocks slide DOWN staggered ──────────
      document.body.style.overflow = '';
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
        },
      });

      // 1. Links & meta fade out
      tl.to([...links, meta].filter(Boolean), {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
      });

      // 2. Column blocks slide DOWN staggered in reverse
      tl.to(
        blocks,
        {
          yPercent: 100,
          duration: 0.75,
          ease: 'power4.inOut',
          stagger: { amount: 0.2, from: 'end' },
        },
        '-=0.15'
      );
    }
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    toggleMenu();
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <>
      {/* 1. Top-Right Fixed Floating Icon-Only Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={`kyma-burger-btn ${isOpen ? 'is-open' : ''}`}
        aria-label={isOpen ? 'Close Menu' : 'Open Navigation Menu'}
        aria-expanded={isOpen}
      >
        <span className="burger-aura-ring" aria-hidden="true" />
        <div className="burger-icon" aria-hidden="true">
          <span className="line line-1" />
          <span className="line line-2" />
        </div>
      </button>

      {/* 2. Full-Screen Staggered Block Columns Overlay (Kyma Framer Menu) */}
      <div ref={overlayRef} className="kyma-menu-overlay" aria-hidden={!isOpen}>

        {/* 4 Vertical Column Blocks */}
        <div className="kyma-blocks-container">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              ref={(el) => (blocksRef.current[idx] = el)}
              className={`kyma-block-col col-${idx + 1}`}
            />
          ))}
        </div>

        {/* Menu Content Layer */}
        <div className="kyma-menu-content">
          <div className="kyma-menu-grid">

            {/* Left Nav Column */}
            <div className="kyma-nav-column">
              <span className="nav-col-label font-mono">INDEX // NAVIGATION</span>
              <ul className="kyma-nav-list" role="list">
                {NAV_LINKS.map((item, i) => (
                  <li key={item.id} className="kyma-nav-item">
                    <GlitchTextLink
                      item={item}
                      onLinkClick={handleLinkClick}
                      linkRef={(el) => (linksRef.current[i] = el)}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Meta Column */}
            <div className="kyma-meta-column" ref={metaRef}>
              <div className="meta-block">
                <span className="meta-label font-mono">ROLE // ARCHITECTURE</span>
                <p className="meta-value">CREATIVE FRONTEND ENGINEER & MOTION DESIGNER</p>
              </div>

              <div className="meta-block">
                <span className="meta-label font-mono">LOCATION // BASE</span>
                <p className="meta-value">BANGALORE, KARNATAKA, IN</p>
              </div>

              <div className="meta-block">
                <span className="meta-label font-mono">CONNECT // SOCIALS</span>
                <ul className="social-list font-mono" role="list">
                  <li><a href="https://github.com" target="_blank" rel="noreferrer">GITHUB ↗</a></li>
                  <li><a href="https://linkedin.com" target="_blank" rel="noreferrer">LINKEDIN ↗</a></li>
                  <li><a href="https://twitter.com" target="_blank" rel="noreferrer">TWITTER / X ↗</a></li>
                  <li><a href="https://awwwards.com" target="_blank" rel="noreferrer">AWWWARDS ↗</a></li>
                </ul>
              </div>

              <div className="meta-block">
                <span className="meta-label font-mono">INQUIRIES // DIRECT</span>
                <a href="mailto:shourya.upadhyay@foundry.dev" className="email-link font-mono">
                  SHOURYA.UPADHYAY@FOUNDRY.DEV
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
