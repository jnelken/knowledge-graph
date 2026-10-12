import { describe, expect, it } from 'vitest';
import {
  areDuplicateEdges,
  findDuplicateEdges,
  generateEdgeValidationReport,
  isSelfLoop,
  validateEdge,
  validateEdgeConnections,
  validateEdgeMetadata,
  validateUniqueEdgeId
} from '@/utils/validation/edgeValidation';
import { EdgeType, GraphEdge, GraphNode, NodeType } from '@/types/graph';

const edge = (overrides: Partial<GraphEdge> = {}): GraphEdge => ({
  id: 'e1',
  source: 'a',
  target: 'b',
  type: EdgeType.SUPPORTS,
  strength: 0.5,
  confidence: 0.5,
  ...overrides
});

const node = (id: string): GraphNode => ({ id, type: NodeType.STATEMENT, content: id, metadata: {} });

describe('validateEdge', () => {
  it('accepts a well-formed edge, including bounds 0 and 1', () => {
    expect(validateEdge(edge())).toBe(true);
    expect(validateEdge(edge({ strength: 0, confidence: 1 }))).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'edge'],
    ['an empty id', edge({ id: '' })],
    ['no source', edge({ source: '' })],
    ['no target', edge({ target: '' })],
    ['an unknown type', { ...edge(), type: 'likes' }],
    ['strength above 1', edge({ strength: 1.1 })],
    ['negative confidence', edge({ confidence: -0.1 })],
    ['non-numeric strength', { ...edge(), strength: '0.5' }]
  ])('rejects %s', (_, value) => {
    expect(validateEdge(value)).toBe(false);
  });
});

describe('edge helpers', () => {
  it('validateEdgeConnections requires both endpoints, as IDs or node objects', () => {
    const nodes = [node('a'), node('b')];
    expect(validateEdgeConnections(edge(), nodes)).toBe(true);
    expect(validateEdgeConnections(edge({ source: node('a'), target: node('b') }), nodes)).toBe(true);
    expect(validateEdgeConnections(edge({ target: 'z' }), nodes)).toBe(false);
  });

  it('validateUniqueEdgeId checks existing IDs', () => {
    expect(validateUniqueEdgeId('e1', [edge()])).toBe(false);
    expect(validateUniqueEdgeId('e2', [edge()])).toBe(true);
  });

  it('isSelfLoop compares resolved endpoint IDs', () => {
    expect(isSelfLoop(edge({ target: node('a') }))).toBe(true);
    expect(isSelfLoop(edge())).toBe(false);
  });

  it('areDuplicateEdges matches direction and type but ignores ID', () => {
    expect(areDuplicateEdges(edge(), edge({ id: 'e2' }))).toBe(true);
    expect(areDuplicateEdges(edge(), edge({ source: 'b', target: 'a' }))).toBe(false);
    expect(areDuplicateEdges(edge(), edge({ type: EdgeType.REFUTES }))).toBe(false);
  });
});

describe('findDuplicateEdges', () => {
  it('groups duplicates with the first occurrence', () => {
    const e1 = edge();
    const e2 = edge({ id: 'e2' });
    const e3 = edge({ id: 'e3', type: EdgeType.CITES });
    const e4 = edge({ id: 'e4' });
    expect(findDuplicateEdges([e1, e2, e3, e4])).toEqual([[e1, e2, e4]]);
  });

  it('returns no groups when every edge is distinct', () => {
    expect(findDuplicateEdges([edge(), edge({ id: 'e2', target: 'c' })])).toEqual([]);
  });
});

describe('validateEdgeMetadata', () => {
  it('treats missing metadata as valid and non-objects as invalid', () => {
    expect(validateEdgeMetadata(undefined)).toBe(true);
    expect(validateEdgeMetadata('text')).toBe(false);
  });

  it('requires optional fields to be strings', () => {
    expect(validateEdgeMetadata({ description: 'd', evidence: 'e', timestamp: 't' })).toBe(true);
    expect(validateEdgeMetadata({ description: 1 })).toBe(false);
    expect(validateEdgeMetadata({ evidence: 1 })).toBe(false);
    expect(validateEdgeMetadata({ timestamp: 1 })).toBe(false);
  });
});

describe('generateEdgeValidationReport', () => {
  it('reports a clean edge as valid with no messages', () => {
    expect(generateEdgeValidationReport(edge(), [node('a'), node('b')], [edge()])).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
  });

  it('lists every missing field', () => {
    expect(generateEdgeValidationReport({}).errors).toEqual([
      'Missing or invalid edge ID',
      'Missing edge source',
      'Missing edge target',
      'Missing or invalid edge type',
      'Missing or invalid edge strength',
      'Missing or invalid edge confidence'
    ]);
  });

  it.each([
    ['strength above 1', { strength: 1.5 }, 'Edge strength must be between 0 and 1'],
    ['negative strength', { strength: -0.1 }, 'Edge strength must be between 0 and 1'],
    ['confidence above 1', { confidence: 1.01 }, 'Edge confidence must be between 0 and 1'],
    ['negative confidence', { confidence: -2 }, 'Edge confidence must be between 0 and 1']
  ])('reports %s as a range error', (_, overrides, message) => {
    const report = generateEdgeValidationReport(edge(overrides));
    expect(report.isValid).toBe(false);
    expect(report.errors).toEqual([message]);
  });

  it('reports both range errors together', () => {
    expect(generateEdgeValidationReport(edge({ strength: 2, confidence: 3 })).errors).toEqual([
      'Edge strength must be between 0 and 1',
      'Edge confidence must be between 0 and 1'
    ]);
  });

  it('accepts the 0 and 1 bounds', () => {
    expect(generateEdgeValidationReport(edge({ strength: 1, confidence: 1 }))).toEqual({
      isValid: true,
      errors: [],
      warnings: []
    });
    expect(generateEdgeValidationReport(edge({ strength: 0, confidence: 0 })).isValid).toBe(true);
  });

  it('flags missing nodes and bad metadata as errors', () => {
    const report = generateEdgeValidationReport(
      { ...edge({ target: 'z' }), metadata: { description: 1 } },
      [node('a')]
    );
    expect(report.isValid).toBe(false);
    expect(report.errors).toEqual(['Edge connects to non-existent nodes', 'Invalid edge metadata structure']);
  });

  it('warns about self-loops, duplicates, low strength and low confidence', () => {
    const report = generateEdgeValidationReport(
      edge({ target: 'a', strength: 0.05, confidence: 0.2 }),
      undefined,
      [edge({ id: 'e2', target: 'a' })]
    );
    expect(report).toEqual({
      isValid: true,
      errors: [],
      warnings: [
        'Edge creates a self-loop',
        'Edge duplicates existing relationships',
        'Edge has very low strength',
        'Edge has low confidence score'
      ]
    });
  });
});
