import { EdgeType } from '@/types/graph';

// Default edge colors by type
export const EDGE_COLORS = {
  [EdgeType.SUPPORTS]: '#4caf50',
  [EdgeType.REFUTES]: '#f44336',
  [EdgeType.REFERENCES]: '#2196f3',
  [EdgeType.CITES]: '#9c27b0',
  [EdgeType.MENTIONS]: '#757575',
  [EdgeType.AUTHORED_BY]: '#ff5722',
  [EdgeType.OCCURRED_AT]: '#795548',
  [EdgeType.RELATED_TO]: '#607d8b'
} as const;

// Human-readable labels for edge types
export const EDGE_TYPE_LABELS = {
  [EdgeType.SUPPORTS]: 'Supports',
  [EdgeType.REFUTES]: 'Refutes',
  [EdgeType.REFERENCES]: 'References',
  [EdgeType.CITES]: 'Cites',
  [EdgeType.MENTIONS]: 'Mentions',
  [EdgeType.AUTHORED_BY]: 'Authored By',
  [EdgeType.OCCURRED_AT]: 'Occurred At',
  [EdgeType.RELATED_TO]: 'Related To'
} as const;

// Edge type descriptions for tooltips and help text
export const EDGE_TYPE_DESCRIPTIONS = {
  [EdgeType.SUPPORTS]: 'Provides evidence that supports the target',
  [EdgeType.REFUTES]: 'Provides evidence that contradicts the target',
  [EdgeType.REFERENCES]: 'Makes reference to or mentions the target',
  [EdgeType.CITES]: 'Formally cites the target as a source',
  [EdgeType.MENTIONS]: 'Casually mentions or brings up the target',
  [EdgeType.AUTHORED_BY]: 'Was created or written by the target',
  [EdgeType.OCCURRED_AT]: 'Took place at the target location',
  [EdgeType.RELATED_TO]: 'Has some connection or relationship to the target'
} as const;

// Default strength values for different edge types
export const DEFAULT_EDGE_STRENGTH = {
  [EdgeType.SUPPORTS]: 0.8,
  [EdgeType.REFUTES]: 0.8,
  [EdgeType.REFERENCES]: 0.6,
  [EdgeType.CITES]: 0.7,
  [EdgeType.MENTIONS]: 0.4,
  [EdgeType.AUTHORED_BY]: 0.9,
  [EdgeType.OCCURRED_AT]: 0.7,
  [EdgeType.RELATED_TO]: 0.5
} as const;

// Default confidence levels for edge types
export const DEFAULT_EDGE_CONFIDENCE = {
  [EdgeType.SUPPORTS]: 0.7,
  [EdgeType.REFUTES]: 0.7,
  [EdgeType.REFERENCES]: 0.8,
  [EdgeType.CITES]: 0.9,
  [EdgeType.MENTIONS]: 0.6,
  [EdgeType.AUTHORED_BY]: 0.9,
  [EdgeType.OCCURRED_AT]: 0.8,
  [EdgeType.RELATED_TO]: 0.6
} as const;