import React, { useState, useEffect, useRef } from 'react';
import { Lead } from '../types';
import { UploadIcon } from './Icons';
import { Spinner } from './Spinner';

interface LeadFormProps {
  initialData: Lead;
  onFormSubmit: (lead: Lead) => void;
  onCardSelect: (file: File) => void;
  isProcessingCard: boolean;
  isSubmitting: boolean;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  initialData,
  onFormSubmit,
  onCardSelect,
  isProcessingCard,
  isSubmitting,
}) => {
  const [lead, setLead] = useState<Lead>(initialData);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLead(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLead(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onCardSelect(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFormSubmit(lead);
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-800">Lead Registration</h2>
        <p className="text-center text-gray-500 mt-2">Enter details or upload a business card.</p>
      </div>

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#002D5A] transition-colors duration-200">
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept="image/*"
          ref={fileInputRef}
          disabled={isProcessingCard || isSubmitting}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center min-h-[100px]">
            {isProcessingCard ? (
              <>
                <Spinner size="md" />
                <p className="mt-2 text-sm font-medium text-gray-600">Extracting info...</p>
              </>
            ) : (
              <>
                <UploadIcon />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  <span className="font-bold text-[#002D5A]">Upload a business card</span>
                </p>
                <p className="text-xs text-gray-500">PNG or JPG</p>
                {fileName && !isProcessingCard && <p className="text-xs text-green-600 mt-2">Selected: {fileName}</p>}
              </>
            )}
          </div>
        </label>
      </div>

      <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 font-semibold text-sm">OR ENTER MANUALLY</span>
          <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="name" name="name" value={lead.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002D5A] focus:border-[#002D5A] sm:text-sm" />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
          <input type="text" id="company" name="company" value={lead.company} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002D5A] focus:border-[#002D5A] sm:text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" name="email" value={lead.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002D5A] focus:border-[#002D5A] sm:text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" id="phone" name="phone" value={lead.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#002D5A] focus:border-[#002D5A] sm:text-sm" />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || isProcessingCard}
          className="w-full flex justify-center items-center bg-[#002D5A] hover:bg-[#004282] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Spinner size="sm" /> : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};
