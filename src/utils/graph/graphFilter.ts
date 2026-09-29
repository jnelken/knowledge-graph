import { GraphEdge, GraphFilter, GraphNode, KnowledgeGraph } from '@/types/graph';
import { extractNodeId } from './edgeCalculations';

function matchesSearch(node: GraphNode, searchQuery: string): boolean {
  const query = searchQuery.toLowerCase();
  return node.content.toLowerCase().includes(query) ||
    Boolean(node.metadata.category?.toLowerCase().includes(query)) ||
    Boolean(node.metadata.source?.toLowerCase().includes(query));
}

function isNodeVisible(node: GraphNode, filter: GraphFilter): boolean {
  // Source documents ignore type/confidence/user-added filters, but still honor search
  if (node.metadata.isSourceDocument !== 'true') {
    if (!filter.nodeTypes.has(node.type)) return false;
    if ((node.metadata.credibility || 0) < filter.confidenceThreshold) return false;
    if (!filter.showUserAdded && node.userAdded) return false;
  }
  return !filter.searchQuery || matchesSearch(node, filter.searchQuery);
}

function isEdgeVisible(edge: GraphEdge, filter: GraphFilter, visibleNodeIds: Set<string>): boolean {
  if (!visibleNodeIds.has(extractNodeId(edge.source))) return false;
  if (!visibleNodeIds.has(extractNodeId(edge.target))) return false;
  if (!filter.edgeTypes.has(edge.type)) return false;
  if (edge.confidence < filter.confidenceThreshold) return false;
  if (!filter.showUserAdded && edge.userAdded) return false;
  return true;
}

export function filterGraph(
  graph: KnowledgeGraph,
  filter: GraphFilter
): { filteredNodes: GraphNode[]; filteredEdges: GraphEdge[] } {
  const filteredNodes = graph.nodes.filter(node => isNodeVisible(node, filter));
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graph.edges.filter(edge => isEdgeVisible(edge, filter, visibleNodeIds));
  return { filteredNodes, filteredEdges };
}
