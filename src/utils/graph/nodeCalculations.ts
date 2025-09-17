import { GraphNode, NodeType } from '@/types/graph';
import { NODE_SIZES, VISUAL_CONSTANTS } from '@/constants/graphDefaults';

/**
 * Calculate the visual radius for a node based on its type and properties
 */
export function calculateNodeRadius(node: GraphNode): number {
  const baseSize = NODE_SIZES[node.type] || NODE_SIZES[NodeType.STATEMENT];
  
  // Make source documents larger and more prominent
  if (node.metadata.isSourceDocument === 'true') {
    return baseSize + VISUAL_CONSTANTS.SOURCE_DOCUMENT_SIZE_BONUS;
  }
  
  return baseSize;
}

/**
 * Calculate the stroke width for a node based on its selection state and type
 */
export function calculateNodeStrokeWidth(node: GraphNode, isSelected: boolean): number {
  if (isSelected) {
    return VISUAL_CONSTANTS.SELECTED_STROKE_WIDTH;
  }
  
  if (node.metadata.isSourceDocument === 'true') {
    return VISUAL_CONSTANTS.SOURCE_DOCUMENT_STROKE_WIDTH;
  }
  
  return VISUAL_CONSTANTS.NORMAL_STROKE_WIDTH;
}

/**
 * Calculate the stroke color for a node based on its selection state and type
 */
export function calculateNodeStrokeColor(node: GraphNode, isSelected: boolean): string {
  if (isSelected) {
    return VISUAL_CONSTANTS.SELECTED_STROKE_COLOR;
  }
  
  if (node.metadata.isSourceDocument === 'true') {
    return VISUAL_CONSTANTS.SOURCE_DOCUMENT_STROKE_COLOR;
  }
  
  return VISUAL_CONSTANTS.NORMAL_STROKE_COLOR;
}

/**
 * Calculate the collision radius for force simulation
 */
export function calculateCollisionRadius(node: GraphNode, layoutCollisionRadius: number): number {
  return calculateNodeRadius(node) + layoutCollisionRadius;
}

/**
 * Calculate the label position offset based on node size
 */
export function calculateLabelOffset(node: GraphNode): number {
  return calculateNodeRadius(node) + VISUAL_CONSTANTS.LABEL_OFFSET;
}

/**
 * Truncate text for node labels to prevent visual clutter
 */
export function truncateNodeLabel(text: string, maxLength: number = VISUAL_CONSTANTS.MAX_LABEL_LENGTH): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Check if a node is a source document
 */
export function isSourceDocument(node: GraphNode): boolean {
  return node.metadata.isSourceDocument === 'true';
}