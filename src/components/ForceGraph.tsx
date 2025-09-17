'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { css } from '@emotion/css';
import { GraphNode, GraphEdge, NodeType, EdgeType, LayoutSettings } from '@/types/graph';
import { NODE_COLORS } from '@/constants/graphDefaults';
import { 
  calculateNodeRadius,
  calculateNodeStrokeColor,
  calculateNodeStrokeWidth,
  calculateLabelOffset,
  truncateNodeLabel 
} from '@/utils/graph/nodeCalculations';
import { getEdgeColor, calculateEdgeStrokeWidth, getArrowMarkerId } from '@/utils/graph/edgeCalculations';

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  layoutSettings: LayoutSettings;
  selectedNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onBackgroundClick?: () => void;
}

const containerStyles = css`
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;

  svg {
    display: block;
  }

  .node {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .node:hover {
    stroke-width: 3px;
  }

  .node.selected {
    stroke: #ff6b35;
    stroke-width: 3px;
  }

  .edge {
    pointer-events: none;
    opacity: 0.6;
  }

  .edge.supports {
    stroke: #4caf50;
  }

  .edge.refutes {
    stroke: #f44336;
  }

  .edge.references {
    stroke: #2196f3;
  }

  .edge.cites {
    stroke: #9c27b0;
  }

  .edge.default {
    stroke: #757575;
  }

  .node-label {
    pointer-events: none;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-anchor: middle;
    dominant-baseline: central;
    fill: #333;
  }
`;

const getNodeColor = (type: NodeType): string => {
  return NODE_COLORS[type] || NODE_COLORS[NodeType.STATEMENT];
};

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  width,
  height,
  layoutSettings,
  selectedNodeId,
  onNodeClick,
  onNodeHover,
  onBackgroundClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  const initializeSimulation = useCallback(() => {
    if (!svgRef.current) return;

    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Background for zoom/pan
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', (event) => {
        if (event.target === event.currentTarget) {
          onBackgroundClick?.();
        }
      });

    const container = svg.append('g');

    // Create arrow markers for directed edges
    const defs = svg.append('defs');
    
    Object.values(EdgeType).forEach(edgeType => {
      defs.append('marker')
        .attr('id', getArrowMarkerId(edgeType))
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('stroke', getEdgeColor(edgeType))
        .attr('fill', getEdgeColor(edgeType));
    });

    // Create edge elements
    const linkElements = container.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', (d) => `edge ${d.type}`)
      .attr('stroke', (d) => getEdgeColor(d.type))
      .attr('stroke-width', (d) => calculateEdgeStrokeWidth(d))
      .attr('marker-end', (d) => `url(#${getArrowMarkerId(d.type)})`);

    // Create node elements
    const nodeElements = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', (d) => calculateNodeRadius(d))
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', (d) => calculateNodeStrokeColor(d, d.id === selectedNodeId))
      .attr('stroke-width', (d) => calculateNodeStrokeWidth(d, d.id === selectedNodeId))
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d.id);
      })
      .on('mouseenter', (event, d) => {
        onNodeHover?.(d.id);
      })
      .on('mouseleave', () => {
        onNodeHover?.(null);
      });

    // Create label elements
    const labelElements = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .text((d) => truncateNodeLabel(d.content))
      .attr('dy', (d) => calculateLabelOffset(d));

    // Update selected node styling
    nodeElements.classed('selected', (d) => d.id === selectedNodeId);

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
        .id((d) => d.id)
        .distance(layoutSettings.distance)
        .strength(layoutSettings.strength))
      .force('charge', d3.forceManyBody().strength(layoutSettings.charge))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(layoutSettings.centerForce))
      .force('collision', d3.forceCollide().radius((d) => calculateNodeRadius(d as GraphNode) + layoutSettings.collisionRadius));

    simulationRef.current = simulation;

    // Add drag behavior
    const drag = d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      nodeElements
        .attr('cx', (d) => d.x!)
        .attr('cy', (d) => d.y!);

      labelElements
        .attr('x', (d) => d.x!)
        .attr('y', (d) => d.y!);
    });

  }, [nodes, edges, width, height, layoutSettings, selectedNodeId, onNodeClick, onNodeHover, onBackgroundClick]);

  useEffect(() => {
    initializeSimulation();
    
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [initializeSimulation]);

  // Update selected node when selectedNodeId changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('.node')
      .classed('selected', function(d: unknown) {
        return (d as GraphNode).id === selectedNodeId;
      });
  }, [selectedNodeId]);

  return (
    <div className={containerStyles}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
      />
    </div>
  );
};