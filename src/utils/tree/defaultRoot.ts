import { GraphNode, NodeType } from '@/types/graph';

export function findDefaultRootId(nodes: GraphNode[]): string | undefined {
  const main = nodes.find(n => n.metadata.isSourceDocument === 'true');
  if (main) return main.id;
  return nodes.find(n => n.type === NodeType.DOCUMENT)?.id;
}

export function resolveTreeRootId(nodes: GraphNode[], chosenRootId: string | undefined): string | undefined {
  if (chosenRootId && nodes.some(n => n.id === chosenRootId)) return chosenRootId;
  return findDefaultRootId(nodes);
}

export function syncRootHistory(
  history: string[],
  rootId: string | undefined,
  nodes: GraphNode[]
): string[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  const next: string[] = [];
  for (const id of [...history, ...(rootId ? [rootId] : [])]) {
    if (nodeIds.has(id) && next[next.length - 1] !== id) next.push(id);
  }
  const unchanged = next.length === history.length && next.every((id, i) => id === history[i]);
  return unchanged ? history : next;
}

export function getRootOptions(nodes: GraphNode[]): { value: string; label: string }[] {
  return nodes
    .filter(n => n.type === NodeType.DOCUMENT || n.type === NodeType.SOURCE)
    .map(n => ({ value: n.id, label: n.content }));
}
