import { GraphEdge, GraphNode, EdgeType } from '@/types/graph';
import { extractNodeId } from '@/utils/graph/edgeCalculations';

/**
 * Validate that an edge has all required properties
 */
export function validateEdge(edge: unknown): edge is GraphEdge {
  if (!edge || typeof edge !== 'object') {
    return false;
  }

  const edgeObj = edge as Record<string, unknown>;

  // Check required properties
  if (typeof edgeObj.id !== 'string' || edgeObj.id.length === 0) {
    return false;
  }

  if (!edgeObj.source) {
    return false;
  }

  if (!edgeObj.target) {
    return false;
  }

  if (!Object.values(EdgeType).includes(edgeObj.type as EdgeType)) {
    return false;
  }

  if (typeof edgeObj.strength !== 'number' || edgeObj.strength < 0 || edgeObj.strength > 1) {
    return false;
  }

  if (typeof edgeObj.confidence !== 'number' || edgeObj.confidence < 0 || edgeObj.confidence > 1) {
    return false;
  }

  return true;
}

/**
 * Validate that an edge connects to valid nodes
 */
export function validateEdgeConnections(edge: GraphEdge, nodes: GraphNode[]): boolean {
  const nodeIds = new Set(nodes.map(n => n.id));
  
  const sourceId = extractNodeId(edge.source);
  const targetId = extractNodeId(edge.target);
  
  return nodeIds.has(sourceId) && nodeIds.has(targetId);
}

/**
 * Validate that an edge ID is unique within a collection
 */
export function validateUniqueEdgeId(edgeId: string, existingEdges: GraphEdge[]): boolean {
  return !existingEdges.some(edge => edge.id === edgeId);
}

/**
 * Check if an edge creates a self-loop (connects a node to itself)
 */
export function isSelfLoop(edge: GraphEdge): boolean {
  const sourceId = extractNodeId(edge.source);
  const targetId = extractNodeId(edge.target);
  return sourceId === targetId;
}

/**
 * Check if two edges are duplicates (same source, target, and type)
 */
export function areDuplicateEdges(edge1: GraphEdge, edge2: GraphEdge): boolean {
  const source1 = extractNodeId(edge1.source);
  const target1 = extractNodeId(edge1.target);
  const source2 = extractNodeId(edge2.source);
  const target2 = extractNodeId(edge2.target);
  
  return (
    source1 === source2 &&
    target1 === target2 &&
    edge1.type === edge2.type
  );
}

/**
 * Find duplicate edges in a collection
 */
export function findDuplicateEdges(edges: GraphEdge[]): GraphEdge[][] {
  const duplicates: GraphEdge[][] = [];
  const seen = new Set<string>();
  
  for (const edge of edges) {
    const key = `${extractNodeId(edge.source)}-${extractNodeId(edge.target)}-${edge.type}`;
    
    if (seen.has(key)) {
      // Find the existing group or create a new one
      let group = duplicates.find(group => 
        group.some(e => areDuplicateEdges(e, edge))
      );
      
      if (!group) {
        const original = edges.find(e => 
          areDuplicateEdges(e, edge) && e !== edge
        );
        if (original) {
          group = [original];
          duplicates.push(group);
        }
      }
      
      if (group && !group.includes(edge)) {
        group.push(edge);
      }
    } else {
      seen.add(key);
    }
  }
  
  return duplicates;
}

/**
 * Validate edge metadata structure
 */
export function validateEdgeMetadata(metadata: unknown): boolean {
  if (!metadata) {
    return true; // Metadata is optional
  }
  
  if (typeof metadata !== 'object') {
    return false;
  }
  
  const metadataObj = metadata as Record<string, unknown>;
  
  // Check optional properties
  if (metadataObj.description !== undefined && typeof metadataObj.description !== 'string') {
    return false;
  }
  
  if (metadataObj.evidence !== undefined && typeof metadataObj.evidence !== 'string') {
    return false;
  }
  
  if (metadataObj.timestamp !== undefined && typeof metadataObj.timestamp !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Generate a validation report for an edge
 */
export interface EdgeValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function generateEdgeValidationReport(
  edge: unknown, 
  nodes?: GraphNode[], 
  existingEdges?: GraphEdge[]
): EdgeValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const edgeObj = edge as Record<string, unknown>;

  // Check basic structure
  if (!validateEdge(edge)) {
    if (!edgeObj?.id) errors.push('Missing or invalid edge ID');
    if (!edgeObj?.source) errors.push('Missing edge source');
    if (!edgeObj?.target) errors.push('Missing edge target');
    if (!edgeObj?.type || !Object.values(EdgeType).includes(edgeObj.type as EdgeType)) {
      errors.push('Missing or invalid edge type');
    }
    if (edgeObj?.strength === undefined || typeof edgeObj.strength !== 'number') {
      errors.push('Missing or invalid edge strength');
    }
    if (edgeObj?.confidence === undefined || typeof edgeObj.confidence !== 'number') {
      errors.push('Missing or invalid edge confidence');
    }
  }

  // Check connections if nodes provided
  if (nodes && validateEdge(edge) && !validateEdgeConnections(edge as GraphEdge, nodes)) {
    errors.push('Edge connects to non-existent nodes');
  }

  // Check for self-loops
  if (validateEdge(edge) && isSelfLoop(edge as GraphEdge)) {
    warnings.push('Edge creates a self-loop');
  }

  // Check for duplicates
  if (existingEdges && validateEdge(edge)) {
    const duplicates = existingEdges.filter(e => 
      e.id !== (edge as GraphEdge).id && areDuplicateEdges(e, edge as GraphEdge)
    );
    if (duplicates.length > 0) {
      warnings.push('Edge duplicates existing relationships');
    }
  }

  // Check metadata
  if (edgeObj?.metadata && !validateEdgeMetadata(edgeObj.metadata)) {
    errors.push('Invalid edge metadata structure');
  }

  // Generate warnings
  if (edgeObj?.strength !== undefined && typeof edgeObj.strength === 'number' && edgeObj.strength < 0.1) {
    warnings.push('Edge has very low strength');
  }

  if (edgeObj?.confidence !== undefined && typeof edgeObj.confidence === 'number' && edgeObj.confidence < 0.3) {
    warnings.push('Edge has low confidence score');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}