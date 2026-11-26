import React from 'react';
import { sound } from '../services/soundService';

interface HotspotMarkerProps {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage width
  height: number; // percentage height
  title: string;
  onClick: () => void;
  onItemUse?: (itemId: string) => void;
  selectedItemId?: string | null;
  cursorStyle?: string;
  showGlow?: boolean;
  isActive?: boolean;
}

export const HotspotMarker: React.FC<HotspotMarkerProps> = ({
  x,
  y,
  width,
  height,
  title,
  onClick,
  onItemUse,
  selectedItemId,
  cursorStyle = 'cursor-pointer',
  showGlow = false,
  isActive = true
}) => {
  if (!isActive) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemId && onItemUse) {
      onItemUse(selectedItemId);
    } else {
      sound.playClick();
      onClick();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId && onItemUse) {
      onItemUse(itemId);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      /* 
        CRITICAL REQUIREMENT:
        ABSOLUTELY ZERO VISIBLE BOXES, ZERO BORDERS, ZERO OUTLINES, ZERO SHADOWS, ZERO BACKGROUNDS.
        The scenery is 100% natural and clean. The player clicks purely on visual elements in the scene.
      */
      className={`absolute -translate-x-1/2 -translate-y-1/2 z-25 ${cursorStyle} select-none outline-none focus:outline-none border-none bg-transparent`}
      title={title}
    />
  );
};
