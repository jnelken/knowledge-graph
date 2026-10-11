import { describe, expect, it } from 'vitest';
import {
  generateNodeValidationReport,
  isSourceDocument,
  validateNode,
  validateNodeContent,
  validateNodeMetadata,
  validateUniqueNodeId
} from '@/utils/validation/nodeValidation';
import { GraphNode, NodeType } from '@/types/graph';

const node = (overrides: Partial<GraphNode> = {}): GraphNode => ({
  id: 'n1',
  type: NodeType.STATEMENT,
  content: 'A meaningful statement',
  metadata: { source: 'https://example.com' },
  ...overrides
});

describe('validateNode', () => {
  it('accepts a well-formed node', () => {
    expect(validateNode(node())).toBe(true);
  });

  it.each([
    ['null', null],
    ['an empty id', node({ id: '' })],
    ['an unknown type', { ...node(), type: 'robot' }],
    ['empty content', node({ content: '' })],
    ['missing metadata', { ...node(), metadata: undefined }]
  ])('rejects %s', (_, value) => {
    expect(validateNode(value)).toBe(false);
  });
});

describe('node helpers', () => {
  it('validateUniqueNodeId checks existing IDs', () => {
    expect(validateUniqueNodeId('n1', [node()])).toBe(false);
    expect(validateUniqueNodeId('n2', [node()])).toBe(true);
  });

  it('isSourceDocument reads the string flag', () => {
    expect(isSourceDocument(node({ metadata: { isSourceDocument: 'true' } }))).toBe(true);
    expect(isSourceDocument(node({ metadata: { isSourceDocument: 'false' } }))).toBe(false);
  });
});

describe('validateNodeMetadata', () => {
  it('requires an object, unlike edge metadata', () => {
    expect(validateNodeMetadata(undefined)).toBe(false);
    expect(validateNodeMetadata({})).toBe(true);
  });

  it('checks credibility range and string fields', () => {
    expect(validateNodeMetadata({ credibility: 0, timestamp: 't', source: 's', category: 'c' })).toBe(true);
    expect(validateNodeMetadata({ credibility: 1.1 })).toBe(false);
    expect(validateNodeMetadata({ credibility: '0.5' })).toBe(false);
    expect(validateNodeMetadata({ timestamp: 1 })).toBe(false);
    expect(validateNodeMetadata({ source: 1 })).toBe(false);
    expect(validateNodeMetadata({ category: 1 })).toBe(false);
  });
});

describe('validateNodeContent', () => {
  it('requires 3 to 5000 characters, trimmed for the minimum', () => {
    expect(validateNodeContent('abc')).toBe(true);
    expect(validateNodeContent('   ')).toBe(false);
    expect(validateNodeContent(' ab ')).toBe(false);
    expect(validateNodeContent('a'.repeat(5000))).toBe(true);
    expect(validateNodeContent('a'.repeat(5001))).toBe(false);
  });
});

describe('generateNodeValidationReport', () => {
  it('reports a clean node as valid with no messages', () => {
    expect(generateNodeValidationReport(node())).toEqual({ isValid: true, errors: [], warnings: [] });
  });

  it('lists every missing field', () => {
    expect(generateNodeValidationReport({}).errors).toEqual([
      'Missing or invalid node ID',
      'Missing or invalid node type',
      'Missing or invalid node content',
      'Missing node metadata'
    ]);
  });

  it('flags bad metadata and too-short content, and warns that short content is short', () => {
    expect(generateNodeValidationReport(node({ content: 'ab', metadata: { credibility: 2, source: 's' } }))).toEqual({
      isValid: false,
      errors: ['Invalid node metadata structure', 'Invalid node content'],
      warnings: ['Node content is very short']
    });
  });

  it('warns about low credibility and missing source attribution', () => {
    expect(generateNodeValidationReport(node({ metadata: { credibility: 0.1 } })).warnings).toEqual([
      'Node has low credibility score',
      'Node has no source attribution'
    ]);
  });

  it('does not ask a source document for attribution', () => {
    const report = generateNodeValidationReport(node({ metadata: { isSourceDocument: 'true' } }));
    expect(report.warnings).toEqual([]);
  });
});
