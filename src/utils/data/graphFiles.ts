export type GraphFileKind = 'transcript' | 'graph';

type FileLike = Pick<File, 'name' | 'type'>;

export function getGraphFileKind(file: FileLike): GraphFileKind | null {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return 'transcript';
  if (file.type === 'application/json' || file.name.endsWith('.json')) return 'graph';
  return null;
}

export function pickGraphFile<T extends FileLike>(files: T[]): T | undefined {
  return (
    files.find(file => getGraphFileKind(file) === 'transcript') ??
    files.find(file => getGraphFileKind(file) === 'graph')
  );
}
