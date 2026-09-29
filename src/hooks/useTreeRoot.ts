'use client';

import { useEffect, useMemo, useState } from 'react';
import { findDefaultRootId } from '@/utils/tree/defaultRoot';
import { GraphNode } from '@/types/graph';

export function useTreeRoot(nodes: GraphNode[]) {
  const defaultRootId = useMemo(() => findDefaultRootId(nodes), [nodes]);
  const [treeRootId, setTreeRootId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!treeRootId && defaultRootId) setTreeRootId(defaultRootId);
  }, [defaultRootId, treeRootId]);

  return [treeRootId, setTreeRootId] as const;
}
