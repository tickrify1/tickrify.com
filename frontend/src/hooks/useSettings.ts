import { useLocalStorage } from './useLocalStorage';

interface Settings {
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  displayName: string;
  email: string;
  notificationTypes: {
    signals: boolean;
    priceAlerts: boolean;
    marketNews: boolean;
  };
}

const defaultSettings: Settings = {
  notifications: true,
  theme: 'dark',
  displayName: 'João Trader',
  email: 'joao@example.com',
  notificationTypes: {
    signals: true,
    priceAlerts: true,
    marketNews: false
  }
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>('tickrify-settings', defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateNotificationTypes = (types: Partial<Settings['notificationTypes']>) => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: { ...prev.notificationTypes, ...types }
    }));
  };

  return {
    settings,
    updateSettings,
    updateNotificationTypes
  };
}