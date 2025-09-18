# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router (entry views, layout, styles).
- `src/components/`: React UI (e.g., `ForceGraph.tsx`, `GraphControls.tsx`).
- `src/utils/`: Domain utilities
  - `graph/`: node/edge calculations
  - `data/`: parsers and transformers
  - `validation/`: node/edge validation
  - `persistence.ts`, `sampleData.ts`
- `src/constants/`: visual defaults and type registries.
- `src/types/graph.ts`: core TypeScript types.
- `public/`: static assets.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server (Turbopack) at `http://localhost:3000`.
- `npm run build`: Production build (Turbopack).
- `npm start`: Run built app.
- `npm run lint`: ESLint using `next/core-web-vitals` + TypeScript config.

## Coding Style & Naming Conventions
- **Language**: TypeScript, strict mode enabled.
- **Indentation**: 2 spaces; **quotes**: single; **semicolons**: yes.
- **Components**: PascalCase files (e.g., `NodeDetailPanel.tsx`).
- **Utilities**: camelCase files (e.g., `nodeCalculations.ts`).
- **Paths**: use alias `@/*` (see `tsconfig.json`).
- **React**: Functional components + hooks; colocate styles (Emotion CSS) within component when simple.
- **Linting**: Keep code green with `npm run lint` before pushing.

## Testing Guidelines
- Tests are not yet configured. If adding tests:
  - Prefer Jest/Vitest + React Testing Library.
  - Place under `src/__tests__` and name `*.test.ts`/`*.test.tsx`.
  - Aim for fast unit tests of utils; add component tests for critical UI.

## Commit & Pull Request Guidelines
- **Commits**: Imperative, concise subject; scope if helpful (e.g., `components:`). Example: `utils: add edge weight calculation`.
- **PRs**:
  - Clear description of change and rationale.
  - Link related issues.
  - For UI changes, include screenshots or a short GIF.
  - Include testing notes: steps to verify, edge cases.
  - Ensure `npm run lint` passes.

## Security & Configuration Tips
- No secrets in repo; avoid embedding API keys. Client persists data via `localStorage`—do not store sensitive data.
- Large datasets: prefer import/export JSON rather than committing to version control.

## Architecture Overview
- Modular, LLM-discoverable layout: one responsibility per file, descriptive names.
- Extend by following existing patterns (e.g., new edge logic → `src/utils/graph/edgeCalculations.ts`). See README for a detailed discovery guide.
