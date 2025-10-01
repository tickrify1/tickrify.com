import { useState, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigation } from '../../hooks/useNavigation';
import { products } from '../../pricing';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
  onPlanSwitch: (priceId: string | null) => void;
  currentPlanType: string;
}

export function Header({ onMenuClick, isMobile, onPlanSwitch, currentPlanType }: HeaderProps) {
  const { user, logout } = useAuth();
  const { getCurrentPlan } = useSubscription();
  const { navigateTo } = useNavigation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Usuário');

  const currentPlan = getCurrentPlan();

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
  const getPlanBadge = () => {
    const badges = {
      free: { label: 'Free', icon: '🆓' },
      trader: { label: 'Trader', icon: '🚀' },
    };
    return badges[currentPlanType as keyof typeof badges] || badges.free;
  };

  const planBadge = getPlanBadge();

  const handlePlanChange = (priceId: string | null) => {
    onPlanSwitch(priceId);
    setShowPlanMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-3 flex items-center justify-between">
      {/* Left side - Menu button (mobile) */}
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        {/* Logo for mobile */}
        {isMobile && (
          <div className="flex items-center space-x-2">
            <img src="/tickrify-logo-icon.png" alt="Tickrify" className="h-8 w-auto" />
          </div>
        )}
      </div>

      {/* Center - Spacer (desktop) */}
      {!isMobile && (
        <div className="flex items-center justify-between w-full">
          <img src="/tickrify-logo-icon.png" alt="Tickrify" className="h-8 w-auto" />
          <div className="flex-1" />
        </div>
      )}

      {/* Right side - User controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Plan Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <span>{planBadge.icon}</span>
            <span className="hidden sm:inline">{planBadge.label}</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {showPlanMenu && (
            <div className={`absolute right-0 mt-2 ${isMobile ? 'w-screen max-w-xs -mr-3' : 'w-64'} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Trocar Plano</p>
                <p className="text-xs text-gray-500">Sistema de teste</p>
              </div>
              
              {/* Free Plan */}
              <button
                onClick={() => handlePlanChange(null)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentPlanType === 'free' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>🆓</span>
                    <span className="font-medium">Free</span>
                  </div>
                  {currentPlanType === 'free' && <span className="text-blue-600 text-xs">ATUAL</span>}
                </div>
                <p className="text-xs text-gray-500 mt-1">10 análises/mês</p>
              </button>

              {/* Paid Plans (mostrar apenas Trader Mensal por enquanto) */}
              {products.filter(p => p.interval !== 'year').map((product) => {
                const isActive = currentPlan?.priceId === product.priceId;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => handlePlanChange(product.priceId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>
                          {product.name === 'Trader' && '🚀'}
                        </span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isActive && <span className="text-blue-600 text-xs">ATUAL</span>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.name === 'Trader' && '120 análises/mês'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
            {!isMobile && (
              <>
                <span className="text-sm font-medium text-gray-700">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              {/* Removido item Configurações */}
              
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  // Force page reload to ensure clean state
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showPlanMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowPlanMenu(false);
          }}
        />
      )}
    </header>
  );
}