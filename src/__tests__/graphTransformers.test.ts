import { describe, expect, it } from 'vitest';
import {
  createEmptyKnowledgeGraph,
  mergeKnowledgeGraphs,
  transcriptToKnowledgeGraph
} from '@/utils/data/graphTransformers';
import { EdgeType, KnowledgeGraph, NodeType, ParsedTranscript } from '@/types/graph';

const mention = { context: '', position: 0, length: 0 };

const transcript = (overrides: Partial<ParsedTranscript> = {}): ParsedTranscript => ({
  title: 'Talk',
  source: 'https://example.com/talk?id=1',
  content: '',
  entities: [
    { text: 'Alice', type: NodeType.PERSON, mentions: [mention], confidence: 0.9 },
    { text: 'Paris', type: NodeType.LOCATION, mentions: [mention], confidence: 0.5 }
  ],
  statements: [
    { text: 'Alice said hello', context: 'intro', confidence: 0.7, type: 'claim' },
    { text: 'Nothing here', context: 'we met in paris', confidence: 0.3, type: 'fact' }
  ],
  ...overrides
});

describe('transcriptToKnowledgeGraph', () => {
  it('derives the source node ID from the alphanumerics of the source, capped at 20 chars', () => {
    const graph = transcriptToKnowledgeGraph(transcript());
    expect(graph.nodes[0]).toMatchObject({
      id: 'source-httpsexamplecomtalki',
      type: NodeType.DOCUMENT,
      content: 'Talk',
      metadata: { isSourceDocument: 'true', category: 'transcript' }
    });
  });

  it('uses a fixed source ID when there is no source', () => {
    const graph = transcriptToKnowledgeGraph(transcript({ source: '' }));
    expect(graph.nodes[0].id).toBe('source-document');
  });

  it('creates index-based entity and statement IDs', () => {
    const ids = transcriptToKnowledgeGraph(transcript()).nodes.map(n => n.id);
    expect(ids.slice(1)).toEqual(['entity-person-0', 'entity-location-1', 'statement-0', 'statement-1']);
  });

  it('links the source to entities and statements, and statements to entities they mention', () => {
    const graph = transcriptToKnowledgeGraph(transcript());
    const byId = Object.fromEntries(graph.edges.map(e => [e.id, e]));
    const src = 'source-httpsexamplecomtalki';

    expect(Object.keys(byId)).toEqual([
      'source-to-entity-person-0',
      'source-to-entity-location-1',
      'source-to-statement-0',
      'statement-0-to-entity-person-0',
      'source-to-statement-1',
      'statement-1-to-entity-location-1'
    ]);
    expect(byId['source-to-entity-person-0']).toEqual({
      id: 'source-to-entity-person-0',
      source: src,
      target: 'entity-person-0',
      type: EdgeType.MENTIONS,
      strength: 0.4,
      confidence: 0.9
    });
    expect(byId['source-to-statement-0']).toMatchObject({ type: EdgeType.REFERENCES, strength: 0.6, confidence: 0.7 });
    // Statement-to-entity confidence is the lower of the two; matching is case-insensitive and includes context.
    expect(byId['statement-0-to-entity-person-0'].confidence).toBe(0.7);
    expect(byId['statement-1-to-entity-location-1'].confidence).toBe(0.3);
  });

  // Known bug pinned as-is until DEV-197 fixes it.
  it('falls back to the edge type default confidence when confidence is 0', () => {
    const graph = transcriptToKnowledgeGraph(transcript({
      entities: [{ text: 'Alice', type: NodeType.PERSON, mentions: [mention], confidence: 0 }],
      statements: []
    }));
    expect(graph.edges[0].confidence).toBe(0.6);
  });

  it('never links an entity that has no mentions', () => {
    const graph = transcriptToKnowledgeGraph(transcript({
      entities: [{ text: 'Alice', type: NodeType.PERSON, mentions: [], confidence: 0.9 }]
    }));
    expect(graph.edges.some(e => e.id.startsWith('statement-'))).toBe(false);
  });

  it('fills graph metadata from the transcript', () => {
    expect(transcriptToKnowledgeGraph(transcript()).metadata).toMatchObject({
      title: 'Talk',
      description: 'Knowledge graph extracted from: Talk',
      version: '1.0.0',
      sourceDocument: 'https://example.com/talk?id=1'
    });
  });
});

describe('createEmptyKnowledgeGraph', () => {
  it('creates an empty graph with a default title', () => {
    const graph = createEmptyKnowledgeGraph();
    expect(graph).toMatchObject({ nodes: [], edges: [], metadata: { title: 'New Knowledge Graph', version: '1.0.0' } });
    expect(createEmptyKnowledgeGraph('Mine').metadata.title).toBe('Mine');
  });
});

describe('mergeKnowledgeGraphs', () => {
  const graph = (title: string, nodeIds: string[], edgeIds: string[]): KnowledgeGraph => ({
    nodes: nodeIds.map(id => ({ id, type: NodeType.STATEMENT, content: `${title} ${id}`, metadata: {} })),
    edges: edgeIds.map(id => ({ id, source: 'a', target: 'b', type: EdgeType.SUPPORTS, strength: 1, confidence: 1 })),
    metadata: { title, created: '', modified: '', version: '1.0.0' }
  });

  it('dedupes nodes and edges by ID, keeping the first graph\'s copy', () => {
    const merged = mergeKnowledgeGraphs(graph('A', ['a', 'b'], ['e1']), graph('B', ['b', 'c'], ['e1', 'e2']));
    expect(merged.nodes.map(n => n.content)).toEqual(['A a', 'A b', 'B c']);
    expect(merged.edges.map(e => e.id)).toEqual(['e1', 'e2']);
  });

  it('combines the titles', () => {
    const merged = mergeKnowledgeGraphs(graph('A', [], []), graph('B', [], []));
    expect(merged.metadata).toMatchObject({ title: 'A + B', description: 'Merged graph from A and B' });
  });
});
