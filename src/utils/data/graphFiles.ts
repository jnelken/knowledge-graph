export type GraphFileKind = 'transcript' | 'graph';

type FileLike = Pick<File, 'name' | 'type'>;

export function getGraphFileKind(file: FileLike): GraphFileKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt')) return 'transcript';
  if (name.endsWith('.json')) return 'graph';
  if (file.type === 'text/plain') return 'transcript';
  if (file.type === 'application/json') return 'graph';
  return null;
}

export function pickGraphFile<T extends FileLike>(files: T[]): T | undefined {
  return (
    files.find(file => getGraphFileKind(file) === 'transcript') ??
    files.find(file => getGraphFileKind(file) === 'graph')
  );
}
