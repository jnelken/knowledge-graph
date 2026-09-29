'use client';

import React from 'react';
import { css } from '@emotion/css';
import { GraphControls } from './GraphControls';
import { NodeDetailPanel } from './NodeDetailPanel';
import { UploadTranscriptButton } from './UploadTranscriptButton';
import { GraphStateApi } from '@/hooks/useGraphState';

const shellStyles = css`
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;

  .sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
    z-index: 100;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .toolbar {
    padding: 12px 16px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .app-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .toolbar-button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 13px;
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
  }

  .graph-container {
    flex: 1;
    position: relative;
  }
`;

interface GraphAppShellProps {
  title: string;
  graph: GraphStateApi;
  /** Toolbar controls rendered before the upload button. */
  toolbarStart?: React.ReactNode;
  /** Toolbar content rendered after the upload button. */
  toolbarEnd?: React.ReactNode;
  /** The graph area; render a `.graph-container` element. */
  children: React.ReactNode;
}

export const GraphAppShell: React.FC<GraphAppShellProps> = ({
  title,
  graph,
  toolbarStart,
  toolbarEnd,
  children
}) => {
  const { graphState, selectedNode, relatedEdges, relatedNodes } = graph;

  return (
    <div className={shellStyles}>
      <div className="sidebar">
        <GraphControls
          filter={graphState.filter}
          layout={graphState.layout}
          onFilterChange={graph.setFilter}
          onLayoutChange={graph.setLayout}
          onExportGraph={graph.exportGraph}
          onImportGraph={graph.importGraph}
          onClearGraph={graph.clearGraph}
        />
      </div>

      <div className="main-content">
        <div className="toolbar">
          <h1 className="app-title">{title}</h1>
          {toolbarStart}
          <UploadTranscriptButton onFile={graph.loadGraphFile} />
          {toolbarEnd}
        </div>
        {children}
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          relatedEdges={relatedEdges}
          relatedNodes={relatedNodes}
          onNodeUpdate={graph.updateNode}
          onNodeDelete={graph.deleteNode}
          onClose={graph.clearSelection}
        />
      )}
    </div>
  );
};
