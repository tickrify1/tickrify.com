import { useState } from 'react';
import { BarChart3, Brain, Zap, Target, CheckCircle, TrendingUp, Users, Clock, Crown, X, Star, ArrowRight } from 'lucide-react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { SubscriptionModal } from '../components/Subscription/SubscriptionModal';
import { useAuth } from '../hooks/useAuth';

export function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { register } = useAuth();

  const handleGetStarted = () => {
    console.log('🚀 handleGetStarted called - opening register form');
    setAuthMode('register');
    setShowAuth(true);
  };

  const handleTestFree = async () => {
    console.log('🆓 Starting FREE test account creation...');
    
    try {
      const randomId = Math.random().toString(36).substr(2, 9);
      const testName = `Usuário Teste ${randomId}`;
      const testEmail = `teste${randomId}@demo.com`;
      
      console.log('Creating test account:', { testName, testEmail });
      
      const result = await register(testName, testEmail, 'password123');
      
      console.log('Register result:', result);
      
      if (result.success) {
        console.log('✅ FREE account created successfully');
        // The register function should already set the user in state
        // The App component will detect this and render the dashboard
      } else {
        console.error('❌ Failed to create FREE account:', result.error);
        alert('Erro ao criar conta de teste. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Error creating FREE account:', error);
      alert('Erro ao criar conta de teste. Tente novamente.');
    }
  };

  const handleLogin = () => {
    console.log('🔑 handleLogin called - opening login form');
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {authMode === 'login' ? (
              <LoginForm 
                onSwitchToRegister={switchAuthMode}
                onClose={handleCloseAuth}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={switchAuthMode}
                onClose={handleCloseAuth}
              />
            )}
            
            <div className="mt-6 text-center">
              <button
                onClick={handleCloseAuth}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Voltar para a página inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Tickrify</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogin}
                className="text-white hover:text-blue-200 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 text-white mb-8">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">Plataforma de Trading com IA</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Trading com
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> IA Avançada</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Análise técnica automatizada, sinais em tempo real e insights poderosos para maximizar seus resultados no trading.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl"
              >
                <span className="flex items-center space-x-2">
                  <span>Ver Planos</span>
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
              
              <button
                onClick={handleLogin}
                className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
              >
                Já tenho conta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold mb-2">15,000+</h3>
              <p className="text-blue-200">Traders Ativos</p>
            </div>
            
            <div className="text-white">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold mb-2">89.3%</h3>
              <p className="text-blue-200">Taxa de Acerto</p>
            </div>
            
            <div className="text-white">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold mb-2">24/7</h3>
              <p className="text-blue-200">Monitoramento IA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Tudo que você precisa para ter sucesso no trading, powered by IA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Análise IA Avançada</h3>
              <p className="text-blue-200">
                Upload de gráficos com análise automática por IA. Identifica padrões, suportes, resistências e gera recomendações precisas.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Sinais em Tempo Real</h3>
              <p className="text-blue-200">
                Receba sinais de BUY/SELL automaticamente com níveis de confiança e análise técnica completa para cada recomendação.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Dashboard Completo</h3>
              <p className="text-blue-200">
                Acompanhe performance, ROI, taxa de acerto e métricas detalhadas. Visualize seu progresso com gráficos interativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Escolha Seu Plano
            </h2>
            <p className="text-xl text-blue-200">
              Teste grátis ou acesse análises profissionais com IA real
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-400/50">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Zap className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">FREE</h3>
                <div className="text-3xl font-bold text-white mb-2">GRATUITO</div>
                <p className="text-red-300 font-semibold">⚠️ Apenas demonstração</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3 text-white">
                  <X className="w-5 h-5 text-red-400" />
                  <span>Análises simuladas (não reais)</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <X className="w-5 h-5 text-red-400" />
                  <span>Sem IA verdadeira</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Interface completa para testes</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Visualização de funcionalidades</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <X className="w-5 h-5 text-red-400" />
                  <span>Sem dados reais de mercado</span>
                </li>
              </ul>
              
              <button
                onClick={handleTestFree}
                className="w-full bg-gray-600 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all transform hover:scale-105"
              >
                Testar Grátis
              </button>
            </div>

            {/* Trader Plan */}
            <div className="bg-gradient-to-br from-blue-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-400/50 hover:border-blue-400 transition-all relative">
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  🚀 RECOMENDADO
                </div>
              </div>
              
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Crown className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">TRADER</h3>
                <div className="text-5xl font-bold text-white mb-2">R$ 59,90</div>
                <p className="text-blue-200">por mês</p>
                <p className="text-emerald-300 font-semibold">🚀 IA Real + Dados Reais</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Análises reais com IA avançada</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Dados de mercado em tempo real</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Análise de imagens de gráficos</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Indicadores técnicos avançados</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Alertas personalizados</span>
                </li>
                <li className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-emerald-700 transition-all transform hover:scale-105"
              >
                Assinar Trader
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para Revolucionar seu Trading?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Junte-se a milhares de traders que já estão usando IA para maximizar seus resultados
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTestFree}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              Começar Gratuitamente
            </button>
          </div>
          
          <p className="text-sm text-blue-300 mt-4">
            Sem cartão de crédito • Cancele a qualquer momento
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Tickrify</span>
            </div>
            
            <div className="text-white/60 text-sm">
              © 2025 Tickrify. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
}