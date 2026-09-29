import { describe, expect, it } from 'vitest';
import { findDefaultRootId, getRootOptions, resolveTreeRootId } from '@/utils/tree/defaultRoot';
import { GraphNode, NodeType } from '@/types/graph';

const node = (id: string, type: NodeType, metadata: GraphNode['metadata'] = {}): GraphNode => ({
  id,
  type,
  content: `${id} content`,
  metadata
});

describe('findDefaultRootId', () => {
  it('prefers the main source document', () => {
    const nodes = [
      node('doc', NodeType.DOCUMENT),
      node('main', NodeType.STATEMENT, { isSourceDocument: 'true' })
    ];
    expect(findDefaultRootId(nodes)).toBe('main');
  });

  it('falls back to the first document', () => {
    const nodes = [node('s', NodeType.STATEMENT), node('doc', NodeType.DOCUMENT)];
    expect(findDefaultRootId(nodes)).toBe('doc');
  });

  it('returns undefined when there is no candidate', () => {
    expect(findDefaultRootId([node('s', NodeType.STATEMENT)])).toBeUndefined();
  });
});

describe('resolveTreeRootId', () => {
  const nodes = [node('doc', NodeType.DOCUMENT), node('src', NodeType.SOURCE)];

  it('keeps a chosen root that still exists', () => {
    expect(resolveTreeRootId(nodes, 'src')).toBe('src');
  });

  it('falls back to the default when nothing is chosen', () => {
    expect(resolveTreeRootId(nodes, undefined)).toBe('doc');
  });

  it('falls back to the default when the chosen root left the graph', () => {
    expect(resolveTreeRootId(nodes, 'deleted')).toBe('doc');
  });

  it('returns undefined for an empty graph', () => {
    expect(resolveTreeRootId([], 'deleted')).toBeUndefined();
  });
});

describe('getRootOptions', () => {
  it('lists documents and sources as select options', () => {
    const nodes = [
      node('doc', NodeType.DOCUMENT),
      node('src', NodeType.SOURCE),
      node('s', NodeType.STATEMENT)
    ];
    expect(getRootOptions(nodes)).toEqual([
      { value: 'doc', label: 'doc content' },
      { value: 'src', label: 'src content' }
    ]);
  });
});
