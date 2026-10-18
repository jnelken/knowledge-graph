'use client';

import React from 'react';
import { LayoutSettings } from '@/types/graph';

interface LayoutControlsProps {
  layout: LayoutSettings;
  onLayoutChange: (layout: LayoutSettings) => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  layout,
  onLayoutChange
}) => (
  <div className="section">
    <div className="section-title">Layout</div>
    <div className="slider-group">
      <div className="slider-label">
        <span>Link Strength</span>
        <span>{layout.strength.toFixed(1)}</span>
      </div>
      <input
        type="range"
        className="slider"
        min="0"
        max="1"
        step="0.1"
        value={layout.strength}
        onChange={(e) => onLayoutChange({
          ...layout,
          strength: parseFloat(e.target.value)
        })}
      />
    </div>
    <div className="slider-group">
      <div className="slider-label">
        <span>Link Distance</span>
        <span>{layout.distance}</span>
      </div>
      <input
        type="range"
        className="slider"
        min="50"
        max="300"
        step="10"
        value={layout.distance}
        onChange={(e) => onLayoutChange({
          ...layout,
          distance: parseInt(e.target.value)
        })}
      />
    </div>
    <div className="slider-group">
      <div className="slider-label">
        <span>Repulsion Force</span>
        <span>{Math.abs(layout.charge)}</span>
      </div>
      <input
        type="range"
        className="slider"
        min="100"
        max="1000"
        step="50"
        value={Math.abs(layout.charge)}
        onChange={(e) => onLayoutChange({
          ...layout,
          charge: -parseInt(e.target.value)
        })}
      />
    </div>
  </div>
);
