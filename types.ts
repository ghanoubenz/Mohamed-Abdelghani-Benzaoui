export interface Lead {
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  interest: string;
  notes: string;
}

export interface SaveLeadPayload extends Lead {
  source: string;
  event: string;
  registrar: string;
  scanType: 'Manual' | 'CardScan';
  status: 'New';
  owner: '';
  followUpDate: '';
}

export interface StoredLead extends SaveLeadPayload {
  id: string;
  timestamp: string;
}
