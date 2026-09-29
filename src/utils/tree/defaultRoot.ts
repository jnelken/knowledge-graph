import { GraphNode, NodeType } from '@/types/graph';

export function findDefaultRootId(nodes: GraphNode[]): string | undefined {
  const main = nodes.find(n => n.metadata.isSourceDocument === 'true');
  if (main) return main.id;
  return nodes.find(n => n.type === NodeType.DOCUMENT)?.id;
}

export function getRootOptions(nodes: GraphNode[]): { value: string; label: string }[] {
  return nodes
    .filter(n => n.type === NodeType.DOCUMENT || n.type === NodeType.SOURCE)
    .map(n => ({ value: n.id, label: n.content }));
}
