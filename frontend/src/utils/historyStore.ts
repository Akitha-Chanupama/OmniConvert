export interface StoredConversionRecord {
  id: string;
  timestamp: number;
  originalNames: string[];
  convertedFilename: string;
  targetFormat: string;
  fileSizeBytes: number;
  originalSizeBytes?: number;
  downloadUrl: string;
  isZip?: boolean;
}

const STORAGE_KEY = 'omniconvert_conversion_history_v1';
const HISTORY_EVENT = 'omniconvert_history_updated';
const MAX_HISTORY_ITEMS = 50;

export function getStoredHistory(): StoredConversionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read conversion history:', err);
    return [];
  }
}

export function addStoredHistory(
  entry: Omit<StoredConversionRecord, 'id' | 'timestamp'> & { id?: string; timestamp?: number }
): StoredConversionRecord {
  const current = getStoredHistory();
  const newRecord: StoredConversionRecord = {
    id: entry.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: entry.timestamp || Date.now(),
    originalNames: entry.originalNames,
    convertedFilename: entry.convertedFilename,
    targetFormat: entry.targetFormat.toUpperCase(),
    fileSizeBytes: entry.fileSizeBytes,
    originalSizeBytes: entry.originalSizeBytes,
    downloadUrl: entry.downloadUrl,
    isZip: entry.isZip,
  };

  // Prepend and enforce maximum capacity
  const updated = [newRecord, ...current.filter((item) => item.id !== newRecord.id)].slice(
    0,
    MAX_HISTORY_ITEMS
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist history item:', err);
  }

  notifyHistoryChanged(updated);
  return newRecord;
}

export function removeStoredHistoryItem(id: string): void {
  const current = getStoredHistory();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update history after removal:', err);
  }
  notifyHistoryChanged(updated);
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
  notifyHistoryChanged([]);
}

function notifyHistoryChanged(records: StoredConversionRecord[]) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HISTORY_EVENT, { detail: records }));
}

export function subscribeHistory(callback: (records: StoredConversionRecord[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<StoredConversionRecord[]>;
    callback(customEvent.detail || getStoredHistory());
  };

  window.addEventListener(HISTORY_EVENT, handler);
  return () => window.removeEventListener(HISTORY_EVENT, handler);
}
