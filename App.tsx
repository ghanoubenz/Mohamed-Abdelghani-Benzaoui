import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Lead, SaveLeadPayload } from './types';
import { LeadForm } from './components/LeadForm';
import { extractInfoFromCard } from './services/geminiService';
import { AppSettings, useSettings } from './hooks/useSettings';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import { useAllLeads } from './hooks/useAllLeads';
import { Settings } from './components/Settings';
import { Toast } from './components/Toast';
import { PlusIcon, CameraIcon, ListIcon, GalleryIcon } from './components/Icons';
import { Spinner } from './components/Spinner';
import { ThankYouMessage } from './components/ThankYouMessage';
import { AllLeadsView } from './components/AllLeadsView';
import { Logo } from './components/Logo';

type View = 'home' | 'form' | 'settings' | 'loading' | 'thankyou' | 'allLeads';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' | 'info' };

const initialLeadState: Lead = {
  name: '', company: '', email: '', phone: '',
  country: '', interest: '', notes: '',
};

const App: React.FC = () => {
  const { settings, saveSettings, isConfigured } = useSettings();
  const { queue, addLeadToQueue, syncStatus } = useOfflineQueue(settings.webhookUrl);
  const { allLeads, addLead } = useAllLeads();
  
  const [view, setView] = useState<View>('loading');
  const [leadData, setLeadData] = useState<Lead>(initialLeadState);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [scanType, setScanType] = useState<'Manual' | 'CardScan'>('Manual');
  const [triggerFileUpload, setTriggerFileUpload] = useState(false);
  const [captureMode, setCaptureMode] = useState<'environment' | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    setView(isConfigured ? 'home' : 'settings');
  }, [isConfigured]);

  const showToast = useCallback((message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    if (syncStatus === 'success') {
      showToast('A pending lead was synced!', 'info');
    } else if (syncStatus === 'error') {
      showToast("Couldn't sync lead. Will retry.", 'error');
    }
  }, [syncStatus, showToast]);

  const handleSettingsSave = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    showToast('Settings saved successfully!', 'success');
    setView('home');
  };

  const handleCloseSettings = () => {
    if (isConfigured) {
      setView('home');
    }
  };

  const handleCardSelect = useCallback(async (file: File) => {
    setIsProcessingCard(true);
    setTriggerFileUpload(false);
    try {
      const extractedData = await extractInfoFromCard(file);
      if (extractedData) {
        setLeadData(prev => ({ ...prev, ...extractedData }));
        showToast('Card info extracted!', 'success');
      } else {
        throw new Error('Could not extract information from the business card.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to process card. Please enter details manually.', 'error');
    } finally {
      setIsProcessingCard(false);
    }
  }, [showToast]);

  const handleFormSubmit = useCallback(async (finalLeadData: Lead) => {
    const payload: SaveLeadPayload = {
      ...finalLeadData,
      source: urlParams.get('src') || settings.defaultSource,
      event: urlParams.get('event') || settings.defaultEvent,
      registrar: urlParams.get('reg') || settings.defaultRegistrar,
      scanType: scanType,
      status: 'New',
      owner: '',
      followUpDate: '',
    };

    const newStoredLead = addLead(payload);
    addLeadToQueue(newStoredLead);
    showToast(navigator.onLine ? '✅ Lead saved & synced!' : '✅ Saved locally — syncing soon.', 'success');
    
    setLeadData(initialLeadState);
    setView('thankyou');
    setScanType('Manual');
  }, [scanType, settings, urlParams, addLead, addLeadToQueue, showToast]);

  const openForm = (type: 'Manual' | 'CardScan', capture?: 'environment') => {
    setLeadData(initialLeadState);
    setScanType(type);
    setView('form');
    if (type === 'CardScan') {
      setCaptureMode(capture);
      setTriggerFileUpload(true);
    } else {
      setCaptureMode(undefined);
      setTriggerFileUpload(false);
    }
  };
  
  const leadStats = useMemo(() => {
    const scanned = allLeads.filter(l => l.scanType === 'CardScan').length;
    const manual = allLeads.length - scanned;
    return { scanned, manual, total: allLeads.length };
  }, [allLeads]);

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <div className="flex justify-center items-center h-screen"><Spinner size="lg"/></div>;
      case 'settings':
        return <Settings currentSettings={settings} onSave={handleSettingsSave} onClose={handleCloseSettings} isInitialSetup={!isConfigured}/>
      case 'form':
        return (
          <>
            <button onClick={() => setView('home')} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 z-10 p-2 rounded-full bg-white/30 hover:bg-white/60 transition-colors">&larr; Back</button>
            <LeadForm 
              initialData={leadData}
              onFormSubmit={handleFormSubmit}
              onCardSelect={handleCardSelect}
              isProcessingCard={isProcessingCard}
              isSubmitting={syncStatus === 'syncing'}
              triggerFileUpload={triggerFileUpload}
              captureMode={captureMode}
            />
          </>
        );
      case 'thankyou':
        return <ThankYouMessage onRegisterAnother={() => setView('home')} />;
      case 'allLeads':
        return <AllLeadsView leads={allLeads} onBack={() => setView('home')} />;
      case 'home':
        return (
          <div className="p-6 sm:p-8 text-center animate-fade-in">
            <div className="space-y-4">
              <button onClick={() => openForm('Manual')} className="w-full flex items-center justify-center text-lg btn-primary text-white font-semibold py-4 px-4 rounded-xl focus:outline-none focus:shadow-outline uppercase tracking-wider shadow-lg">
                <PlusIcon />
                Manual Entry
              </button>
              <button onClick={() => openForm('CardScan', 'environment')} className="w-full flex items-center justify-center text-lg bg-white/50 hover:bg-white/80 border border-gray-300/80 text-[#003366] font-semibold py-4 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-all duration-300 hover:border-gray-400 uppercase tracking-wider">
                <CameraIcon />
                Scan with Camera
              </button>
               <button onClick={() => openForm('CardScan')} className="w-full flex items-center justify-center text-lg bg-white/50 hover:bg-white/80 border border-gray-300/80 text-[#003366] font-semibold py-4 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-all duration-300 hover:border-gray-400 uppercase tracking-wider">
                <GalleryIcon />
                Upload from Gallery
              </button>
              <button onClick={() => setView('allLeads')} className="w-full flex items-center justify-center text-lg bg-white/50 hover:bg-white/80 border border-gray-300/80 text-gray-800 font-semibold py-4 px-4 rounded-xl focus:outline-none focus:shadow-outline transition-all duration-300 hover:border-gray-400 uppercase tracking-wider">
                <ListIcon />
                View All Leads
              </button>
            </div>

            <div className="mt-8 p-4 bg-white/30 rounded-xl">
              <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Leads Summary</h4>
              <div className="flex justify-around mt-2 text-center">
                <div><p className="text-2xl font-bold text-[#003366]">{leadStats.scanned}</p><p className="text-xs text-gray-600">Scanned</p></div>
                <div><p className="text-2xl font-bold text-[#003366]">{leadStats.manual}</p><p className="text-xs text-gray-600">Manual</p></div>
                <div><p className="text-2xl font-bold text-[#003366]">{leadStats.total}</p><p className="text-xs text-gray-600">Total</p></div>
              </div>
            </div>

          </div>
        );
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
      ))}

      <header className="w-full max-w-lg text-center mb-4">
        <Logo />
        <h1 className="text-2xl font-bold text-[#003366] mt-4">PIPECARE Event Lead Capture</h1>
        <p className="text-gray-600 mt-1">Easily collect, scan, and manage leads at your event.</p>
      </header>
      
      <main className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 glass-card relative">
        {renderContent()}
      </main>

      <footer className="mt-6 text-center text-sm text-gray-600">
        <div className={`px-3 py-1 text-xs font-bold rounded-full inline-flex items-center transition-colors ${
            queue.length > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
            {queue.length > 0 ? (
                <>
                    <span className="w-2 h-2 mr-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    {queue.length} {queue.length === 1 ? 'lead' : 'leads'} pending sync
                </>
            ) : (
                <>
                    <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                    All leads synced
                </>
            )}
        </div>
        <p className="text-xs mt-3 text-gray-500">&copy; {new Date().getFullYear()} PIPECARE. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;