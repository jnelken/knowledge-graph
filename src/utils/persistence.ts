import { KnowledgeGraph, GraphState, NodeType, EdgeType, GraphNode, GraphEdge } from '@/types/graph';

const STORAGE_KEY = 'knowledge-graph-data';
const AUTO_SAVE_DELAY = 1000; // 1 second debounce

class PersistenceManager {
  private autoSaveTimer: NodeJS.Timeout | null = null;

  // Load graph from localStorage
  loadGraph(): KnowledgeGraph | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Validate basic structure
      if (!parsed.nodes || !parsed.edges || !parsed.metadata) {
        console.warn('Invalid graph structure in localStorage');
        return null;
      }
      
      // Convert Sets back from arrays (JSON doesn't preserve Sets)
      return this.deserializeGraph(parsed);
    } catch {
      console.error('Error loading graph from localStorage');
      return null;
    }
  }

  // Save graph to localStorage
  saveGraph(graph: KnowledgeGraph): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = this.serializeGraph(graph);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving graph to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        this.handleStorageQuotaExceeded();
      }
    }
  }

  // Auto-save with debouncing
  autoSave(graph: KnowledgeGraph): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.saveGraph(graph);
      this.autoSaveTimer = null;
    }, AUTO_SAVE_DELAY);
  }

  // Export graph as downloadable JSON file
  exportGraph(graph: KnowledgeGraph, filename?: string): void {
    const serialized = this.serializeGraph(graph);
    const dataStr = JSON.stringify(serialized, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `knowledge-graph-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import graph from file
  importGraph(file: File): Promise<KnowledgeGraph> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          const graph = this.deserializeGraph(parsed);
          resolve(graph);
        } catch (error) {
          reject(new Error('Invalid JSON file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Clear all stored data
  clearStorage(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number } {
    if (typeof window === 'undefined') return { used: 0, available: 0 };
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const used = stored ? new Blob([stored]).size : 0;
      
      // Estimate available space (localStorage limit is ~5-10MB)
      const estimated = 5 * 1024 * 1024; // 5MB estimate
      
      return { used, available: estimated - used };
    } catch {
      return { used: 0, available: 0 };
    }
  }

  private serializeGraph(graph: KnowledgeGraph): Record<string, unknown> {
    // Handle any special serialization needs
    return {
      ...graph,
      metadata: {
        ...graph.metadata,
        modified: new Date().toISOString()
      }
    };
  }

  private deserializeGraph(data: Record<string, unknown>): KnowledgeGraph {
    // Handle any special deserialization needs
    return {
      nodes: (data.nodes as GraphNode[]) || [],
      edges: (data.edges as GraphEdge[]) || [],
      metadata: {
        title: (data.metadata as Record<string, unknown>)?.title as string || 'Untitled Graph',
        description: (data.metadata as Record<string, unknown>)?.description as string,
        created: (data.metadata as Record<string, unknown>)?.created as string || new Date().toISOString(),
        modified: (data.metadata as Record<string, unknown>)?.modified as string || new Date().toISOString(),
        version: (data.metadata as Record<string, unknown>)?.version as string || '1.0.0',
        sourceDocument: (data.metadata as Record<string, unknown>)?.sourceDocument as string
      }
    };
  }

  private handleStorageQuotaExceeded(): void {
    console.warn('localStorage quota exceeded. Consider implementing data cleanup or compression.');
    // Could implement automatic cleanup of old data here
  }
}

// Create default empty graph
export function createEmptyGraph(title = 'New Knowledge Graph'): KnowledgeGraph {
  return {
    nodes: [],
    edges: [],
    metadata: {
      title,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

// Create default graph state
export function createDefaultGraphState(graph?: KnowledgeGraph): GraphState {
  return {
    graph: graph || createEmptyGraph(),
    selectedNodeId: undefined,
    selectedEdgeId: undefined,
    filter: {
      nodeTypes: new Set(Object.values(NodeType)),
      edgeTypes: new Set(Object.values(EdgeType)),
      searchQuery: '',
      confidenceThreshold: 0,
      showUserAdded: true
    },
    layout: {
      strength: 0.1,
      distance: 100,
      charge: -300,
      centerForce: 0.1,
      collisionRadius: 20
    }
  };
}

export const persistenceManager = new PersistenceManager();