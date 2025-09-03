import { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { MobileOptimizer } from './components/Layout/MobileOptimizer';
import { useNavigation } from './hooks/useNavigation';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { Signals } from './pages/Signals';
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { Landing } from './pages/Landing';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';

function App() {
  try {
    console.log('🏁 App iniciando...');
    
    console.log('🔌 Carregando hooks...');
    const { currentPage, navigateTo } = useNavigation();
    console.log('✅ useNavigation loaded:', currentPage);
    
    const { isMobile } = useDeviceDetection();
    console.log('✅ useDeviceDetection loaded:', { isMobile });
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    console.log('✅ useState initialized');
    
    const { isAuthenticated, isLoading, user } = useAuth();
    console.log('✅ useAuth loaded:', { isAuthenticated, isLoading, user: user?.id });
    
    const { switchPlan, getPlanType } = useSubscription();
    console.log('✅ useSubscription loaded');

    console.log('Hooks carregados com sucesso:', {
      currentPage,
      isMobile,
      isAuthenticated,
      isLoading,
      user: isAuthenticated ? 'authenticated' : 'not authenticated'
    });

    // Debug do estado de autenticação
    console.log('🔍 App: Estado detalhado de autenticação:', {
      isAuthenticated,
      isLoading,
      userExists: !!isAuthenticated,
      timestamp: new Date().toISOString()
    });

    // Show loading spinner while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      );
    }

    // Renderizar páginas baseado na navegação
    const renderCurrentPage = () => {
      console.log('🎨 Renderizando página:', currentPage);
      
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
      console.log('🚪 Not authenticated, showing Landing page');
      return (
        <MobileOptimizer>
          <Landing />
        </MobileOptimizer>
      );
    }

    console.log('✅ Authenticated, showing main app');

    return (
      <MobileOptimizer>
        <div className="flex min-h-screen bg-gray-50">
          {/* Mobile overlay for sidebar */}
          {sidebarOpen && isMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`${
            isMobile
              ? sidebarOpen
                ? 'fixed left-0 top-0 h-screen z-50 transform translate-x-0 transition-transform duration-300 ease-in-out'
                : 'fixed left-0 top-0 h-screen z-50 transform -translate-x-full transition-transform duration-300 ease-in-out'
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
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              isAuthenticated={isAuthenticated}
              user={user}
              currentPlanType={getPlanType()}
            />

            {/* Main content area */}
            <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
              {renderCurrentPage()}
            </main>
          </div>
        </div>
      </MobileOptimizer>
    );

  } catch (error) {
    console.error('Erro no App:', error);
    return (
      <MobileOptimizer>
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ❌ Erro na aplicação
            </h1>
            <p className="text-gray-700 mb-4">
              Houve um erro ao carregar a aplicação.
            </p>
            <pre className="text-xs bg-gray-100 p-3 rounded mb-4 overflow-auto">
              {String(error)}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </MobileOptimizer>
    );
  }
}

export default App;
