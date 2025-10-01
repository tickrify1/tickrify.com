import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { useNavigation } from './hooks/useNavigation';
import Dashboard from './pages/Dashboard';
import { Signals } from './pages/Signals';
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { Landing } from './pages/Landing';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { useSubscription } from './hooks/useSubscription';
import { SubscriptionModal } from './components/Subscription/SubscriptionModal';

function App() {
  const { currentPage, navigateTo } = useNavigation();
  const { isMobile } = useDeviceDetection();
  const { isLoaded } = useUser();
  const { switchPlan, getPlanType } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handler = () => setShowSubscriptionModal(true);
    window.addEventListener('upgradeRequired', handler);
    return () => window.removeEventListener('upgradeRequired', handler);
  }, []);

  // Navegar para página de sucesso quando evento global for emitido
  useEffect(() => {
    const handleNavigateSuccess = () => {
      navigateTo('success');
      try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
    };
    window.addEventListener('navigateToSuccess', handleNavigateSuccess as any);
    return () => window.removeEventListener('navigateToSuccess', handleNavigateSuccess as any);
  }, [navigateTo]);

  // Navegar para dashboard quando plano for liberado imediatamente
  useEffect(() => {
    const handleNavigateDashboard = () => {
      navigateTo('dashboard');
      try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
    };
    window.addEventListener('navigateToDashboard', handleNavigateDashboard as any);
    return () => window.removeEventListener('navigateToDashboard', handleNavigateDashboard as any);
  }, [navigateTo]);

  // Re-render global quando assinatura muda (para refletir limites/planos)
  useEffect(() => {
    const onSubUpdated = () => {
      // Forçar um pequeno update de estado que reflita na UI
      setSidebarCollapsed((v) => v);
    };
    window.addEventListener('subscriptionUpdated', onSubUpdated as any);
    return () => window.removeEventListener('subscriptionUpdated', onSubUpdated as any);
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando Tickrify...</p>
        </div>
      </div>
    );
  }
  // Função para teste de planos
  const handlePlanSwitch = async (priceId: string | null) => {
    try {
      const result = await switchPlan(priceId);
      if (result.success) {
        try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
        if (priceId) {
          navigateTo('dashboard');
        }
      }
    } catch (error) {
      console.error('Erro ao trocar plano:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'signals':
        return <Signals />;
      case 'success':
        return <Success />;
      case 'cancel':
        return <Cancel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen flex flex-col">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
            onPlanSwitch={handlePlanSwitch}
            currentPlanType={getPlanType()}
          />
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className={`${
            isMobile 
              ? `fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'fixed left-0 top-0 h-screen z-30'
          }`}>
            <Sidebar 
              currentPage={currentPage} 
              onNavigate={(page) => {
                navigateTo(page);
                if (isMobile) setSidebarOpen(false);
              }}
              isMobile={isMobile}
              onCollapsedChange={(collapsed) => {
                setSidebarCollapsed(collapsed);
                try { document.body.classList.toggle('sidebar-collapsed', collapsed); } catch {}
              }}
            />
          </div>

          <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${
            !isMobile ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''
          }`}>
            <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
              {renderPage()}
            </main>
          </div>

          {showSubscriptionModal && (
            <SubscriptionModal
              isOpen={showSubscriptionModal}
              onClose={() => setShowSubscriptionModal(false)}
              initialPlanId={pendingPlanId}
            />
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <Landing />
      </SignedOut>
    </>
  );
}

export default App;