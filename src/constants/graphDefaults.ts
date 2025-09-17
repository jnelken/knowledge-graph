import { NodeType, LayoutSettings } from '@/types/graph';

// Default node sizes by type
export const NODE_SIZES = {
  [NodeType.STATEMENT]: 12,
  [NodeType.EVIDENCE]: 10,
  [NodeType.SOURCE]: 14,
  [NodeType.PERSON]: 11,
  [NodeType.INSTITUTION]: 13,
  [NodeType.EVENT]: 9,
  [NodeType.DOCUMENT]: 10,
  [NodeType.LOCATION]: 8
} as const;

// Default node colors by type
export const NODE_COLORS = {
  [NodeType.STATEMENT]: '#2196f3',
  [NodeType.EVIDENCE]: '#4caf50',
  [NodeType.SOURCE]: '#ff9800',
  [NodeType.PERSON]: '#e91e63',
  [NodeType.INSTITUTION]: '#9c27b0',
  [NodeType.EVENT]: '#795548',
  [NodeType.DOCUMENT]: '#607d8b',
  [NodeType.LOCATION]: '#009688'
} as const;

// Default edge colors by type
export const EDGE_COLORS = {
  supports: '#4caf50',
  refutes: '#f44336',
  references: '#2196f3',
  cites: '#9c27b0',
  mentions: '#757575',
  authored_by: '#ff5722',
  occurred_at: '#795548',
  related_to: '#607d8b'
} as const;

// Default layout settings for force simulation
export const DEFAULT_LAYOUT: LayoutSettings = {
  strength: 0.1,
  distance: 100,
  charge: -300,
  centerForce: 0.1,
  collisionRadius: 20
};

// Visual constants
export const VISUAL_CONSTANTS = {
  SOURCE_DOCUMENT_SIZE_BONUS: 6,
  SOURCE_DOCUMENT_STROKE_COLOR: '#ff6b35',
  SOURCE_DOCUMENT_STROKE_WIDTH: 3,
  NORMAL_STROKE_WIDTH: 2,
  NORMAL_STROKE_COLOR: '#fff',
  SELECTED_STROKE_COLOR: '#ff6b35',
  SELECTED_STROKE_WIDTH: 3,
  LABEL_OFFSET: 15,
  MAX_LABEL_LENGTH: 30,
  ARROW_MARKER_SIZE: 6
} as const;