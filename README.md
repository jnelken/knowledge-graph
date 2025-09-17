# Knowledge Graph Application

A React/TypeScript application for creating and visualizing knowledge graphs from interview transcripts and other textual content. Built with Next.js, D3.js, and Emotion for styling.

## Architecture Philosophy: LLM-Friendly Design

This codebase is designed with **LLM discoverability** as a core principle. Every file, function, and directory is named and organized so that an AI assistant can quickly locate existing functionality without needing to read through every file.

### Core Principles

1. **Predictable Structure**: Files are organized by domain and named descriptively
2. **No Hidden Logic**: All utilities are in obvious locations with clear names
3. **Modular Design**: Each file has a single, clear responsibility
4. **Consistent Patterns**: Similar functionality follows the same organizational patterns

## Project Structure

```
src/
├── app/                    # Next.js app router
├── components/             # React UI components
│   ├── ForceGraph.tsx     # D3.js graph visualization
│   ├── GraphControls.tsx  # Filter and layout controls
│   ├── NodeDetailPanel.tsx # Node editing and details
│   └── KnowledgeGraphApp.tsx # Main application
├── constants/              # Configuration and default values
│   ├── graphDefaults.ts   # Visual constants, colors, sizes
│   ├── nodeTypes.ts       # Node type labels and configurations
│   └── edgeTypes.ts       # Edge type labels and configurations
├── types/
│   └── graph.ts           # TypeScript interfaces for all data structures
└── utils/                 # Utility functions organized by domain
    ├── graph/             # Graph-specific calculations
    │   ├── nodeCalculations.ts # Node sizing, positioning, styling
    │   └── edgeCalculations.ts # Edge styling, connections, validation
    ├── data/              # Data processing and transformation
    │   ├── textParsers.ts # Parse transcripts into structured data
    │   └── graphTransformers.ts # Convert between data formats
    ├── validation/        # Data validation utilities
    │   ├── nodeValidation.ts # Validate node structure and content
    │   └── edgeValidation.ts # Validate edge connections and properties
    ├── persistence.ts     # localStorage management and export/import
    └── sampleData.ts      # Sample data for development
```

## Helper Function Discovery Guide

### "I need to..."

**Calculate node appearance:**
- **Size**: `calculateNodeRadius()` in `utils/graph/nodeCalculations.ts`
- **Colors**: `NODE_COLORS` constant in `constants/graphDefaults.ts`
- **Stroke**: `calculateNodeStrokeColor/Width()` in `utils/graph/nodeCalculations.ts`

**Work with edges:**
- **Styling**: `getEdgeColor()`, `calculateEdgeStrokeWidth()` in `utils/graph/edgeCalculations.ts`
- **Connections**: `edgeConnectsToNode()`, `getOtherNodeId()` in `utils/graph/edgeCalculations.ts`
- **Validation**: `validateEdge()`, `findDuplicateEdges()` in `utils/validation/edgeValidation.ts`

**Parse text content:**
- **Transcripts**: `parseTranscript()` in `utils/data/textParsers.ts`
- **Entity extraction**: `extractEntities()` in `utils/data/textParsers.ts`
- **Transform to graph**: `transcriptToKnowledgeGraph()` in `utils/data/graphTransformers.ts`

**Validate data:**
- **Nodes**: `validateNode()`, `generateNodeValidationReport()` in `utils/validation/nodeValidation.ts`
- **Edges**: `validateEdge()`, `generateEdgeValidationReport()` in `utils/validation/edgeValidation.ts`

**Persist data:**
- **Save/Load**: `persistenceManager` class in `utils/persistence.ts`
- **Export**: `exportGraph()` in `utils/persistence.ts`
- **Import**: `importGraph()` in `utils/persistence.ts`

### Where to Add New Functionality

**New node calculation?** → `utils/graph/nodeCalculations.ts`
**New edge behavior?** → `utils/graph/edgeCalculations.ts`
**New parsing logic?** → `utils/data/textParsers.ts` or create `utils/data/newParser.ts`
**New validation rule?** → `utils/validation/nodeValidation.ts` or `utils/validation/edgeValidation.ts`
**New visual constant?** → `constants/graphDefaults.ts`
**New UI component?** → `components/NewComponent.tsx`

## Key Features

- **Interactive Force Graph**: D3.js-powered visualization with drag, zoom, and pan
- **Smart Filtering**: Filter by node type, edge type, confidence, and search terms
- **Persistent Storage**: Auto-save to localStorage with export/import functionality
- **Node Editing**: Click any node to view details and edit content
- **Relationship Preservation**: Source document nodes are always visible and maintain connections
- **Entity Extraction**: Automatic detection of people, institutions, documents, events, and locations
- **Statement Analysis**: Classify text as claims, facts, opinions, or questions
- **Drag & Drop**: Upload transcript files or import saved graphs

## Getting Started

### Development

```bash
npm run dev    # Start development server at http://localhost:3000
npm run build  # Build production version
npm run lint   # Run ESLint
```

### Usage

1. **Upload a transcript**: Click "Upload Transcript" or drag & drop a `.txt` file
2. **Explore the graph**: Use mouse to pan/zoom, click nodes for details
3. **Filter content**: Use the sidebar to filter by type, confidence, or search terms
4. **Edit nodes**: Click any node to view details and edit content
5. **Save your work**: The app auto-saves to localStorage, or export as JSON

### Example Data

The app includes sample data from a Catherine Austin Fitts interview demonstrating:
- Financial claims and supporting evidence
- Institutional connections (Federal Reserve, Department of Housing, etc.)
- Referenced documents and events
- Person and location mentions

## Technical Details

### Data Model

- **Nodes**: Represent entities (statements, people, institutions, documents, etc.)
- **Edges**: Represent relationships (supports, refutes, references, mentions, etc.)
- **Graph**: Container with nodes, edges, and metadata
- **Persistence**: JSON serialization with validation

### Visual Design

- **Node Colors**: Color-coded by type (blue=statements, green=evidence, etc.)
- **Node Sizes**: Vary by type and importance (source documents are larger)
- **Edge Colors**: Color-coded by relationship type (green=supports, red=refutes)
- **Force Layout**: Physics simulation keeps related nodes close together

### Performance

- **Efficient Filtering**: Only renders visible nodes/edges
- **Debounced Auto-save**: Prevents excessive localStorage writes
- **Collision Detection**: Prevents node overlap in visualization
- **Memory Management**: Cleans up D3 simulations on component unmount

## Extending the Application

### Adding New Node Types

1. Add to `NodeType` enum in `types/graph.ts`
2. Add colors/sizes to `constants/graphDefaults.ts`
3. Add labels to `constants/nodeTypes.ts`
4. Update parsing patterns in `utils/data/textParsers.ts`

### Adding New Relationship Types

1. Add to `EdgeType` enum in `types/graph.ts`
2. Add colors/defaults to `constants/edgeTypes.ts`
3. Update relationship detection in `utils/data/graphTransformers.ts`

### Adding New Data Sources

1. Create new parser in `utils/data/newSourceParser.ts`
2. Add transformation logic to `utils/data/graphTransformers.ts`
3. Update UI to handle new file types

The modular architecture ensures new functionality integrates seamlessly without breaking existing code.

## Contributing

When adding new functionality:

1. Follow the established naming conventions
2. Place utilities in the appropriate domain folder
3. Add constants to the relevant constants file
4. Write validation functions for new data types
5. Update this README if adding new organizational patterns

The codebase is designed to be self-documenting through clear file names and organization.