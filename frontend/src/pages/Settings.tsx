import { useState, useEffect } from 'react';
import { User, Bell, Save, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    displayName: settings.displayName || user?.name || '',
    notifications: settings.notifications || true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep display name in sync when auth user or persisted settings load/change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      displayName: settings.displayName || user?.name || ''
    }));
  }, [user?.name, settings.displayName]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile
      await updateProfile({ 
        name: formData.displayName 
      });
      
      // Update settings
      await updateSettings(formData);
      
      // Force re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-2 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-slate-700 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Sidebar */}
            <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-slate-700">
              <nav className="flex flex-row sm:flex-col overflow-x-auto p-2 sm:p-4 gap-2 sm:gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 sm:flex-none flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-left transition-colors text-xs sm:text-base whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-2 sm:p-6 min-w-0">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Informações do Perfil
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Nome de Exibição
                        </label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleInputChange('displayName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                          placeholder="Seu nome"
                        />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                          Este nome aparecerá no header e sidebar da plataforma
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                          O email não pode ser alterado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Preferências de Notificação
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Notificações de Sinais
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            Receba alertas quando novos sinais forem gerados
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notifications}
                            onChange={(e) => handleInputChange('notifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}