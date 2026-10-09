import { NodeType, EdgeType } from '@/types/graph';

export const getNodeTypeColor = (type: NodeType): string => {
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

export const getEdgeTypeColor = (type: EdgeType): string => {
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

export const formatNodeType = (type: NodeType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

export const formatEdgeType = (type: EdgeType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};
