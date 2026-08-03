'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/css';
import { TreeGraph } from './TreeGraph';
import { GraphControls } from './GraphControls';
import { NodeDetailPanel } from './NodeDetailPanel';
import { parseTranscript } from '@/utils/data/textParsers';
import { transcriptToKnowledgeGraph } from '@/utils/data/graphTransformers';
import { persistenceManager, createDefaultGraphState, createEmptyGraph } from '@/utils/persistence';
import { GraphNode, GraphState, NodeType } from '@/types/graph';
import { RootSelect } from './ui/RootSelect';

const appStyles = css`
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

  .file-input {
    display: none;
  }
`;

export const TreeGraphApp: React.FC = () => {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    const savedGraph = persistenceManager.loadGraph();
    return createDefaultGraphState(savedGraph || undefined);
  });

  const [treeRootId, setTreeRootId] = useState<string | undefined>(undefined);
  const [rootHistory, setRootHistory] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // establish initial root
  const defaultRootId = useMemo(() => {
    const main = graphState.graph.nodes.find(n => n.metadata.isSourceDocument === 'true');
    if (main) return main.id;
    const doc = graphState.graph.nodes.find(n => n.type === NodeType.DOCUMENT);
    return doc?.id;
  }, [graphState.graph.nodes]);

  useEffect(() => {
    if (!treeRootId && defaultRootId) setTreeRootId(defaultRootId);
  }, [defaultRootId, treeRootId]);

  useEffect(() => {
    if (treeRootId) {
      setRootHistory((prev) => (prev[prev.length - 1] === treeRootId ? prev : [...prev, treeRootId!]));
    }
  }, [treeRootId]);

  // Auto-save when graph changes
  useEffect(() => {
    if (graphState.graph.nodes.length > 0) {
      persistenceManager.autoSave(graphState.graph);
    }
  }, [graphState.graph]);

  const selectedNode = graphState.selectedNodeId ? 
    graphState.graph.nodes.find(n => n.id === graphState.selectedNodeId) : null;

  const relatedEdges = selectedNode ? 
    graphState.graph.edges.filter(e => {
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      return sourceId === selectedNode.id || targetId === selectedNode.id;
    }) : [];

  const relatedNodes = relatedEdges.map(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    const otherNodeId = sourceId === selectedNode?.id ? targetId : sourceId;
    return graphState.graph.nodes.find(n => n.id === otherNodeId);
  }).filter(Boolean) as GraphNode[];

  const handleNodeClick = useCallback((nodeId: string) => {
    setGraphState(prev => ({
      ...prev,
      selectedNodeId: prev.selectedNodeId === nodeId ? undefined : nodeId
    }));
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<GraphNode>) => {
    setGraphState(prev => ({
      ...prev,
      graph: {
        ...prev.graph,
        nodes: prev.graph.nodes.map(node => 
          node.id === nodeId ? { ...node, ...updates } : node
        ),
        metadata: {
          ...prev.graph.metadata,
          modified: new Date().toISOString()
        }
      }
    }));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setGraphState(prev => ({
      ...prev,
      graph: {
        ...prev.graph,
        nodes: prev.graph.nodes.filter(node => node.id !== nodeId),
        edges: prev.graph.edges.filter(edge => 
          edge.source !== nodeId && edge.target !== nodeId
        ),
        metadata: {
          ...prev.graph.metadata,
          modified: new Date().toISOString()
        }
      },
      selectedNodeId: prev.selectedNodeId === nodeId ? undefined : prev.selectedNodeId
    }));
  }, []);

  const handleExportGraph = useCallback(() => {
    persistenceManager.exportGraph(graphState.graph);
  }, [graphState.graph]);

  const handleImportGraph = useCallback(async (file: File) => {
    try {
      const importedGraph = await persistenceManager.importGraph(file);
      setGraphState(createDefaultGraphState(importedGraph));
    } catch (error) {
      alert('Error importing graph: ' + (error as Error).message);
    }
  }, []);

  const handleClearGraph = useCallback(() => {
    if (confirm('Are you sure you want to clear the entire graph?')) {
      const emptyGraph = createEmptyGraph();
      setGraphState(createDefaultGraphState(emptyGraph));
      persistenceManager.clearStorage();
    }
  }, []);

  const handleTranscriptUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseTranscript(content, file.name);
      const newGraph = transcriptToKnowledgeGraph(parsed);
      setGraphState(createDefaultGraphState(newGraph));
    };
    reader.readAsText(file);
  }, []);

  const width = typeof window !== 'undefined' ? window.innerWidth - 300 - (selectedNode ? 400 : 0) : 800;
  const height = typeof window !== 'undefined' ? window.innerHeight - 60 : 600;

  return (
    <div className={appStyles}>
      <div className="sidebar">
        <GraphControls
          filter={graphState.filter}
          layout={graphState.layout}
          onFilterChange={(filter) => setGraphState(prev => ({ ...prev, filter }))}
          onLayoutChange={(layout) => setGraphState(prev => ({ ...prev, layout }))}
          onExportGraph={handleExportGraph}
          onImportGraph={handleImportGraph}
          onClearGraph={handleClearGraph}
        />
      </div>

      <div className="main-content">
        <div className="toolbar">
          <h1 className="app-title">Knowledge Graph — Tree</h1>
          <RootSelect
            options={graphState.graph.nodes
              .filter(n => n.type === NodeType.DOCUMENT || n.type === NodeType.SOURCE)
              .map(n => ({ value: n.id, label: n.content }))}
            value={treeRootId}
            onChange={(v) => {
              setTreeRootId(v);
              setGraphState(prev => ({ ...prev, selectedNodeId: undefined }));
            }}
            placeholder="Choose source root"
          />
          <button
            className="toolbar-button"
            disabled={rootHistory.length <= 1}
            onClick={() => {
              setRootHistory((prev) => {
                const next = [...prev];
                next.pop();
                const back = next[next.length - 1];
                setTreeRootId(back);
                return next;
              });
            }}
          >
            Back
          </button>
          <button 
            className="toolbar-button primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Transcript
          </button>
        </div>

        <div className="graph-container">
          {treeRootId ? (
            <TreeGraph
              graph={graphState.graph}
              rootId={treeRootId}
              width={width}
              height={height}
              selectedNodeId={graphState.selectedNodeId}
              onNodeClick={handleNodeClick}
              onNavigateToRoot={(id) => {
                setTreeRootId(id);
                setGraphState(prev => ({ ...prev, selectedNodeId: undefined }));
              }}
            />
          ) : null}
        </div>
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          relatedEdges={relatedEdges}
          relatedNodes={relatedNodes}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onClose={() => setGraphState(prev => ({ ...prev, selectedNodeId: undefined }))}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        accept=".txt,.json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.name.endsWith('.txt')) {
              handleTranscriptUpload(file);
            } else if (file.name.endsWith('.json')) {
              handleImportGraph(file);
            }
            e.target.value = '';
          }
        }}
      />
    </div>
  );
};
