'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { TreeGraph } from './TreeGraph';
import { GraphAppShell } from './GraphAppShell';
import { RootSelect } from './ui/RootSelect';
import { useGraphState } from '@/hooks/useGraphState';
import { useTreeRoot } from '@/hooks/useTreeRoot';
import { getRootOptions } from '@/utils/tree/defaultRoot';
import { getGraphViewportSize } from '@/utils/graph/graphViewport';

export const TreeGraphApp: React.FC = () => {
  const graph = useGraphState();
  const { graphState, selectedNode, toggleNodeSelection, clearSelection } = graph;
  const [treeRootId, setTreeRootId] = useTreeRoot(graphState.graph.nodes);
  const [rootHistory, setRootHistory] = useState<string[]>([]);

  useEffect(() => {
    if (treeRootId) {
      setRootHistory((prev) => (prev[prev.length - 1] === treeRootId ? prev : [...prev, treeRootId]));
    }
  }, [treeRootId]);

  const rootOptions = useMemo(() => getRootOptions(graphState.graph.nodes), [graphState.graph.nodes]);
  const { width, height } = getGraphViewportSize(Boolean(selectedNode));

  const navigateToRoot = (id: string) => {
    setTreeRootId(id);
    clearSelection();
  };

  const goBack = () => {
    const next = rootHistory.slice(0, -1);
    setRootHistory(next);
    setTreeRootId(next[next.length - 1]);
  };

  return (
    <GraphAppShell
      title="Knowledge Graph — Tree"
      graph={graph}
      toolbarStart={
        <>
          <RootSelect
            options={rootOptions}
            value={treeRootId}
            onChange={navigateToRoot}
            placeholder="Choose source root"
          />
          <button
            className="toolbar-button"
            disabled={rootHistory.length <= 1}
            onClick={goBack}
          >
            Back
          </button>
        </>
      }
    >
      <div className="graph-container">
        {treeRootId ? (
          <TreeGraph
            graph={graphState.graph}
            rootId={treeRootId}
            width={width}
            height={height}
            selectedNodeId={graphState.selectedNodeId}
            onNodeClick={toggleNodeSelection}
            onNavigateToRoot={navigateToRoot}
          />
        ) : null}
      </div>
    </GraphAppShell>
  );
};
