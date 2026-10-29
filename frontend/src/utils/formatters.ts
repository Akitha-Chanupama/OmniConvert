export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

export function truncateFilename(name: string, maxLen = 30): string {
  if (name.length <= maxLen) return name;
  const ext = getFileExtension(name);
  const base = name.substring(0, name.length - (ext ? ext.length + 1 : 0));
  const charsToShow = maxLen - (ext ? ext.length + 4 : 3);
  if (charsToShow <= 3) return name.substring(0, maxLen - 3) + '...';
  return `${base.substring(0, charsToShow)}...${ext ? '.' + ext : ''}`;
}
