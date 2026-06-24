import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedText splits a string into words or characters and animates them using Framer Motion.
 * Supports scroll-triggered stagger reveals.
 * 
 * @param {string} text - The content text to animate.
 * @param {string} [type='words'] - Split strategy, 'words' or 'chars'.
 * @param {object} [variants] - Custom Framer Motion variants for children.
 * @param {string} [className] - Tailwind classes to apply to the container.
 * @param {number} [delay=0] - Initial delay before animation starts.
 * @param {boolean} [once=true] - Play animation only once when visible.
 */
export default function AnimatedText({ 
  text, 
  type = 'words', 
  variants, 
  className = '', 
  delay = 0,
  once = true 
}) {
  // Split the text
  const words = text.split(' ');
  
  // Default container variants for stagger
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: type === 'chars' ? 0.02 : 0.06,
        delayChildren: delay,
      },
    },
  };

  // Default item variants for smooth text slide up and fade
  const defaultItemVariants = {
    hidden: {
      opacity: 0,
      y: '30%',
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: [0.25, 1, 0.5, 1], // easeOutQuart
        duration: 0.6,
      },
    },
  };

  const activeItemVariants = variants || defaultItemVariants;

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {type === 'words' ? (
        words.map((word, idx) => (
          <span key={idx} className="inline-block overflow-hidden mr-[0.25em]">
            <motion.span 
              className="inline-block" 
              variants={activeItemVariants}
            >
              {word}
            </motion.span>
          </span>
        ))
      ) : (
        words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
            {word.split('').map((char, charIdx) => (
              <span key={charIdx} className="inline-block overflow-hidden">
                <motion.span 
                  className="inline-block" 
                  variants={activeItemVariants}
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
        ))
      )}
    </motion.span>
  );
}
