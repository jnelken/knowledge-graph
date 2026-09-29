import { describe, expect, it } from 'vitest';
import { getGraphFileKind, pickGraphFile } from '@/utils/data/graphFiles';

const file = (name: string, type = '') => ({ name, type });

describe('getGraphFileKind', () => {
  it('classifies transcripts by extension or MIME type', () => {
    expect(getGraphFileKind(file('talk.txt'))).toBe('transcript');
    expect(getGraphFileKind(file('talk', 'text/plain'))).toBe('transcript');
  });

  it('classifies graph exports by extension or MIME type', () => {
    expect(getGraphFileKind(file('graph.json'))).toBe('graph');
    expect(getGraphFileKind(file('graph', 'application/json'))).toBe('graph');
  });

  it('trusts the extension over a conflicting MIME type', () => {
    expect(getGraphFileKind(file('graph.json', 'text/plain'))).toBe('graph');
    expect(getGraphFileKind(file('TALK.TXT', 'application/json'))).toBe('transcript');
  });

  it('returns null for unsupported files', () => {
    expect(getGraphFileKind(file('image.png', 'image/png'))).toBeNull();
  });
});

describe('pickGraphFile', () => {
  it('prefers a transcript over a graph file regardless of order', () => {
    const transcript = file('talk.txt');
    expect(pickGraphFile([file('graph.json'), transcript])).toBe(transcript);
  });

  it('falls back to a graph file', () => {
    const graph = file('graph.json');
    expect(pickGraphFile([file('image.png'), graph])).toBe(graph);
  });

  it('returns undefined when nothing is supported', () => {
    expect(pickGraphFile([file('image.png')])).toBeUndefined();
  });
});
