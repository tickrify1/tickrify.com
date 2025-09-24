import { useState, useEffect } from 'react';
import { BarChart3, Zap, Settings, LogOut, User, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { PageType } from '../../hooks/useNavigation';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  isMobile: boolean;
}

export function Sidebar({ currentPage, onNavigate, isMobile }: SidebarProps) {
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

  const getPlanBadge = () => {
    const badges = {
      free: { label: 'Free', icon: '🆓' },
      trader: { label: 'Trader', icon: '🚀' },
    };
    return badges[planType as keyof typeof badges] || badges.free;
  };

  const planBadge = getPlanBadge();

  const menuItems: { id: PageType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'signals', label: 'Sinais IA', icon: Zap },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 overflow-hidden ${
      isCollapsed ? 'w-16' : (isMobile ? 'w-64' : 'w-64')
    }`}>
      {/* Botão de emergência para expandir sempre visível */}
      {isCollapsed && (
        <div className="p-2 border-b border-gray-200 bg-blue-50">
          <button
            onClick={expandSidebar}
            className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            title="Expandir Tickrify (Ctrl+B)"
          >
            ↔️
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 truncate">Tickrify</h1>
                <p className="text-sm text-gray-500 truncate">Trading com IA</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto cursor-pointer"
                 onClick={expandSidebar}
                 title="Clique para expandir Tickrify (Ctrl+B)">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          )}
          
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
          
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

      {/* Plan Badge */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-sm min-w-0">
            <span>{planBadge.icon}</span>
            <span className="truncate">Plano {planBadge.label}</span>
            {currentPlan && <Crown className="w-4 h-4" />}
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-4 border-b border-gray-200 flex justify-center">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer"
               onClick={expandSidebar}
               title="Clique para expandir (Ctrl+B)">
            <span className="text-lg">{planBadge.icon}</span>
          </div>
        </div>
      )}

      {/* Instrução para expandir - visível quando colapsada */}
      {isCollapsed && (
        <div className="p-2 text-center">
          <p className="text-xs text-gray-500 transform rotate-90 whitespace-nowrap">Ctrl+B</p>
        </div>
      )}

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