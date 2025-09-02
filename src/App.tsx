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
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';

function App() {
  try {
    console.log('App iniciando...');
    
    const { currentPage, navigateTo } = useNavigation();
    const { isAuthenticated, isLoading } = useAuth();
    const { switchPlan, getPlanType } = useSubscription();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isMobile = window.innerWidth < 768; // Substituir useDeviceDetection

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

    // Handle plan switching
    const handlePlanSwitch = async (priceId: string | null): Promise<void> => {
      try {
        const result = await switchPlan(priceId);
        if (result.success) {
          console.log('Plano alterado com sucesso');
          // No need to reload page, state will update automatically
        } else {
          console.error('Erro ao trocar plano:', result.error);
          throw new Error(result.error || 'Erro ao trocar plano');
        }
      } catch (error) {
        console.error('Erro ao trocar plano:', error);
        throw error;
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
      console.log('🚪 Not authenticated, showing Landing page');
      return <Landing />;
    }

    console.log('✅ Authenticated, showing main app');

    return (
      <div className="flex min-h-screen bg-gray-50">
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
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
            onPlanSwitch={handlePlanSwitch}
            currentPlanType={getPlanType()}
          />
          
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            {renderPage()}
          </main>
        </div>
        
        {/* Session Info for debugging - temporarily disabled */}
        {/* <SessionInfo /> */}
      </div>
    );

  } catch (error) {
    console.error('Erro no App:', error);
    return (
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
    );
  }
}

export default App;