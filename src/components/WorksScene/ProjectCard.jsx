import React from 'react';
import { cn } from '../../lib/utils';
import './ProjectCard.css';

/**
 * ProjectCard represents a minimal, highly structured editorial placard
 * that displays project metadata. Now redesigned as a cohesive image board.
 */
export default function ProjectCard({
  project,
  isLayer2 = false,
  cardRef,
  onPointerEnter,
  onPointerLeave,
  style,
  className,
  ...props
}) {
  return (
    <div
      ref={cardRef}
      className={cn(
        'project-card-root',
        isLayer2 ? 'project-card-layer2' : 'project-card-layer1',
        className
      )}
      style={style}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      <img src={project.image} alt="Project Preview" className="project-card-image" draggable={false} />
    </div>
  );
}
