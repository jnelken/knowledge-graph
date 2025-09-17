import { 
  ParsedTranscript,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType
} from '@/types/graph';
import { DEFAULT_CONFIDENCE_BY_TYPE } from '@/constants/nodeTypes';
import { getDefaultEdgeStrength, getDefaultEdgeConfidence } from '@/utils/graph/edgeCalculations';

/**
 * Convert a parsed transcript into a knowledge graph
 */
export function transcriptToKnowledgeGraph(transcript: ParsedTranscript): KnowledgeGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, GraphNode>();

  // Create source document node with stable ID based on source URL
  const sourceId = transcript.source ? 
    `source-${transcript.source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}` : 
    'source-document';
  
  const sourceNode: GraphNode = {
    id: sourceId,
    type: NodeType.DOCUMENT,
    content: transcript.title,
    metadata: {
      source: transcript.source,
      originalText: transcript.title,
      category: 'transcript',
      isSourceDocument: 'true' // Flag to identify this as the main source
    }
  };
  nodes.push(sourceNode);
  nodeMap.set(sourceNode.id, sourceNode);

  // Create nodes for entities
  transcript.entities.forEach((entity, index) => {
    const entityId = `entity-${entity.type}-${index}`;
    const entityNode: GraphNode = {
      id: entityId,
      type: entity.type,
      content: entity.text,
      metadata: {
        originalText: entity.text,
        credibility: entity.confidence,
        category: entity.type
      }
    };
    nodes.push(entityNode);
    nodeMap.set(entityId, entityNode);

    // Create edge from source to entity
    edges.push(createEdge(
      `source-to-${entityId}`,
      sourceNode.id,
      entityId,
      EdgeType.MENTIONS,
      entity.confidence
    ));
  });

  // Create nodes for statements
  transcript.statements.forEach((statement, index) => {
    const statementId = `statement-${index}`;
    const statementNode: GraphNode = {
      id: statementId,
      type: NodeType.STATEMENT,
      content: statement.text,
      metadata: {
        originalText: statement.text,
        credibility: statement.confidence,
        category: statement.type,
        context: statement.context,
        timestamp: statement.timestamp
      }
    };
    nodes.push(statementNode);
    nodeMap.set(statementId, statementNode);

    // Create edge from source to statement
    edges.push(createEdge(
      `source-to-${statementId}`,
      sourceNode.id,
      statementId,
      EdgeType.REFERENCES,
      statement.confidence
    ));

    // Link statements to related entities
    linkStatementToEntities(statement, statementNode, transcript.entities, edges);
  });

  return {
    nodes,
    edges,
    metadata: {
      title: transcript.title,
      description: `Knowledge graph extracted from: ${transcript.title}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0',
      sourceDocument: transcript.source
    }
  };
}

/**
 * Create a standardized edge with default values
 */
function createEdge(
  id: string,
  sourceId: string,
  targetId: string,
  type: EdgeType,
  confidence?: number
): GraphEdge {
  return {
    id,
    source: sourceId,
    target: targetId,
    type,
    strength: getDefaultEdgeStrength(type),
    confidence: confidence || getDefaultEdgeConfidence(type)
  };
}

/**
 * Link statements to entities they mention
 */
function linkStatementToEntities(
  statement: { text: string; context: string; confidence: number },
  statementNode: GraphNode,
  entities: Array<{ text: string; mentions: Array<unknown>; confidence: number; type: string }>,
  edges: GraphEdge[]
): void {
  entities.forEach((entity, entityIndex) => {
    // Check if statement mentions this entity
    const mentionsEntity = entity.mentions.some(() => 
      statement.text.toLowerCase().includes(entity.text.toLowerCase()) ||
      statement.context.toLowerCase().includes(entity.text.toLowerCase())
    );

    if (mentionsEntity) {
      const entityId = `entity-${entity.type}-${entityIndex}`;
      const edgeId = `${statementNode.id}-to-${entityId}`;
      
      edges.push(createEdge(
        edgeId,
        statementNode.id,
        entityId,
        EdgeType.MENTIONS,
        Math.min(statement.confidence, entity.confidence)
      ));
    }
  });
}

/**
 * Create an empty knowledge graph with default metadata
 */
export function createEmptyKnowledgeGraph(title = 'New Knowledge Graph'): KnowledgeGraph {
  return {
    nodes: [],
    edges: [],
    metadata: {
      title,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

/**
 * Merge two knowledge graphs together
 */
export function mergeKnowledgeGraphs(graph1: KnowledgeGraph, graph2: KnowledgeGraph): KnowledgeGraph {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

  // Add nodes from both graphs, avoiding duplicates
  [...graph1.nodes, ...graph2.nodes].forEach(node => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    }
  });

  // Add edges from both graphs, avoiding duplicates
  [...graph1.edges, ...graph2.edges].forEach(edge => {
    if (!edgeMap.has(edge.id)) {
      edgeMap.set(edge.id, edge);
    }
  });

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
    metadata: {
      title: `${graph1.metadata.title} + ${graph2.metadata.title}`,
      description: `Merged graph from ${graph1.metadata.title} and ${graph2.metadata.title}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}