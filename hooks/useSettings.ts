import { useState } from 'react';

export interface AppSettings {
  webhookUrl: string;
  defaultEvent: string;
  defaultSource: string;
  defaultRegistrar: string;
}

const SETTINGS_KEY = 'pipe_care_settings';

const defaultSettings: AppSettings = {
  webhookUrl: 'https://script.google.com/macros/s/AKfycbz1_lmnh5CmiYFJGBC7RcqkdeC2D7GJnYM44vd3TjItbIWPMzGtfXNDI4SIxuEq8NuE/exec',
  defaultEvent: 'MECC KSA',
  defaultSource: 'QR_booth',
  defaultRegistrar: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = window.localStorage.getItem(SETTINGS_KEY);
      const parsed = stored ? JSON.parse(stored) : defaultSettings;
      // Ensure all keys are present, falling back to defaults if not
      return { ...defaultSettings, ...parsed };
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      return defaultSettings;
    }
  });

  const saveSettings = (newSettings: AppSettings) => {
    try {
      const settingsToSave = { ...settings, ...newSettings };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
      setSettings(settingsToSave);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  const isConfigured = settings.webhookUrl && settings.webhookUrl !== '{{WEBHOOK_URL}}' && !settings.webhookUrl.includes('YOUR_WEBHOOK_URL');

  return { settings, saveSettings, isConfigured };
};