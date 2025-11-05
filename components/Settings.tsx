import React, { useState, useEffect } from 'react';
import { AppSettings } from '../hooks/useSettings';

interface SettingsProps {
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  isInitialSetup?: boolean;
}

const inputStyle = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent sm:text-sm bg-white/70";

export const Settings: React.FC<SettingsProps> = ({ currentSettings, onSave, onClose, isInitialSetup }) => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={isInitialSetup ? undefined : onClose}
    >
      <div 
        className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Settings</h2>
        {isInitialSetup && <p className="text-sm text-gray-600 mb-6">Please configure the app to continue.</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700">Webhook URL</label>
            <input
              type="text"
              id="webhookUrl"
              name="webhookUrl"
              value={settings.webhookUrl}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="defaultEvent" className="block text-sm font-medium text-gray-700">Default Event Name</label>
            <input
              type="text"
              id="defaultEvent"
              name="defaultEvent"
              value={settings.defaultEvent}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="defaultSource" className="block text-sm font-medium text-gray-700">Default Source</label>
            <input
              type="text"
              id="defaultSource"
              name="defaultSource"
              value={settings.defaultSource}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="defaultRegistrar" className="block text-sm font-medium text-gray-700">Default Registrar</label>
            <input
              type="text"
              id="defaultRegistrar"
              name="defaultRegistrar"
              value={settings.defaultRegistrar}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isInitialSetup}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 btn-primary text-white font-bold rounded-md focus:outline-none focus:shadow-outline transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};