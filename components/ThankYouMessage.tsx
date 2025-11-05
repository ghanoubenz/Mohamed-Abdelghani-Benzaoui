import React from 'react';
import { CheckCircleIcon } from './Icons';

interface ThankYouMessageProps {
  onRegisterAnother: () => void;
}

export const ThankYouMessage: React.FC<ThankYouMessageProps> = ({ onRegisterAnother }) => {
  return (
    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
      <div className="mb-4">
        <CheckCircleIcon />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
      <p className="text-gray-600 mb-6">Your information has been successfully saved.</p>
      <button
        onClick={onRegisterAnother}
        className="w-full btn-primary text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200"
      >
        Register Another Lead
      </button>
    </div>
  );
};