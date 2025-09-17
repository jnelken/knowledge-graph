'use client';

import React from 'react';
import { css } from '@emotion/css';
import { GraphFilter, LayoutSettings, NodeType, EdgeType } from '@/types/graph';
import { NODE_TYPE_LABELS } from '@/constants/nodeTypes';
import { EDGE_TYPE_LABELS } from '@/constants/edgeTypes';

interface GraphControlsProps {
  filter: GraphFilter;
  layout: LayoutSettings;
  onFilterChange: (filter: GraphFilter) => void;
  onLayoutChange: (layout: LayoutSettings) => void;
  onExportGraph: () => void;
  onImportGraph: (file: File) => void;
  onClearGraph: () => void;
}

const controlsStyles = css`
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .section {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
    color: #333;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .filter-chip {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #ddd;
    background: white;

    &.active {
      background: #2196f3;
      color: white;
      border-color: #2196f3;
    }

    &:hover {
      border-color: #2196f3;
    }
  }

  .input-group {
    margin-bottom: 12px;
  }

  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
    color: #555;
  }

  .input-field {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: #2196f3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }
  }

  .slider-group {
    margin-bottom: 12px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
    color: #555;
  }

  .slider {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #ddd;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2196f3;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2196f3;
      cursor: pointer;
      border: none;
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    &.primary {
      background: #2196f3;
      color: white;
      border-color: #2196f3;

      &:hover {
        background: #1976d2;
      }
    }

    &.danger {
      background: #f44336;
      color: white;
      border-color: #f44336;

      &:hover {
        background: #d32f2f;
      }
    }
  }

  .file-input {
    display: none;
  }
`;

// Using constants from dedicated files

export const GraphControls: React.FC<GraphControlsProps> = ({
  filter,
  layout,
  onFilterChange,
  onLayoutChange,
  onExportGraph,
  onImportGraph,
  onClearGraph
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleNodeTypeToggle = (nodeType: NodeType) => {
    const newNodeTypes = new Set(filter.nodeTypes);
    if (newNodeTypes.has(nodeType)) {
      newNodeTypes.delete(nodeType);
    } else {
      newNodeTypes.add(nodeType);
    }
    onFilterChange({ ...filter, nodeTypes: newNodeTypes });
  };

  const handleEdgeTypeToggle = (edgeType: EdgeType) => {
    const newEdgeTypes = new Set(filter.edgeTypes);
    if (newEdgeTypes.has(edgeType)) {
      newEdgeTypes.delete(edgeType);
    } else {
      newEdgeTypes.add(edgeType);
    }
    onFilterChange({ ...filter, edgeTypes: newEdgeTypes });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportGraph(file);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className={controlsStyles}>
      {/* Search */}
      <div className="section">
        <div className="section-title">Search</div>
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Search nodes..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
          />
        </div>
      </div>

      {/* Node Type Filters */}
      <div className="section">
        <div className="section-title">Node Types</div>
        <div className="filter-group">
          {Object.entries(NODE_TYPE_LABELS).map(([type, label]) => (
            <div
              key={type}
              className={`filter-chip ${filter.nodeTypes.has(type as NodeType) ? 'active' : ''}`}
              onClick={() => handleNodeTypeToggle(type as NodeType)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Edge Type Filters */}
      <div className="section">
        <div className="section-title">Relationship Types</div>
        <div className="filter-group">
          {Object.entries(EDGE_TYPE_LABELS).map(([type, label]) => (
            <div
              key={type}
              className={`filter-chip ${filter.edgeTypes.has(type as EdgeType) ? 'active' : ''}`}
              onClick={() => handleEdgeTypeToggle(type as EdgeType)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div className="section">
        <div className="section-title">Filters</div>
        <div className="slider-group">
          <div className="slider-label">
            <span>Confidence Threshold</span>
            <span>{Math.round(filter.confidenceThreshold * 100)}%</span>
          </div>
          <input
            type="range"
            className="slider"
            min="0"
            max="1"
            step="0.1"
            value={filter.confidenceThreshold}
            onChange={(e) => onFilterChange({ 
              ...filter, 
              confidenceThreshold: parseFloat(e.target.value) 
            })}
          />
        </div>
        <div className="input-group">
          <label className="input-label">
            <input
              type="checkbox"
              checked={filter.showUserAdded}
              onChange={(e) => onFilterChange({ 
                ...filter, 
                showUserAdded: e.target.checked 
              })}
            />
            {' '}Show user-added content
          </label>
        </div>
      </div>

      {/* Layout Controls */}
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

      {/* Actions */}
      <div className="section">
        <div className="section-title">Actions</div>
        <div className="button-group">
          <button className="button primary" onClick={onExportGraph}>
            Export
          </button>
          <button 
            className="button" 
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </button>
          <button className="button danger" onClick={onClearGraph}>
            Clear
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept=".json"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};