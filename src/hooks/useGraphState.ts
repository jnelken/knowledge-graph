'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseTranscript } from '@/utils/data/textParsers';
import { transcriptToKnowledgeGraph } from '@/utils/data/graphTransformers';
import { getGraphFileKind } from '@/utils/data/graphFiles';
import { edgeConnectsToNode, getOtherNodeId } from '@/utils/graph/edgeCalculations';
import {
  persistenceManager,
  createDefaultGraphState,
  createEmptyGraph
} from '@/utils/persistence';
import { GraphFilter, GraphNode, GraphState, LayoutSettings } from '@/types/graph';

const touchMetadata = (metadata: GraphState['graph']['metadata']) => ({
  ...metadata,
  modified: new Date().toISOString()
});

export function useGraphState() {
  const [graphState, setGraphState] = useState<GraphState>(() => {
    const savedGraph = persistenceManager.loadGraph();
    return createDefaultGraphState(savedGraph || undefined);
  });

  useEffect(() => {
    if (graphState.graph.nodes.length > 0) {
      persistenceManager.autoSave(graphState.graph);
    }
  }, [graphState.graph]);

  const { selectedNode, relatedEdges, relatedNodes } = useMemo(() => {
    const { nodes, edges } = graphState.graph;
    const node = graphState.selectedNodeId
      ? nodes.find(n => n.id === graphState.selectedNodeId) ?? null
      : null;
    if (!node) return { selectedNode: null, relatedEdges: [], relatedNodes: [] };

    const connected = edges.filter(edge => edgeConnectsToNode(edge, node.id));
    const neighbors = connected
      .map(edge => nodes.find(n => n.id === getOtherNodeId(edge, node.id)))
      .filter(Boolean) as GraphNode[];
    return { selectedNode: node, relatedEdges: connected, relatedNodes: neighbors };
  }, [graphState.graph, graphState.selectedNodeId]);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setGraphState(prev => ({
      ...prev,
      selectedNodeId: prev.selectedNodeId === nodeId ? undefined : nodeId
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setGraphState(prev => ({ ...prev, selectedNodeId: undefined }));
  }, []);

  const setFilter = useCallback((filter: GraphFilter) => {
    setGraphState(prev => ({ ...prev, filter }));
  }, []);

  const setLayout = useCallback((layout: LayoutSettings) => {
    setGraphState(prev => ({ ...prev, layout }));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<GraphNode>) => {
    setGraphState(prev => ({
      ...prev,
      graph: {
        ...prev.graph,
        nodes: prev.graph.nodes.map(node =>
          node.id === nodeId ? { ...node, ...updates } : node
        ),
        metadata: touchMetadata(prev.graph.metadata)
      }
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setGraphState(prev => ({
      ...prev,
      graph: {
        ...prev.graph,
        nodes: prev.graph.nodes.filter(node => node.id !== nodeId),
        edges: prev.graph.edges.filter(edge => !edgeConnectsToNode(edge, nodeId)),
        metadata: touchMetadata(prev.graph.metadata)
      },
      selectedNodeId: prev.selectedNodeId === nodeId ? undefined : prev.selectedNodeId
    }));
  }, []);

  const exportGraph = useCallback(() => {
    persistenceManager.exportGraph(graphState.graph);
  }, [graphState.graph]);

  const importGraph = useCallback(async (file: File) => {
    try {
      const importedGraph = await persistenceManager.importGraph(file);
      setGraphState(createDefaultGraphState(importedGraph));
    } catch (error) {
      alert('Error importing graph: ' + (error as Error).message);
    }
  }, []);

  const clearGraph = useCallback(() => {
    if (confirm('Are you sure you want to clear the entire graph?')) {
      setGraphState(createDefaultGraphState(createEmptyGraph()));
      persistenceManager.clearStorage();
    }
  }, []);

  const uploadTranscript = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseTranscript(content, file.name);
      setGraphState(createDefaultGraphState(transcriptToKnowledgeGraph(parsed)));
    };
    reader.readAsText(file);
  }, []);

  const loadGraphFile = useCallback((file: File) => {
    const kind = getGraphFileKind(file);
    if (kind === 'transcript') uploadTranscript(file);
    else if (kind === 'graph') importGraph(file);
  }, [uploadTranscript, importGraph]);

  return {
    graphState,
    selectedNode,
    relatedEdges,
    relatedNodes,
    toggleNodeSelection,
    clearSelection,
    setFilter,
    setLayout,
    updateNode,
    deleteNode,
    exportGraph,
    importGraph,
    clearGraph,
    loadGraphFile
  };
}

export type GraphStateApi = ReturnType<typeof useGraphState>;
