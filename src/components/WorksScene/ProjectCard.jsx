import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import './ProjectCard.css';

/**
 * ProjectCard — Custom Architectural Module with Left Orange Container Bar
 * 
 * Features:
 * - Left Thin Orange Container (#D86F2A terracotta orange) displaying:
 *   - Project Number (e.g. 01, 02)
 *   - Vertical Project Title in heavy condensed font (Bebas Neue / General Sans)
 *   - Project Year / Tag
 * - Right Main Container: Screenshot image with slow breathing animation
 * - Soft cursor-following radial illumination
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

  const projNum = project.number || `0${index + 1}`;
  const projTitle = project.title || 'PROJECT';
  const projYear = project.year || '2025';

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
          background: `radial-gradient(400px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(255, 255, 255, 0.12), transparent 80%)`,
          opacity: isHovered ? 1 : 0
        }}
        aria-hidden="true"
      />

      {/* ── LEFT THIN ORANGE CONTAINER BAR ── */}
      <div className="project-card-orange-bar" aria-hidden="true">
        <span className="project-card-bar-num">{projNum}</span>
        <div className="project-card-bar-title-wrap">
          <span className="project-card-bar-title">{projTitle}</span>
        </div>
      </div>

      {/* ── RIGHT MAIN SCREENSHOT CONTAINER ── */}
      <div className="project-card-media-wrapper">
        <img
          src={project.image}
          alt={projTitle}
          className="project-card-image"
          draggable={false}
        />
      </div>
    </div>
  );
}
