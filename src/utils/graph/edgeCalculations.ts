import { GraphEdge, GraphNode, EdgeType } from '@/types/graph';
import { EDGE_COLORS, DEFAULT_EDGE_STRENGTH, DEFAULT_EDGE_CONFIDENCE } from '@/constants/edgeTypes';

/**
 * Get the color for an edge based on its type
 */
export function getEdgeColor(edgeType: EdgeType): string {
  return EDGE_COLORS[edgeType] || EDGE_COLORS[EdgeType.RELATED_TO];
}

/**
 * Calculate the stroke width for an edge based on its strength
 */
export function calculateEdgeStrokeWidth(edge: GraphEdge): number {
  return Math.max(1, edge.strength * 3);
}

/**
 * Get the default strength for an edge type
 */
export function getDefaultEdgeStrength(edgeType: EdgeType): number {
  return DEFAULT_EDGE_STRENGTH[edgeType] || DEFAULT_EDGE_STRENGTH[EdgeType.RELATED_TO];
}

/**
 * Get the default confidence for an edge type
 */
export function getDefaultEdgeConfidence(edgeType: EdgeType): number {
  return DEFAULT_EDGE_CONFIDENCE[edgeType] || DEFAULT_EDGE_CONFIDENCE[EdgeType.RELATED_TO];
}

/**
 * Extract the node ID from an edge source or target (handles both string and node object)
 */
export function extractNodeId(sourceOrTarget: string | GraphNode): string {
  return typeof sourceOrTarget === 'string' ? sourceOrTarget : sourceOrTarget.id;
}

/**
 * Check if an edge connects to a specific node
 */
export function edgeConnectsToNode(edge: GraphEdge, nodeId: string): boolean {
  const sourceId = extractNodeId(edge.source);
  const targetId = extractNodeId(edge.target);
  return sourceId === nodeId || targetId === nodeId;
}

/**
 * Get the other node ID from an edge (given one node ID)
 */
export function getOtherNodeId(edge: GraphEdge, knownNodeId: string): string {
  const sourceId = extractNodeId(edge.source);
  const targetId = extractNodeId(edge.target);
  return sourceId === knownNodeId ? targetId : sourceId;
}

/**
 * Check if an edge is outgoing from a specific node
 */
export function isOutgoingEdge(edge: GraphEdge, nodeId: string): boolean {
  const sourceId = extractNodeId(edge.source);
  return sourceId === nodeId;
}

/**
 * Format edge type for display (capitalize and replace underscores)
 */
export function formatEdgeType(edgeType: EdgeType): string {
  return edgeType.charAt(0).toUpperCase() + edgeType.slice(1).replace('_', ' ');
}

/**
 * Create an arrow marker ID for an edge type
 */
export function getArrowMarkerId(edgeType: EdgeType): string {
  return `arrow-${edgeType}`;
}