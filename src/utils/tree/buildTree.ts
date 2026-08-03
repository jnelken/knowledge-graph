import { KnowledgeGraph, GraphNode, GraphEdge, EdgeType, NodeType } from '@/types/graph';

export type TreeKind = 'root' | 'quote' | 'evidence';

export interface TreeDatum {
  id: string;
  kind: TreeKind;
  ref: GraphNode;
  children: Array<TreeDatum & { via?: EdgeType }>; // children with edge type from parent
}

/**
 * Build a left-to-right tree structure from the knowledge graph for a single root document.
 * Root: Document node (the selected source)
 * Level 1: Quotes/statements referenced by the root (EdgeType.REFERENCES)
 * Level 2: Evidence sources that SUPPORT or REFUTE the quote (nodes of type DOCUMENT or SOURCE)
 * Note: DAGs are handled by duplicating evidence nodes under each quote for layout simplicity.
 */
export function buildTreeFromGraph(rootId: string, graph: KnowledgeGraph): TreeDatum | null {
  const nodeById = new Map(graph.nodes.map(n => [n.id, n] as const));
  const root = nodeById.get(rootId);
  if (!root) return null;

  const edges: GraphEdge[] = graph.edges;

  // Helper to get neighboring nodes by edge constraint
  const neighbors = (
    nodeId: string,
    predicate: (e: GraphEdge, other: GraphNode) => boolean
  ): GraphNode[] => {
    const result: GraphNode[] = [];
    for (const e of edges) {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      if (s === nodeId) {
        const other = nodeById.get(t);
        if (other && predicate(e, other)) result.push(other);
      } else if (t === nodeId) {
        const other = nodeById.get(s);
        if (other && predicate(e, other)) result.push(other);
      }
    }
    return result;
  };

  // Quotes are statements referenced by the root (REFERENCES edges)
  const quotes = neighbors(root.id, (e, other) => e.type === EdgeType.REFERENCES && other.type === NodeType.STATEMENT);

  const children = quotes.map(quote => {
    // Evidence are sources/documents connected to the quote via SUPPORTS or REFUTES
    const evidenceSources = [] as Array<{ node: GraphNode; via: EdgeType }>;
    for (const e of edges) {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      if (e.type === EdgeType.SUPPORTS || e.type === EdgeType.REFUTES) {
        if (s === quote.id) {
          const other = nodeById.get(t);
          if (other && (other.type === NodeType.DOCUMENT || other.type === NodeType.SOURCE)) {
            evidenceSources.push({ node: other, via: e.type });
          }
        } else if (t === quote.id) {
          const other = nodeById.get(s);
          if (other && (other.type === NodeType.DOCUMENT || other.type === NodeType.SOURCE)) {
            evidenceSources.push({ node: other, via: e.type });
          }
        }
      }
    }

    const evidenceChildren: Array<TreeDatum & { via?: EdgeType }> = evidenceSources.map(({ node, via }) => ({
      id: node.id,
      kind: 'evidence',
      ref: node,
      children: [],
      via,
    }));

    const quoteDatum: TreeDatum & { via?: EdgeType } = {
      id: quote.id,
      kind: 'quote',
      ref: quote,
      children: evidenceChildren,
    };

    return quoteDatum;
  });

  const rootDatum: TreeDatum = {
    id: root.id,
    kind: 'root',
    ref: root,
    children,
  };

  return rootDatum;
}

