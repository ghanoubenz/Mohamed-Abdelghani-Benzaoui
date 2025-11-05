import { useState, useEffect, useCallback, useRef } from 'react';
import { postLeadToSheet } from '../services/googleSheetService';
import { SaveLeadPayload } from '../types';

const QUEUE_KEY = 'pipe_care_lead_queue';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const useOfflineQueue = (webhookUrl: string) => {
  const [queue, setQueue] = useState<SaveLeadPayload[]>(() => {
    try {
      const stored = window.localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const isSyncing = useRef(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to save queue to localStorage", error);
    }
  }, [queue]);

  const syncQueue = useCallback(async () => {
    if (isSyncing.current || !navigator.onLine || queue.length === 0) {
      return;
    }
    isSyncing.current = true;
    setSyncStatus('syncing');

    const leadToSync = queue[0];
    try {
      await postLeadToSheet(webhookUrl, leadToSync);
      setQueue(prev => prev.slice(1));
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      isSyncing.current = false;
    }
  }, [queue, webhookUrl]);

  useEffect(() => {
    if (queue.length > 0) {
      syncQueue();
    }
  }, [queue, syncQueue]);

  useEffect(() => {
    const handleOnline = () => syncQueue();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue]);
  
  const addLeadToQueue = (lead: SaveLeadPayload) => {
    setQueue(prev => [...prev, lead]);
  };

  return { queue, addLeadToQueue, syncStatus, syncQueue };
};
