import { useState, useEffect } from 'react';
import { StoredLead, SaveLeadPayload } from '../types';

const ALL_LEADS_KEY = 'pipe_care_all_leads';

export const useAllLeads = () => {
  const [allLeads, setAllLeads] = useState<StoredLead[]>(() => {
    try {
      const stored = window.localStorage.getItem(ALL_LEADS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(ALL_LEADS_KEY, JSON.stringify(allLeads));
    } catch (error) {
      console.error("Failed to save all leads to localStorage", error);
    }
  }, [allLeads]);
  
  const addLead = (leadPayload: SaveLeadPayload): StoredLead => {
    const newLead: StoredLead = {
      ...leadPayload,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setAllLeads(prev => [newLead, ...prev]);
    return newLead;
  };

  return { allLeads, addLead };
};
