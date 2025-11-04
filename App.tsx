import React, { useState, useCallback } from 'react';
import { Lead } from './types';
import { LeadForm } from './components/LeadForm';
import { ThankYouMessage } from './components/ThankYouMessage';
import { extractInfoFromCard } from './services/geminiService';
import { saveLeadToSheet } from './services/googleSheetService';

const initialLeadState: Lead = {
  name: '',
  company: '',
  email: '',
  phone: '',
};

const App: React.FC = () => {
  const [leadData, setLeadData] = useState<Lead>(initialLeadState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCardSelect = useCallback(async (file: File) => {
    setIsProcessingCard(true);
    setError(null);
    try {
      const extractedData = await extractInfoFromCard(file);
      if (extractedData) {
        setLeadData(extractedData);
      } else {
        throw new Error('Could not extract information from the business card.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to process business card. Please enter details manually.');
    } finally {
      setIsProcessingCard(false);
    }
  }, []);

  const handleFormSubmit = useCallback(async (finalLeadData: Lead) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Validate that essential fields are not empty before submission
      if (!finalLeadData.name || !finalLeadData.company || !finalLeadData.email) {
        setError("Please fill in Name, Company, and Email before saving.");
        setIsSubmitting(false);
        return;
      }
      await saveLeadToSheet(finalLeadData);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError('Failed to save lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const handleRegisterAnother = () => {
    setLeadData(initialLeadState);
    setIsSubmitted(false);
    setError(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <header className="mb-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#002D5A]">
              PIPECARE
          </h1>
          <p className="text-lg text-gray-600">Event Lead Capture</p>
      </header>

      <main className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}
        {isSubmitted ? (
          <ThankYouMessage onRegisterAnother={handleRegisterAnother} />
        ) : (
          <LeadForm 
            initialData={leadData}
            onFormSubmit={handleFormSubmit}
            onCardSelect={handleCardSelect}
            isProcessingCard={isProcessingCard}
            isSubmitting={isSubmitting}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} PIPECARE. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;