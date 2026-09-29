'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/css';
import { ForceGraph } from './ForceGraph';
import { TreeGraph } from './TreeGraph';
import { GraphAppShell } from './GraphAppShell';
import { GraphFileDropZone } from './GraphFileDropZone';
import { SegmentedControl } from './ui/SegmentedControl';
import { useGraphState } from '@/hooks/useGraphState';
import { useTreeRoot } from '@/hooks/useTreeRoot';
import { filterGraph } from '@/utils/graph/graphFilter';
import { extractNodeId } from '@/utils/graph/edgeCalculations';
import { getGraphViewportSize } from '@/utils/graph/graphViewport';

type ViewMode = 'force' | 'tree';

const VIEW_OPTIONS: { label: string; value: ViewMode }[] = [
  { label: 'Force View', value: 'force' },
  { label: 'Tree View', value: 'tree' }
];

const emptyStateStyles = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
  z-index: 10;

  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

export const KnowledgeGraphApp: React.FC = () => {
  const graph = useGraphState();
  const { graphState, selectedNode, toggleNodeSelection, clearSelection } = graph;
  const [viewMode, setViewMode] = useState<ViewMode>('force');
  const [treeRootId, setTreeRootId] = useTreeRoot(graphState.graph.nodes);

  const { filteredNodes, filteredEdges } = useMemo(
    () => filterGraph(graphState.graph, graphState.filter),
    [graphState.graph, graphState.filter]
  );

  // Debug logging for development (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const sourceNodes = graphState.graph.nodes.filter(n => n.metadata.isSourceDocument === 'true');
      const edgesFromSource = graphState.graph.edges.filter(e =>
        sourceNodes.some(n => n.id === extractNodeId(e.source))
      );

      console.log('Source documents:', sourceNodes.length);
      console.log('Edges from source:', edgesFromSource.length);
      console.log('Filtered nodes:', filteredNodes.length);
      console.log('Filtered edges:', filteredEdges.length);
    }
  }, [graphState.graph.nodes, graphState.graph.edges, filteredNodes, filteredEdges]);

  const { width, height } = getGraphViewportSize(Boolean(selectedNode));
  const isEmpty = graphState.graph.nodes.length === 0;

  return (
    <GraphAppShell
      title="Knowledge Graph"
      graph={graph}
      toolbarStart={
        <SegmentedControl options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
      }
      toolbarEnd={
        <span style={{ fontSize: '13px', color: '#666' }}>
          {filteredNodes.length} nodes, {filteredEdges.length} edges
        </span>
      }
    >
      <GraphFileDropZone onFile={graph.loadGraphFile}>
        {isEmpty ? (
          <div className={emptyStateStyles}>
            <h3>Welcome to Knowledge Graph</h3>
            <p>Upload a transcript file or drag & drop to get started</p>
          </div>
        ) : viewMode === 'force' ? (
          <ForceGraph
            nodes={filteredNodes}
            edges={filteredEdges}
            width={width}
            height={height}
            layoutSettings={graphState.layout}
            selectedNodeId={graphState.selectedNodeId}
            onNodeClick={toggleNodeSelection}
            onNodeHover={() => {}}
            onBackgroundClick={clearSelection}
          />
        ) : treeRootId ? (
          <TreeGraph
            graph={graphState.graph}
            rootId={treeRootId}
            width={width}
            height={height}
            selectedNodeId={graphState.selectedNodeId}
            onNodeClick={toggleNodeSelection}
            onNavigateToRoot={(id) => {
              setTreeRootId(id);
              clearSelection();
            }}
          />
        ) : null}
      </GraphFileDropZone>
    </GraphAppShell>
  );
};
