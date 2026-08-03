'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { css } from '@emotion/css';
import { EdgeType, KnowledgeGraph, NodeType } from '@/types/graph';
import { NODE_COLORS } from '@/constants/graphDefaults';
import { buildTreeFromGraph, TreeDatum } from '@/utils/tree/buildTree';

interface TreeGraphProps {
  graph: KnowledgeGraph;
  rootId: string;
  width: number;
  height: number;
  selectedNodeId?: string;
  onNodeClick?: (nodeId: string) => void;
  onNavigateToRoot?: (nodeId: string) => void; // when clicking an evidence source
}

const styles = css`
  position: relative;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;

  svg { display: block; }

  .node-box { cursor: pointer; }
  .node-box rect { fill: white; stroke: #ddd; rx: 6px; }
  .node-box.root rect { stroke: #999; }
  .node-box.quote rect { stroke: #bbb; }
  .node-box.evidence rect { stroke: #bbb; }
  .node-box.selected rect { stroke: #ff6b35; stroke-width: 2px; }

  .label { font-size: 12px; fill: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .sub { font-size: 11px; fill: #666; }

  .link { fill: none; stroke: #c8c8c8; stroke-width: 1.2px; }
  .link.supports { stroke: #4caf50; }
  .link.refutes { stroke: #f44336; }
`;

// Orthogonal elbow path: parent -> midX -> child
function elbowPath(s: { x: number; y: number }, t: { x: number; y: number }) {
  const mx = (s.x + t.x) / 2;
  return `M ${s.x},${s.y} H ${mx} V ${t.y} H ${t.x}`;
}

function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

// d3 hierarchy point node augmented with left-to-right layout coordinates
type LN = d3.HierarchyPointNode<TreeDatum> & { ltrX: number; ltrY: number };

export const TreeGraph: React.FC<TreeGraphProps> = ({
  graph,
  rootId,
  width,
  height,
  selectedNodeId,
  onNodeClick,
  onNavigateToRoot,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<SVGGElement | null>(null);
  const tree = useMemo(() => buildTreeFromGraph(rootId, graph), [rootId, graph]);

  // Layout parameters
  const boxW = 240;
  const boxH = 60;
  const hGap = 160; // horizontal gap between levels
  const vGap = 28; // vertical gap between siblings
  const margin = { top: 24, right: 24, bottom: 24, left: 24 };

  const layout = useMemo(() => {
    if (!tree) return null;

    // d3.tree expects a hierarchy. We'll map TreeDatum to hierarchy node.
    const hierarchyRoot = d3.hierarchy<TreeDatum>(tree, d => d.children);

    // Use cluster for classic dendrogram spacing
    const cLayout = d3.cluster<TreeDatum>().nodeSize([boxH + vGap, boxW + hGap]);
    const root = cLayout(hierarchyRoot);

    // Convert to left-to-right: x->y, y->x, and center vertically
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each((n) => {
      const ln = n as LN;
      const x = n.y;
      const y = n.x;
      ln.ltrX = x;
      ln.ltrY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const contentW = maxX - minX + boxW;
    const contentH = maxY - minY + boxH;

    return {
      root: root as LN,
      size: {
        width: Math.max(width, contentW + margin.left + margin.right),
        height: Math.max(height, contentH + margin.top + margin.bottom),
      },
      offset: { x: margin.left - minX, y: margin.top - minY },
    };
  }, [tree, width, height, margin.top, margin.right, margin.bottom, margin.left]);

  // Setup zoom/pan and auto-fit once content is rendered.
  // This must stay above any early return so hooks run in the same order every render.
  useEffect(() => {
    if (!layout || !svgRef.current || !viewportRef.current) return;
    const svg = d3.select(svgRef.current);
    const viewport = d3.select(viewportRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        viewport.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Auto-fit content
    try {
      const bbox = viewportRef.current.getBBox();
      const scale = Math.min(
        width / Math.max(bbox.width, 1),
        height / Math.max(bbox.height, 1)
      ) * 0.9; // small padding
      const tx = (width - bbox.width * scale) / 2 - bbox.x * scale;
      const ty = (height - bbox.height * scale) / 2 - bbox.y * scale;
      const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
      svg.call(zoom.transform, transform);
    } catch {}

    return () => {
      svg.on('.zoom', null);
    };
  }, [layout, width, height, rootId]);

  if (!layout || !tree) return <div className={styles} style={{ width, height }} />;

  const { root, offset } = layout;

  // Collect links with edge typing for supports/refutes
  const links: Array<{ source: LN; target: LN; via?: EdgeType }> = [];
  root.each((n) => {
    const ln = n as LN;
    if (!ln.children) return;
    for (const c of ln.children as LN[]) {
      // For quote -> evidence, child datum may carry `via`
      const via = (c.data as TreeDatum & { via?: EdgeType }).via;
      links.push({ source: ln, target: c, via });
    }
  });

  return (
    <div className={styles} style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height}>
        <g ref={viewportRef}>
          <g transform={`translate(${offset.x},${offset.y})`}>
          {links.map((l, i) => {
            const s = { x: l.source.ltrX + boxW, y: l.source.ltrY + boxH / 2 };
            const t = { x: l.target.ltrX, y: l.target.ltrY + boxH / 2 };
            const cls = l.via === EdgeType.SUPPORTS ? 'link supports' : l.via === EdgeType.REFUTES ? 'link refutes' : 'link';
            return <path key={i} className={cls} d={elbowPath(s, t)} />;
          })}

          {root.descendants().map((n, i) => {
            const ln = n as LN;
            const x = ln.ltrX;
            const y = ln.ltrY;
            const node = ln.data.ref;
            const selected = node.id === selectedNodeId;
            const kind = ln.data.kind;
            const color = NODE_COLORS[node.type] || NODE_COLORS[NodeType.STATEMENT];
            const isEvidenceDoc = kind === 'evidence' && (node.type === NodeType.DOCUMENT || node.type === NodeType.SOURCE);

            const title = node.type === NodeType.STATEMENT ? truncate(node.content, 80) : truncate(node.content, 60);
            const sub = node.type === NodeType.STATEMENT ? 'Quote' : (node.type === NodeType.DOCUMENT ? 'Source' : node.type);

            return (
              <g
                key={node.id + '-' + ln.depth + '-' + i}
                className={`node-box ${kind} ${selected ? 'selected' : ''}`}
                transform={`translate(${x},${y})`}
                onClick={() => {
                  if (isEvidenceDoc && onNavigateToRoot) {
                    onNavigateToRoot(node.id);
                  } else if (onNodeClick) {
                    onNodeClick(node.id);
                  }
                }}
              >
                <rect width={boxW} height={boxH} />
                <circle cx={8} cy={8} r={4} fill={color} />
                <text className="label" x={16} y={22}>
                  {title}
                </text>
                <text className="sub" x={16} y={42}>
                  {sub}
                </text>
              </g>
            );
          })}
          </g>
        </g>
      </svg>
    </div>
  );
};
