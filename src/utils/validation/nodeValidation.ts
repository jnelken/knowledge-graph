import { GraphNode, NodeType } from '@/types/graph';

/**
 * Validate that a node has all required properties
 */
export function validateNode(node: unknown): node is GraphNode {
  if (!node || typeof node !== 'object') {
    return false;
  }

  const nodeObj = node as Record<string, unknown>;

  // Check required properties
  if (typeof nodeObj.id !== 'string' || nodeObj.id.length === 0) {
    return false;
  }

  if (!Object.values(NodeType).includes(nodeObj.type as NodeType)) {
    return false;
  }

  if (typeof nodeObj.content !== 'string' || nodeObj.content.length === 0) {
    return false;
  }

  if (!nodeObj.metadata || typeof nodeObj.metadata !== 'object') {
    return false;
  }

  return true;
}

/**
 * Validate that a node ID is unique within a collection
 */
export function validateUniqueNodeId(nodeId: string, existingNodes: GraphNode[]): boolean {
  return !existingNodes.some(node => node.id === nodeId);
}

/**
 * Validate node metadata structure
 */
export function validateNodeMetadata(metadata: unknown): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  const metadataObj = metadata as Record<string, unknown>;

  // Optional properties validation
  if (metadataObj.credibility !== undefined) {
    if (typeof metadataObj.credibility !== 'number' || 
        metadataObj.credibility < 0 || 
        metadataObj.credibility > 1) {
      return false;
    }
  }

  if (metadataObj.timestamp !== undefined && typeof metadataObj.timestamp !== 'string') {
    return false;
  }

  if (metadataObj.source !== undefined && typeof metadataObj.source !== 'string') {
    return false;
  }

  if (metadataObj.category !== undefined && typeof metadataObj.category !== 'string') {
    return false;
  }

  return true;
}

/**
 * Validate that node content meets minimum requirements
 */
export function validateNodeContent(content: string): boolean {
  if (typeof content !== 'string') {
    return false;
  }

  // Content should not be empty after trimming
  if (content.trim().length === 0) {
    return false;
  }

  // Content should not be too short (likely not meaningful)
  if (content.trim().length < 3) {
    return false;
  }

  // Content should not be excessively long (might need splitting)
  if (content.length > 5000) {
    return false;
  }

  return true;
}

/**
 * Check if a node is a source document
 */
export function isSourceDocument(node: GraphNode): boolean {
  return node.metadata.isSourceDocument === 'true';
}

/**
 * Generate a validation report for a node
 */
export interface NodeValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function generateNodeValidationReport(node: unknown): NodeValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeObj = node as Record<string, unknown>;

  // Check basic structure
  if (!validateNode(node)) {
    if (!nodeObj?.id) errors.push('Missing or invalid node ID');
    if (!nodeObj?.type || !Object.values(NodeType).includes(nodeObj.type as NodeType)) {
      errors.push('Missing or invalid node type');
    }
    if (!nodeObj?.content) errors.push('Missing or invalid node content');
    if (!nodeObj?.metadata) errors.push('Missing node metadata');
  }

  // Check metadata
  if (nodeObj?.metadata && !validateNodeMetadata(nodeObj.metadata)) {
    errors.push('Invalid node metadata structure');
  }

  // Check content quality
  if (nodeObj?.content && typeof nodeObj.content === 'string' && !validateNodeContent(nodeObj.content)) {
    errors.push('Invalid node content');
  }

  // Generate warnings
  if (nodeObj?.content && typeof nodeObj.content === 'string' && nodeObj.content.length < 10) {
    warnings.push('Node content is very short');
  }

  const metadata = nodeObj?.metadata as Record<string, unknown>;
  if (metadata?.credibility !== undefined && typeof metadata.credibility === 'number' && metadata.credibility < 0.3) {
    warnings.push('Node has low credibility score');
  }

  if (!metadata?.source && validateNode(node) && !isSourceDocument(node as GraphNode)) {
    warnings.push('Node has no source attribution');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}