'use client';

import React, { useEffect } from 'react';
import { KnowledgeGraphApp } from './KnowledgeGraphApp';
import { createSampleGraph } from '@/utils/sampleData';
import { persistenceManager } from '@/utils/persistence';

export const GraphExample: React.FC = () => {
  useEffect(() => {
    // Load sample data if no graph exists
    const existingGraph = persistenceManager.loadGraph();
    if (!existingGraph || existingGraph.nodes.length === 0) {
      const sampleGraph = createSampleGraph();
      persistenceManager.saveGraph(sampleGraph);
      // Reload the page to pick up the new data
      window.location.reload();
    }
  }, []);

  return <KnowledgeGraphApp />;
};