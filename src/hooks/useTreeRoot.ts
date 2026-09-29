'use client';

import { useMemo, useState } from 'react';
import { resolveTreeRootId } from '@/utils/tree/defaultRoot';
import { GraphNode } from '@/types/graph';

export function useTreeRoot(nodes: GraphNode[]) {
  const [chosenRootId, setTreeRootId] = useState<string | undefined>(undefined);
  const treeRootId = useMemo(() => resolveTreeRootId(nodes, chosenRootId), [nodes, chosenRootId]);

  return [treeRootId, setTreeRootId] as const;
}
