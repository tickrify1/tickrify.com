import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalysis } from '../hooks/useAnalysis';
import { usePerformance } from '../hooks/usePerformance';
import { useSignals } from '../hooks/useSignals';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionModal } from '../components/Subscription/SubscriptionModal';
import ChartUpload from '../components/Analysis/ChartUpload';
import AnalysisResults from '../components/Analysis/AnalysisResults';
import AnalysisHistory from '../components/Analysis/AnalysisHistory';
import { Zap, Brain, BarChart3, Activity, Crown, Target, Clock, Star } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { currentAnalysis, analyses, monthlyUsage, planLimits } = useAnalysis();
  const { performance } = usePerformance();
  const { signals } = useSignals();
  const { getPlanType, hasActiveSubscription } = useSubscription();
  
  const planType = getPlanType();
  const currentLimit = planLimits[planType];
  const usagePercentage = currentLimit === Infinity ? 0 : (monthlyUsage.count / currentLimit) * 100;

  const getPlanBadge = () => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-100 text-gray-700', icon: '🆓' },
      trader: { label: 'Trader', color: 'bg-blue-100 text-blue-700', icon: '🚀' },
      alpha_pro: { label: 'Alpha Pro', color: 'bg-purple-100 text-purple-700', icon: '⭐' }
    };
    return badges[planType] || badges.free;
  };

  const planBadge = getPlanBadge();

  // Bloqueio de recursos para quem não tem plano real trader
  const isTrader = hasActiveSubscription() && planType === 'trader';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {!isTrader && (
        <div className="max-w-2xl mx-auto mt-8 mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <strong>Recursos avançados bloqueados:</strong> Faça upgrade para o plano Trader para liberar análises reais, sinais automáticos e ferramentas avançadas.
        </div>
      )}
      
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* Header Principal */}
        <div className="text-center relative">
          <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Dashboard Tickrify
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-6">
              Bem-vindo, {user?.name || 'Trader'}! Análise IA + Trading Inteligente
            </p>
            
            {/* Plan Badge */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="px-6 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium flex items-center space-x-2">
                <span className="text-lg">{planBadge.icon}</span>
                <span>Plano {planBadge.label}</span>
                {hasActiveSubscription() && <Crown className="w-5 h-5" />}
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats Card */}
        <div className="relative">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Uso Mensal - Plano {planType.toUpperCase()}
                  </h2>
                    <p className="text-white/90 text-sm">
                    Acompanhe seu consumo de análises IA
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">{monthlyUsage.count}</p>
                  <p className="text-gray-600 font-medium">Análises Utilizadas</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {currentLimit === Infinity ? '∞' : currentLimit}
                  </p>
                  <p className="text-gray-600 font-medium">Limite Mensal</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-purple-600" />
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold mb-2 ${
                    usagePercentage > 80 ? 'text-red-600' : 
                    usagePercentage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {currentLimit === Infinity ? '∞' : `${usagePercentage.toFixed(0)}%`}
                  </p>
                  <p className="text-gray-600 font-medium">Uso Atual</p>
                </div>
              </div>
              
              {currentLimit !== Infinity && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progresso do Mês</span>
                    <span className={`text-sm font-medium ${
                      usagePercentage > 80 ? 'text-red-600' : 
                      usagePercentage > 60 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {monthlyUsage.count}/{currentLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        usagePercentage > 80 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                        usagePercentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  {usagePercentage >= 90 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 font-medium mb-2">
                        🚨 Crítico: Apenas {currentLimit - monthlyUsage.count} análises restantes!
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-red-800 hover:text-red-900 font-medium text-sm underline"
                      >
                        Fazer upgrade agora →
                      </button>
                    </div>
                  )}
                  {usagePercentage >= 80 && usagePercentage < 90 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-medium mb-2">
                        ⚠️ Atenção: {currentLimit - monthlyUsage.count} análises restantes
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
                      >
                        Considere fazer upgrade →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Análise de Gráficos */}
        <div className="relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Análise de Gráficos com IA
                  </h2>
                  <p className="text-sm sm:text-base text-white/80 break-words">
                    {planType === 'free' ? 'Análise simulada para demonstração' : 'Análise avançada com Tickrify IA'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {!isTrader && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                  Faça upgrade para o plano Trader para liberar upload real de gráficos.
                </div>
              )}
              <ChartUpload />
            </div>
          </div>
        </div>

        {/* Resultado da Análise */}
        {currentAnalysis && (
          <div className="relative">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-600 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Resultado da Análise
                    </h2>
                    <p className="text-white/80">
                      Análise completa com recomendações
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                {!isTrader && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                    Faça upgrade para o plano Trader para ver resultados reais de análise.
                  </div>
                )}
                <AnalysisResults analysis={currentAnalysis} />
              </div>
            </div>
          </div>
        )}


        {/* Análises Anteriores */}
        {analyses.length > 0 && (
          <div className="relative">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-600 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Análises Anteriores
                    </h2>
                    <p className="text-white/80">
                      Histórico das suas análises
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <AnalysisHistory analyses={analyses} />
              </div>
            </div>
          </div>
        )}

        {/* Empty State para novos usuários */}
        {!currentAnalysis && analyses.length === 0 && signals.length === 0 && performance.totalAnalyses === 0 && (
          <div className="relative">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Star className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Comece sua Jornada no Trading
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Faça upload de um gráfico para receber sua primeira análise com IA. 
                  {planType === 'free' 
                    ? ' Você tem 10 análises gratuitas para testar nossa plataforma!'
                    : ' Aproveite suas análises ilimitadas com IA real!'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">1. Upload do Gráfico</h4>
                    <p className="text-blue-700 text-sm">Envie uma imagem do seu gráfico de trading</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-green-900 mb-2">2. Análise IA</h4>
                    <p className="text-green-700 text-sm">Nossa IA analisa padrões e indicadores</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-medium text-purple-900 mb-2">3. Recomendações</h4>
                    <p className="text-purple-700 text-sm">Receba sinais BUY/SELL com confiança</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Aviso Legal */}
      <div className="relative">
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Importante: Não Aconselhamento Financeiro
              </h3>
              <p className="text-yellow-800 leading-relaxed">
                Todas as análises fornecidas são apenas para fins educacionais e informativos. 
                Negociar envolve risco. Sempre conduza sua própria pesquisa e considere consultar 
                um consultor financeiro antes de tomar decisões de investimento.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <SubscriptionModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default Dashboard;