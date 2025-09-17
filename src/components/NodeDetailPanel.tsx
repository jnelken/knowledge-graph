'use client';

import React, { useState } from 'react';
import { css } from '@emotion/css';
import { GraphNode, GraphEdge, NodeType, EdgeType } from '@/types/graph';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  relatedEdges: GraphEdge[];
  relatedNodes: GraphNode[];
  onNodeUpdate: (nodeId: string, updates: Partial<GraphNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onClose: () => void;
}

const panelStyles = css`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 4px;
    
    &:hover {
      color: #333;
    }
  }

  .panel-content {
    padding: 20px;
  }

  .section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .node-type-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    margin-bottom: 12px;
  }

  .content-area {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px;
    background: #f8f9fa;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    min-height: 60px;
    resize: vertical;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: #2196f3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
    }
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .metadata-item {
    font-size: 13px;
  }

  .metadata-label {
    font-weight: 500;
    color: #666;
    margin-bottom: 4px;
  }

  .metadata-value {
    color: #333;
    word-break: break-word;
  }

  .relationships-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .relationship-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 8px;
    font-size: 13px;
    background: white;
  }

  .relationship-type {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
    color: white;
    margin-right: 8px;
    min-width: 60px;
    text-align: center;
  }

  .relationship-target {
    flex: 1;
    color: #333;
  }

  .confidence-meter {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .confidence-bar {
    flex: 1;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, #f44336 0%, #ff9800 50%, #4caf50 100%);
    transition: width 0.3s ease;
  }

  .confidence-value {
    font-size: 12px;
    font-weight: 500;
    color: #666;
    min-width: 35px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    margin-top: 20px;
  }

  .button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    &.primary {
      background: #2196f3;
      color: white;
      border-color: #2196f3;

      &:hover {
        background: #1976d2;
      }
    }

    &.danger {
      background: #f44336;
      color: white;
      border-color: #f44336;

      &:hover {
        background: #d32f2f;
      }
    }
  }

  .edit-mode {
    .content-area {
      background: white;
      border-color: #2196f3;
    }
  }
`;

const getNodeTypeColor = (type: NodeType): string => {
  const colors = {
    [NodeType.STATEMENT]: '#2196f3',
    [NodeType.EVIDENCE]: '#4caf50',
    [NodeType.SOURCE]: '#ff9800',
    [NodeType.PERSON]: '#e91e63',
    [NodeType.INSTITUTION]: '#9c27b0',
    [NodeType.EVENT]: '#795548',
    [NodeType.DOCUMENT]: '#607d8b',
    [NodeType.LOCATION]: '#009688'
  };
  return colors[type] || '#757575';
};

const getEdgeTypeColor = (type: EdgeType): string => {
  const colors = {
    [EdgeType.SUPPORTS]: '#4caf50',
    [EdgeType.REFUTES]: '#f44336',
    [EdgeType.REFERENCES]: '#2196f3',
    [EdgeType.CITES]: '#9c27b0',
    [EdgeType.MENTIONS]: '#757575',
    [EdgeType.AUTHORED_BY]: '#ff5722',
    [EdgeType.OCCURRED_AT]: '#795548',
    [EdgeType.RELATED_TO]: '#607d8b'
  };
  return colors[type] || '#757575';
};

const formatNodeType = (type: NodeType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

const formatEdgeType = (type: EdgeType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  relatedEdges,
  relatedNodes,
  onNodeUpdate,
  onNodeDelete,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node?.content || '');

  if (!node) return null;

  const handleSave = () => {
    if (editContent.trim() !== node.content) {
      onNodeUpdate(node.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(node.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node and all its connections?')) {
      onNodeDelete(node.id);
      onClose();
    }
  };

  const nodeTypeColor = getNodeTypeColor(node.type);
  const confidence = node.metadata.credibility || 0.5;

  return (
    <div className={`${panelStyles} ${isEditing ? 'edit-mode' : ''}`}>
      <div className="panel-header">
        <h2 className="panel-title">Node Details</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        {/* Node Type */}
        <div className="section">
          <div 
            className="node-type-badge"
            style={{ backgroundColor: nodeTypeColor }}
          >
            {formatNodeType(node.type)}
          </div>
        </div>

        {/* Content */}
        <div className="section">
          <div className="section-title">Content</div>
          {isEditing ? (
            <textarea
              className="content-area"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              autoFocus
            />
          ) : (
            <div className="content-area">
              {node.content}
            </div>
          )}
        </div>

        {/* Confidence */}
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

        {/* Metadata */}
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

        {/* Relationships */}
        {relatedEdges.length > 0 && (
          <div className="section">
            <div className="section-title">
              Relationships ({relatedEdges.length})
            </div>
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          {isEditing ? (
            <>
              <button className="button primary" onClick={handleSave}>
                Save
              </button>
              <button className="button" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="button primary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="button danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};