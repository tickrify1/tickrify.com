import { useState, useEffect } from 'react';
import { Menu, User, LogOut, ChevronDown, Settings, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigation } from '../../hooks/useNavigation';
import { stripeProducts } from '../../stripe-config';

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
  const [isChangingPlan, setIsChangingPlan] = useState(false);
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
      alpha_pro: { label: 'Alpha Pro', icon: '⭐' }
    };
    return badges[currentPlanType as keyof typeof badges] || badges.free;
  };

  const planBadge = getPlanBadge();

  const handlePlanChange = async (priceId: string | null) => {
    console.log('🔄 Tentando trocar plano para:', priceId);
    setIsChangingPlan(true);
    try {
      await onPlanSwitch(priceId);
      console.log('✅ Plano trocado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao trocar plano:', error);
    } finally {
      setIsChangingPlan(false);
      setShowPlanMenu(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 flex items-center justify-between relative">
      {/* Left side - Menu button (mobile) + Logo */}
      <div className="flex items-center space-x-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        {/* Logo/Brand - only show on mobile */}
        {isMobile && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">Tickrify</span>
          </div>
        )}
      </div>

      {/* Center - Spacer (desktop) */}
      {!isMobile && (
        <div className="flex-1" />
      )}

      {/* Right side - User controls */}
      <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
        {/* Plan Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            disabled={isChangingPlan}
            className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors ${
              isChangingPlan ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>{planBadge.icon}</span>
            {!isMobile && <span>{isChangingPlan ? 'Alterando...' : planBadge.label}</span>}
            <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 ${isChangingPlan ? 'animate-spin' : ''}`} />
          </button>

          {showPlanMenu && (
            <div className={`absolute right-0 mt-2 ${isMobile ? 'w-64' : 'w-72'} bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto plan-dropdown`}>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Trocar Plano</p>
                <button
                  onClick={() => setShowPlanMenu(false)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* Free Plan */}
              <button
                onClick={() => handlePlanChange(null)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentPlanType === 'free' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <span className="text-lg mt-0.5">🆓</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">Free</span>
                        {currentPlanType === 'free' && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            ATUAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        10 análises/mês (simulação)
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Paid Plans */}
              {stripeProducts.map((product) => {
                const isActive = currentPlan?.priceId === product.priceId;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => handlePlanChange(product.priceId)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <span className="text-lg mt-0.5">
                          {product.name === 'Trader' && '🚀'}
                          {product.name === 'Alpha Pro' && '⭐'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{product.name}</span>
                            {isActive && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                ATUAL
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {product.name === 'Trader' && '120 análises/mês'}
                            {product.name === 'Alpha Pro' && '350 análises/mês'}
                          </p>
                        </div>
                      </div>
                    </div>
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
            className="flex items-center space-x-1 md:space-x-2 p-1 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </div>
            )}
            {!isMobile && (
              <>
                <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </>
            )}
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 ${isMobile ? 'w-44' : 'w-48'} bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50`}>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button
                onClick={() => {
                  navigateTo('settings');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Configurações</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 Logout button clicked');
                  setShowUserMenu(false);
                  
                  // Show immediate visual feedback
                  const overlay = document.createElement('div');
                  overlay.id = 'logout-overlay';
                  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
                  overlay.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                      <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p class="text-gray-700">Saindo...</p>
                    </div>
                  `;
                  document.body.appendChild(overlay);
                  
                  logout();
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