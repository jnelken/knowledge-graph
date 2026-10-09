'use client';

import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useNodeDraft } from '@/hooks/useNodeDraft';
import { GraphNode, GraphEdge } from '@/types/graph';
import { NodeDetailHeader } from './nodeDetail/NodeDetailHeader';
import { NodeDetailsTab } from './nodeDetail/NodeDetailsTab';
import { NodeRelationshipsTab } from './nodeDetail/NodeRelationshipsTab';
import { panelStyles } from './nodeDetail/nodeDetailStyles';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  relatedEdges: GraphEdge[];
  relatedNodes: GraphNode[];
  onNodeUpdate: (nodeId: string, updates: Partial<GraphNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onClose: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  relatedEdges,
  relatedNodes,
  onNodeUpdate,
  onNodeDelete,
  onClose
}) => {
  const draft = useNodeDraft(node, onNodeUpdate);

  if (!node) return null;

  const deleteNode = () => {
    onNodeDelete(node.id);
    onClose();
  };

  const confirmAndDelete = () => {
    if (confirm('Are you sure you want to delete this node and all its connections?')) {
      deleteNode();
    }
  };

  return (
    <div className={`${panelStyles} ${draft.isEditing ? 'edit-mode' : ''}`}>
      <NodeDetailHeader draft={draft} onDelete={deleteNode} onClose={onClose} />
      
      <div className="panel-content">
        <Tabs.Root defaultValue="details">
          <Tabs.List className="tabs-list">
            <Tabs.Trigger className="tab-trigger" value="details">Details</Tabs.Trigger>
            <Tabs.Trigger className="tab-trigger" value="relationships">Relationships ({relatedEdges.length})</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="details">
            <NodeDetailsTab node={node} draft={draft} onDelete={confirmAndDelete} />
          </Tabs.Content>

          <Tabs.Content value="relationships">
            <NodeRelationshipsTab node={node} relatedEdges={relatedEdges} relatedNodes={relatedNodes} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};
