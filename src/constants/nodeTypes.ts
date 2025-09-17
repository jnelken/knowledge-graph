import { NodeType } from '@/types/graph';

// Human-readable labels for node types
export const NODE_TYPE_LABELS = {
  [NodeType.STATEMENT]: 'Statements',
  [NodeType.EVIDENCE]: 'Evidence',
  [NodeType.SOURCE]: 'Sources',
  [NodeType.PERSON]: 'People',
  [NodeType.INSTITUTION]: 'Institutions',
  [NodeType.EVENT]: 'Events',
  [NodeType.DOCUMENT]: 'Documents',
  [NodeType.LOCATION]: 'Locations'
} as const;

// Node type descriptions for tooltips and help text
export const NODE_TYPE_DESCRIPTIONS = {
  [NodeType.STATEMENT]: 'Claims, assertions, or opinions from the transcript',
  [NodeType.EVIDENCE]: 'Supporting or refuting evidence for statements',
  [NodeType.SOURCE]: 'Original sources of information',
  [NodeType.PERSON]: 'People mentioned in the content',
  [NodeType.INSTITUTION]: 'Organizations, companies, or institutions',
  [NodeType.EVENT]: 'Events, incidents, or occurrences',
  [NodeType.DOCUMENT]: 'Documents, reports, or written materials',
  [NodeType.LOCATION]: 'Geographic locations or places'
} as const;

// Default confidence levels by node type
export const DEFAULT_CONFIDENCE_BY_TYPE = {
  [NodeType.STATEMENT]: 0.7,
  [NodeType.EVIDENCE]: 0.8,
  [NodeType.SOURCE]: 0.9,
  [NodeType.PERSON]: 0.8,
  [NodeType.INSTITUTION]: 0.8,
  [NodeType.EVENT]: 0.7,
  [NodeType.DOCUMENT]: 0.9,
  [NodeType.LOCATION]: 0.8
} as const;