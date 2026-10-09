'use client';

import React from 'react';
import { UISeparator } from '@/components/ui/Separator';
import { NodeDraft } from '@/hooks/useNodeDraft';
import { GraphNode } from '@/types/graph';
import { formatNodeType, getNodeTypeColor } from './nodeDetailFormat';

interface NodeDetailsTabProps {
  node: GraphNode;
  draft: NodeDraft;
  onDelete: () => void;
}

export const NodeDetailsTab: React.FC<NodeDetailsTabProps> = ({ node, draft, onDelete }) => {
  const nodeTypeColor = getNodeTypeColor(node.type);
  const confidence = node.metadata.credibility || 0.5;

  return (
    <>
      {/* Node Type */}
      <div className="section">
        <div 
          className="node-type-badge"
          style={{ backgroundColor: nodeTypeColor }}
        >
          {formatNodeType(node.type)}
        </div>
      </div>

      <UISeparator />

      {/* Content */}
      <div className="section">
        <div className="section-title">Content</div>
        {draft.isEditing ? (
          <textarea
            className="content-area"
            value={draft.editContent}
            onChange={(e) => draft.setEditContent(e.target.value)}
            rows={4}
            autoFocus
          />
        ) : (
          <div className="content-area">
            {node.content}
          </div>
        )}
      </div>

      {confidence > 0 && (
        <div className="section">
          <div className="section-title">Confidence</div>
          <div className="confidence-meter">
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <div className="confidence-value">
              {Math.round(confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-title">Metadata</div>
        <div className="metadata-grid">
          {node.metadata.source && (
            <div className="metadata-item">
              <div className="metadata-label">Source</div>
              <div className="metadata-value">{node.metadata.source}</div>
            </div>
          )}
          {node.metadata.category && (
            <div className="metadata-item">
              <div className="metadata-label">Category</div>
              <div className="metadata-value">{node.metadata.category}</div>
            </div>
          )}
          {node.metadata.timestamp && (
            <div className="metadata-item">
              <div className="metadata-label">Timestamp</div>
              <div className="metadata-value">{node.metadata.timestamp}</div>
            </div>
          )}
          {node.userAdded && (
            <div className="metadata-item">
              <div className="metadata-label">User Added</div>
              <div className="metadata-value">Yes</div>
            </div>
          )}
        </div>
        {node.metadata.context && (
          <div className="metadata-item" style={{ marginTop: '12px' }}>
            <div className="metadata-label">Context</div>
            <div className="metadata-value">{node.metadata.context}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="action-buttons">
        {draft.isEditing ? (
          <>
            <button className="button primary" onClick={draft.save}>Save</button>
            <button className="button" onClick={draft.cancel}>Cancel</button>
          </>
        ) : (
          <>
            <button className="button primary" onClick={draft.startEditing}>Edit</button>
            <button className="button danger" onClick={onDelete}>Delete</button>
          </>
        )}
      </div>
    </>
  );
};
