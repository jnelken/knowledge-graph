export interface GraphNode {
  id: string;
  type: NodeType;
  content: string;
  metadata: NodeMetadata;
  position?: { x: number; y: number };
  userAdded?: boolean;
  // D3 simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: EdgeType;
  strength: number; // 0-1 scale for relationship strength
  confidence: number; // 0-1 scale for confidence in relationship
  userAdded?: boolean;
  metadata?: {
    description?: string;
    evidence?: string;
    timestamp?: string;
  };
}

export interface NodeMetadata {
  timestamp?: string;
  source?: string;
  credibility?: number; // 0-1 scale
  category?: string;
  pageReference?: string;
  context?: string;
  originalText?: string;
  isSourceDocument?: string; // Flag to identify main source documents
}

export enum NodeType {
  STATEMENT = 'statement',
  EVIDENCE = 'evidence',
  SOURCE = 'source',
  PERSON = 'person',
  INSTITUTION = 'institution',
  EVENT = 'event',
  DOCUMENT = 'document',
  LOCATION = 'location'
}

export enum EdgeType {
  SUPPORTS = 'supports',
  REFUTES = 'refutes',
  REFERENCES = 'references',
  CITES = 'cites',
  MENTIONS = 'mentions',
  AUTHORED_BY = 'authored_by',
  OCCURRED_AT = 'occurred_at',
  RELATED_TO = 'related_to'
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    title: string;
    description?: string;
    created: string;
    modified: string;
    version: string;
    sourceDocument?: string;
  };
}

export interface GraphState {
  graph: KnowledgeGraph;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  filter: GraphFilter;
  layout: LayoutSettings;
}

export interface GraphFilter {
  nodeTypes: Set<NodeType>;
  edgeTypes: Set<EdgeType>;
  searchQuery: string;
  confidenceThreshold: number;
  showUserAdded: boolean;
}

export interface LayoutSettings {
  strength: number;
  distance: number;
  charge: number;
  centerForce: number;
  collisionRadius: number;
}

export interface ParsedTranscript {
  title: string;
  source: string;
  content: string;
  statements: ExtractedStatement[];
  entities: ExtractedEntity[];
}

export interface ExtractedStatement {
  text: string;
  speaker?: string;
  timestamp?: string;
  context: string;
  confidence: number;
  type: 'claim' | 'fact' | 'opinion' | 'question';
}

export interface ExtractedEntity {
  text: string;
  type: NodeType;
  mentions: EntityMention[];
  confidence: number;
}

export interface EntityMention {
  context: string;
  position: number;
  length: number;
  timestamp?: string;
}