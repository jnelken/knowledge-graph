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

// The draft is seeded once on mount; callers that switch nodes without a remount keep the old draft.
export const useNodeDraft = (
  node: GraphNode | null,
  onNodeUpdate: (nodeId: string, updates: Partial<GraphNode>) => void
): NodeDraft => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node?.content || '');

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
