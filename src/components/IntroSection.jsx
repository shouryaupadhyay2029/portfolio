import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import COPY from './copy.js';
import portrait from '../../me.png';
import PixelScrollTransition from './PixelScrollTransition/PixelScrollTransition';
import GrainCanvas from './SynapserHero/GrainCanvas';
import './intro.css';

gsap.registerPlugin(ScrollTrigger);

const Mask = ({ children, className = '', as: Tag = 'span', wave = false }) => (
  <Tag className={`mask ${className}`}>
    <span className={`mask__in${wave ? ' wave-line' : ' js-rise'}`}>
      {wave
        ? Array.from(String(children)).map((character, index) => (
            character === ' '
              ? ' '
              : <span className="wave-char js-rise" key={`${character}-${index}`}>{character}</span>
          ))
        : children}
    </span>
  </Tag>
);

export default function IntroSection({ isHeroReady = true }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        full: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
        small: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
      },
      () => {
        const q = gsap.utils.selector(root);
        // Keep the portrait card at the reference's 4:5 proportion as it grows.
        const CARD_WIDTH = () => Math.min(window.innerWidth * 0.26, window.innerHeight * 0.256);
        const EXPANDED_WIDTH = () => Math.min(window.innerWidth * 0.92, window.innerHeight * 0.736);
        const CREAM = '#f4ede4';

        const chapters = q('.chapter');
        const headlineLines = q('.headline__line');

        gsap.set(q('.js-rise'), { yPercent: 115 });
        gsap.set(q('.lab'), { opacity: 0, y: 8 });
        gsap.set(q('.sticker'), { scale: 0, rotate: -16 });
        gsap.set(q('.photo'), { width: 0, top: '50%' });
        gsap.set(q('.photo img'), { scale: 1.5, yPercent: 8 });
        gsap.set(q('.shade'), { opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=135%',
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        const rise = (targets, at, duration = 8, stagger = 3) =>
          tl.to(targets, { yPercent: 0, ease: 'power4.out', duration, stagger }, at);
        const riseWave = (lines, at, duration = 8, lineStagger = 2) => {
          lines.forEach((line, lineIndex) => {
            const characters = line.querySelectorAll('.wave-char');
            tl.to(
              characters,
              {
                yPercent: 0,
                ease: 'power4.out',
                duration,
                stagger: (index, _target, targets) => {
                  const progress = index / Math.max(1, targets.length - 1);
                  // Let the middle of the line trail slightly, forming a soft arc.
                  return progress * lineStagger + Math.sin(progress * Math.PI) * lineStagger * 0.6;
                },
              },
              at + lineIndex * 1.25,
            );
          });
        };
        const exit = (targets, at, duration = 5, stagger = 1.5) =>
          tl.to(targets, { yPercent: -115, ease: 'power3.in', duration, stagger }, at);

        tl.to(q('.lab'), { opacity: 1, y: 0, ease: 'power2.out', duration: 5, stagger: 1 }, 0);
        riseWave(headlineLines, 0, 9, 2.5);
        tl.to(q('.sticker'), { scale: 1, rotate: -6, ease: 'back.out(1.6)', duration: 6 }, 4);

        const inAt = [7];
        const outAt = [90];
        chapters.forEach((chapter, index) => {
          const lines = chapter.querySelectorAll('.chapter__line');
          riseWave(lines, inAt[index], 6, 2);
          if (outAt[index] !== null) exit(lines, outAt[index], 5, 1.5);
        });

        tl.to(q('.sticker'), { scale: 0, rotate: -22, ease: 'power3.in', duration: 5 }, 34);
        // The type starts making room at the same moment the portrait appears.
        tl.to(q('.headline'), { top: '8%', ease: 'none', duration: 15 }, 38);
        // The text recedes first, then clears completely as the portrait expands.
        tl.to(q('.headline'), { scale: 0.68, ease: 'power2.inOut', duration: 20 }, 38);
        tl.to(q('.headline'), { opacity: 0, ease: 'power2.inOut', duration: 20 }, 58);
        tl.to(q('.chapters'), { bottom: '10%', scale: 0.82, ease: 'power2.inOut', duration: 40 }, 38);
        tl.to(q('.chapters'), { opacity: 0, ease: 'power2.inOut', duration: 20 }, 58);
        tl.to(q('.photo'), { width: CARD_WIDTH, top: '50%', ease: 'none', duration: 15 }, 38);
        tl.to(q('.photo img'), { scale: 1.12, yPercent: 2, ease: 'power2.out', duration: 15 }, 38);

        // The reference shifts its portrait up as the small card opens into a framed image.
        tl.to(q('.photo'), { width: EXPANDED_WIDTH, top: '50%', ease: 'power2.inOut', duration: 20 }, 58);
        tl.to(q('.photo img'), { scale: 1.02, yPercent: -2, ease: 'power2.inOut', duration: 20 }, 58);
        rise(q('.wordmark .js-rise'), 66, 8, 0.8);
        tl.to(q('.shade'), { opacity: 1, duration: 5 }, 70);
        tl.to(q('.lab'), { color: CREAM, duration: 3 }, 100);
        tl.to({}, { duration: 0.01 }, 110);
      },
    );

    return () => mm.revert();
  }, []);

  const labels = COPY.labels;

  return (
    <section className="intro" id="about" ref={root} aria-label="About">
      <PixelScrollTransition
        targetColor="#ff6831"
        parentRef={root}
        isEnabled={isHeroReady}
      />
      <GrainCanvas opacity={0.16} fps={24} style={{ zIndex: 26 }} />
      <div className="layer-text">
        <h2 className="headline">
          {COPY.headline.map((line) => (
            <Mask key={line} className="headline__line" wave>{line}</Mask>
          ))}
        </h2>

        <video
          className="sticker"
          src="/LOGO1.webm"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        />

        <div className="chapters">
          {COPY.chapters.slice(0, 1).map((lines, index) => (
            <div className="chapter" key={index}>
              {lines.map((line) => (
                <Mask key={line} className="chapter__line" as="p" wave>{line}</Mask>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="photo">
        <img src={portrait} alt="Shourya Upadhyay" />
        <div className="photo__tint" />
        <div className="shade" />
        <div className="wordmark" aria-hidden="true">
          {COPY.wordmark.split('').map((character, index) => (
            <Mask key={`${character}-${index}`} className="wordmark__ch">{character}</Mask>
          ))}
        </div>
      </div>
      <span className="lab lab--bl">{labels.bl}</span>
      <span className="lab lab--br">{labels.br}</span>

    </section>
  );
}
