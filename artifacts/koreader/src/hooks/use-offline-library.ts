import { useState, useEffect, useCallback } from 'react';
import type { Passage } from '@workspace/api-client-react';

const STORAGE_KEY = 'lf-offline-passages';

function readStore(): Passage[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeStore(passages: Passage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passages));
  } catch {
    console.warn('LinguaFlow: offline storage full');
  }
}

export function savePassageOffline(passage: Passage) {
  const existing = readStore();
  const idx = existing.findIndex(p => p.id === passage.id);
  if (idx >= 0) {
    existing[idx] = passage;
  } else {
    existing.push(passage);
  }
  writeStore(existing);
}

export function getOfflinePassages(): Passage[] {
  return readStore();
}

export function getOfflineCount(): number {
  return readStore().length;
}

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  return isOnline;
}

export function useOfflineLibrary() {
  const [offlinePassages, setOfflinePassages] = useState<Passage[]>([]);
  const [isSyncing, setIsSyncing]             = useState(false);
  const isOnline = useIsOnline();

  useEffect(() => {
    setOfflinePassages(readStore());
  }, []);

  const syncAll = useCallback((passages: Passage[]) => {
    setIsSyncing(true);
    writeStore(passages);
    setOfflinePassages(passages);
    setIsSyncing(false);
  }, []);

  return { offlinePassages, isOnline, syncAll, isSyncing };
}
