import { useState } from 'react';
import { GraphNode } from '@/types/graph';

export interface NodeDraft {
  isEditing: boolean;
  editContent: string;
  setEditContent: (content: string) => void;
  startEditing: () => void;
  save: () => void;
  cancel: () => void;
}

// Switching to a different node discards any unsaved draft so it can never be saved onto the new node.
export const useNodeDraft = (
  node: GraphNode | null,
  onNodeUpdate: (nodeId: string, updates: Partial<GraphNode>) => void
): NodeDraft => {
  const nodeId = node?.id ?? null;
  const [draftNodeId, setDraftNodeId] = useState(nodeId);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node?.content || '');

  if (draftNodeId !== nodeId) {
    setDraftNodeId(nodeId);
    setIsEditing(false);
    setEditContent(node?.content || '');
  }

  const save = () => {
    if (!node) return;
    if (editContent.trim() !== node.content) {
      onNodeUpdate(node.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const cancel = () => {
    if (!node) return;
    setEditContent(node.content);
    setIsEditing(false);
  };

  return {
    isEditing,
    editContent,
    setEditContent,
    startEditing: () => setIsEditing(true),
    save,
    cancel
  };
};
