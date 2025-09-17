'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { css } from '@emotion/css';
import { ForceGraph } from './ForceGraph';
import { GraphControls } from './GraphControls';
import { NodeDetailPanel } from './NodeDetailPanel';
import { parseTranscript } from '@/utils/data/textParsers';
import { transcriptToKnowledgeGraph } from '@/utils/data/graphTransformers';
import { 
  persistenceManager, 
  createDefaultGraphState, 
  createEmptyGraph 
} from '@/utils/persistence';
import { 
  GraphState, 
  GraphNode
} from '@/types/graph';

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

  .drop-zone {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(33, 150, 243, 0.1);
    border: 2px dashed #2196f3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #2196f3;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;

    &.active {
      opacity: 1;
      pointer-events: all;
    }
  }

  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #666;
    z-index: 10;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 500;
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
  }
`;

export const KnowledgeGraphApp: React.FC = () => {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    const savedGraph = persistenceManager.loadGraph();
    return createDefaultGraphState(savedGraph || undefined);
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-save when graph changes
  useEffect(() => {
    if (graphState.graph.nodes.length > 0) {
      persistenceManager.autoSave(graphState.graph);
    }
  }, [graphState.graph]);

  // Filter nodes and edges based on current filters
  const { filteredNodes, filteredEdges } = useMemo(() => {
    const { filter } = graphState;
    
    const nodes = graphState.graph.nodes.filter(node => {
      // Always show source documents (main transcript nodes)
      const isSourceDocument = node.metadata.isSourceDocument === 'true';
      if (isSourceDocument) {
        // Still apply search filter to source documents if specified
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          return node.content.toLowerCase().includes(query) ||
                 (node.metadata.category?.toLowerCase().includes(query)) ||
                 (node.metadata.source?.toLowerCase().includes(query));
        }
        return true; // Always show source documents
      }
      
      // Regular filtering for non-source nodes
      // Type filter
      if (!filter.nodeTypes.has(node.type)) return false;
      
      // Confidence filter
      if ((node.metadata.credibility || 0) < filter.confidenceThreshold) return false;
      
      // User-added filter
      if (!filter.showUserAdded && node.userAdded) return false;
      
      // Search filter
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        return node.content.toLowerCase().includes(query) ||
               (node.metadata.category?.toLowerCase().includes(query)) ||
               (node.metadata.source?.toLowerCase().includes(query));
      }
      
      return true;
    });

    const nodeIds = new Set(nodes.map(n => n.id));
    
    const edges = graphState.graph.edges.filter(edge => {
      // Only include edges between visible nodes
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) return false;
      
      // Type filter
      if (!filter.edgeTypes.has(edge.type)) return false;
      
      // Confidence filter
      if (edge.confidence < filter.confidenceThreshold) return false;
      
      // User-added filter
      if (!filter.showUserAdded && edge.userAdded) return false;
      
      return true;
    });

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graphState]);

  // Debug logging for development (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const sourceNodes = graphState.graph.nodes.filter(n => n.metadata.isSourceDocument === 'true');
      const edgesFromSource = graphState.graph.edges.filter(e => {
        const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
        return sourceNodes.some(n => n.id === sourceId);
      });
      
      console.log('Source documents:', sourceNodes.length);
      console.log('Edges from source:', edgesFromSource.length);
      console.log('Filtered nodes:', filteredNodes.length);
      console.log('Filtered edges:', filteredEdges.length);
    }
  }, [graphState.graph.nodes, graphState.graph.edges, filteredNodes, filteredEdges]);

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

  const handleNodeHover = useCallback((_nodeId: string | null) => {
    // Could be used for hover effects in the future
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setGraphState(prev => ({
      ...prev,
      selectedNodeId: undefined
    }));
  }, []);

  const handleFilterChange = useCallback((filter: typeof graphState.filter) => {
    setGraphState(prev => ({ ...prev, filter }));
  }, [graphState]);

  const handleLayoutChange = useCallback((layout: typeof graphState.layout) => {
    setGraphState(prev => ({ ...prev, layout }));
  }, [graphState]);

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

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (textFile) {
      handleTranscriptUpload(textFile);
    } else if (jsonFile) {
      handleImportGraph(jsonFile);
    } else {
      alert('Please drop a .txt transcript file or .json graph file');
    }
  }, [handleTranscriptUpload, handleImportGraph]);

  const isEmpty = graphState.graph.nodes.length === 0;

  return (
    <div className={appStyles}>
      <div className="sidebar">
        <GraphControls
          filter={graphState.filter}
          layout={graphState.layout}
          onFilterChange={handleFilterChange}
          onLayoutChange={handleLayoutChange}
          onExportGraph={handleExportGraph}
          onImportGraph={handleImportGraph}
          onClearGraph={handleClearGraph}
        />
      </div>
      
      <div className="main-content">
        <div className="toolbar">
          <h1 className="app-title">Knowledge Graph</h1>
          <button 
            className="toolbar-button primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Transcript
          </button>
          <span style={{ fontSize: '13px', color: '#666' }}>
            {filteredNodes.length} nodes, {filteredEdges.length} edges
          </span>
        </div>
        
        <div 
          className="graph-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isEmpty ? (
            <div className="empty-state">
              <h3>Welcome to Knowledge Graph</h3>
              <p>Upload a transcript file or drag & drop to get started</p>
            </div>
          ) : (
            <ForceGraph
              nodes={filteredNodes}
              edges={filteredEdges}
              width={typeof window !== 'undefined' ? window.innerWidth - 300 - (selectedNode ? 400 : 0) : 800}
              height={typeof window !== 'undefined' ? window.innerHeight - 60 : 600}
              layoutSettings={graphState.layout}
              selectedNodeId={graphState.selectedNodeId}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onBackgroundClick={handleBackgroundClick}
            />
          )}
          
          <div className={`drop-zone ${isDragging ? 'active' : ''}`}>
            Drop transcript or graph files here
          </div>
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