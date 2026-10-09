'use client';

import React from 'react';
import { GraphEdge, GraphNode } from '@/types/graph';
import { formatEdgeType, getEdgeTypeColor } from './nodeDetailFormat';

interface NodeRelationshipsTabProps {
  node: GraphNode;
  relatedEdges: GraphEdge[];
  relatedNodes: GraphNode[];
}

export const NodeRelationshipsTab: React.FC<NodeRelationshipsTabProps> = ({ node, relatedEdges, relatedNodes }) => {
  if (relatedEdges.length === 0) {
    return <div className="metadata-item">No relationships.</div>;
  }

  return (
    <div className="relationships-list">
      {relatedEdges.map((edge) => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        const targetNodeId = sourceId === node.id ? targetId : sourceId;
        const targetNode = relatedNodes.find(n => n.id === targetNodeId);
        const isOutgoing = sourceId === node.id;

        return (
          <div key={edge.id} className="relationship-item">
            <div 
              className="relationship-type"
              style={{ backgroundColor: getEdgeTypeColor(edge.type) }}
            >
              {isOutgoing ? '' : '← '}{formatEdgeType(edge.type)}{isOutgoing ? ' →' : ''}
            </div>
            <div className="relationship-target">
              {targetNode ? targetNode.content : 'Unknown node'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
