import { useState, useEffect } from 'react';
import { BarChart3, Zap, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { PageType } from '../../hooks/useNavigation';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isMobile: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ currentPage, onNavigate, isMobile, onCollapsedChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { getPlanType, getCurrentPlan } = useSubscription();
  // Inicializar sempre expandida (false = expandida, true = colapsada)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Usuário');
  
  const planType = getPlanType();
  const currentPlan = getCurrentPlan();

  // Força sidebar expandida no mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
      if (onCollapsedChange) onCollapsedChange(false);
    }
  }, [isMobile]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setDisplayName(user?.name || 'Usuário');
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  // Update display name when user changes
  useEffect(() => {
    setDisplayName(user?.name || 'Usuário');
  }, [user]);
  // Função para sempre expandir a sidebar
  const expandSidebar = () => {
    setIsCollapsed(false);
    console.log('🔧 Sidebar expandida manualmente');
    if (onCollapsedChange) onCollapsedChange(false);
  };

  // Tecla de atalho para expandir sidebar (Ctrl + B)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        expandSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Removido badge de plano para um visual mais limpo na barra colapsada

  const menuItems: { id: PageType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'signals', label: 'Sinais IA', icon: Zap }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 overflow-hidden ${
      isCollapsed ? 'w-16' : (isMobile ? 'w-64' : 'w-64')
    }`}>
      {/* Removido botão de emergência/atalhos para um visual minimalista */}
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img src="/tickrify-logo-icon.png" alt="Tickrify" className="h-8 w-auto" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 truncate">Tickrify</h1>
                <p className="text-sm text-gray-500 truncate">Trading com IA</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mx-auto">
              <img src="/tickrify-logo-icon.png" alt="Tickrify" className="h-10 w-auto" />
            </div>
          )}
          
          {/* Removido botão de colapsar/expandir com setas para simplificar o layout */}
          
          {/* Botão de reset para sempre expandir */}
          {isCollapsed && (
            <button
              onClick={expandSidebar}
              className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ml-2"
              title="Expandir sidebar (Ctrl+B)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Removido plan badge */}

      {isCollapsed && (
        <div className="p-2" />
      )}

      {/* Removido texto de instrução */}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-3 min-w-0">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate break-words">
                  {user?.email || 'email@exemplo.com'}
                </p>
              </div>
            </div>
            
            <button
                // Force page reload to ensure clean state
              onClick={logout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm min-w-0"
            >
              <LogOut className="w-4 h-4" />
              <span className="truncate">Sair</span>
            </button>
          </>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}