export function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function buildDumpFilename(rootName: string, path?: string[]): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -1);
  const pathSuffix = path && path.length > 0 ? '.' + path.join('.') : '';
  return `${rootName}${pathSuffix}-${timestamp}.json`;
}
