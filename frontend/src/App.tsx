import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { useNavigation } from './hooks/useNavigation';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { Signals } from './pages/Signals';
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { Landing } from './pages/Landing';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';
import { SubscriptionModal } from './components/Subscription/SubscriptionModal';

function App() {
  const { currentPage, navigateTo } = useNavigation();
  const { isMobile } = useDeviceDetection();
  const { isAuthenticated, isLoading } = useAuth();
  const { switchPlan, getPlanType } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // Loading state
  if (isLoading) {
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
    if (priceId) {
      // Se for plano pago, abre modal de pagamento
      setPendingPlanId(priceId);
      setShowSubscriptionModal(true);
      return;
    }
    try {
      const result = await switchPlan(priceId);
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
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
      case 'settings':
        return <Settings />;
      case 'success':
        return <Success />;
      case 'cancel':
        return <Cancel />;
      default:
        return <Dashboard />;
    }
  };

  // Always show landing page when not authenticated
  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        onPlanSwitch={handlePlanSwitch}
        currentPlanType={getPlanType()}
      />
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${
        !isMobile ? 'ml-64' : ''
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
  );
}

export default App;