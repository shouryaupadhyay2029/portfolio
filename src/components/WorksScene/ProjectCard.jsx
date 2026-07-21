import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import './ProjectCard.css';

/**
 * ProjectCard — Ultra-Clean Physical Matte Exhibition Board
 * 
 * Clean visual presentation board with zero text overlays:
 * - Pure screenshot presentation board
 * - Matte charcoal frame & subtle border
 * - Soft cursor-following radial illumination
 * - Microscopic slow breathing animation
 */
export default function ProjectCard({
  project,
  index = 0,
  isLayer2 = false,
  isDimmed = false,
  cardRef,
  onPointerEnter,
  onPointerLeave,
  onClick,
  style,
  className,
  ...props
}) {
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onPointerEnter) onPointerEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    if (onPointerLeave) onPointerLeave(e);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'project-card-root',
        isLayer2 ? 'project-card-layer2' : 'project-card-layer1',
        isHovered && 'is-hovered',
        isDimmed && 'is-dimmed',
        className
      )}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-project-id={project.id}
      {...props}
    >
      {/* Soft Cursor Illumination Layer */}
      <div
        className="project-card-cursor-light"
        style={{
          background: `radial-gradient(400px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(216, 111, 42, 0.08), transparent 80%)`,
          opacity: isHovered ? 1 : 0
        }}
        aria-hidden="true"
      />

      {/* Integrated Screenshot Media Wrapper */}
      <div className="project-card-media-wrapper">
        <img
          src={project.image}
          alt={project.title || 'Project Preview'}
          className="project-card-image"
          draggable={false}
        />
      </div>
    </div>
  );
}
