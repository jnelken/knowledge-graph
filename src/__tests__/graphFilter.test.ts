import { describe, expect, it } from 'vitest';
import { filterGraph } from '@/utils/graph/graphFilter';
import { EdgeType, GraphEdge, GraphFilter, GraphNode, KnowledgeGraph, NodeType } from '@/types/graph';

const node = (id: string, type: NodeType, overrides: Partial<GraphNode> = {}): GraphNode => ({
  id,
  type,
  content: id,
  metadata: { credibility: 0.9 },
  ...overrides
});

const edge = (id: string, source: string, target: string, overrides: Partial<GraphEdge> = {}): GraphEdge => ({
  id,
  source,
  target,
  type: EdgeType.SUPPORTS,
  strength: 0.5,
  confidence: 0.9,
  ...overrides
});

const baseFilter = (overrides: Partial<GraphFilter> = {}): GraphFilter => ({
  nodeTypes: new Set([NodeType.STATEMENT]),
  edgeTypes: new Set([EdgeType.SUPPORTS]),
  searchQuery: '',
  confidenceThreshold: 0.5,
  showUserAdded: true,
  ...overrides
});

const graphOf = (nodes: GraphNode[], edges: GraphEdge[]): KnowledgeGraph => ({
  nodes,
  edges,
  metadata: { title: 't', created: '', modified: '', version: '1' }
});

describe('filterGraph', () => {
  const source = node('source', NodeType.DOCUMENT, { metadata: { isSourceDocument: 'true' } });
  const claim = node('claim', NodeType.STATEMENT);
  const person = node('person', NodeType.PERSON);

  it('keeps source documents even when their type is filtered out', () => {
    const { filteredNodes } = filterGraph(graphOf([source, claim, person], []), baseFilter());
    expect(filteredNodes.map(n => n.id)).toEqual(['source', 'claim']);
  });

  it('applies search to source documents too', () => {
    const { filteredNodes } = filterGraph(graphOf([source, claim], []), baseFilter({ searchQuery: 'CLA' }));
    expect(filteredNodes.map(n => n.id)).toEqual(['claim']);
  });

  it('drops low-credibility and hidden user-added nodes', () => {
    const weak = node('weak', NodeType.STATEMENT, { metadata: { credibility: 0.1 } });
    const mine = node('mine', NodeType.STATEMENT, { userAdded: true });
    const { filteredNodes } = filterGraph(
      graphOf([claim, weak, mine], []),
      baseFilter({ showUserAdded: false })
    );
    expect(filteredNodes.map(n => n.id)).toEqual(['claim']);
  });

  it('keeps only edges between visible nodes that pass edge filters', () => {
    const edges = [
      edge('ok', 'source', 'claim'),
      edge('hidden-endpoint', 'source', 'person'),
      edge('wrong-type', 'source', 'claim', { type: EdgeType.CITES }),
      edge('weak', 'source', 'claim', { confidence: 0.1 }),
      edge('object-endpoints', 'claim', 'source', { source: claim, target: source })
    ];
    const { filteredEdges } = filterGraph(graphOf([source, claim, person], edges), baseFilter());
    expect(filteredEdges.map(e => e.id)).toEqual(['ok', 'object-endpoints']);
  });
});
