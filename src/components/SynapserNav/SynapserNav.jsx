import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import './SynapserNav.css';

const NAV_ITEMS = [
  { id: '01', label: 'HOME',      href: '#hero' },
  { id: '02', label: 'WORKS',     href: '#works' },
  { id: '03', label: 'ABOUT',     href: '#about' },
  { id: '04', label: 'MATRIX',    href: '#experience' },
  { id: '05', label: 'CONTACT',   href: '#contact' },
];

export default function SynapserNav() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverIndex, setHoverIndex]   = useState(null);
  const itemRefs = useRef([]);
  const indicatorRef = useRef(null);

  const currentIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  // Move active sliding tab indicator to target link position
  useEffect(() => {
    const currentEl = itemRefs.current[currentIndex];
    if (currentEl && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = currentEl;
      gsap.to(indicatorRef.current, {
        left: offsetLeft,
        width: offsetWidth,
        duration: 0.45,
        ease: 'power3.out',
      });
    }
  }, [currentIndex]);

  const handleLinkClick = (e, href, index) => {
    e.preventDefault();
    setActiveIndex(index);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="synapser-floating-nav" aria-label="Main Navigation">
      <div className="synapser-nav-inner">
        {/* Navigation Items List */}
        <ul className="synapser-nav-list" role="list">
          {NAV_ITEMS.map((item, index) => {
            const isActive = currentIndex === index;
            return (
              <li
                key={item.id}
                ref={(el) => (itemRefs.current[index] = el)}
                className={`synapser-nav-item ${isActive ? 'is-active' : ''}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href, index)}
                  className="synapser-nav-link font-mono"
                >
                  <span className="nav-mono-id">{item.id}//</span>
                  <span className="nav-mono-label">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Minimal Sliding Underline Beam */}
        <div ref={indicatorRef} className="synapser-nav-underline-beam" aria-hidden="true" />
      </div>
    </nav>
  );
}
