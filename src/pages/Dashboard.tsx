import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalysis } from '../hooks/useAnalysis';
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
  const { currentAnalysis, analyses, planLimits } = useAnalysis();
  const { signals } = useSignals();
  const { getPlanType, hasActiveSubscription } = useSubscription();
  
  // Mock performance data (substituindo usePerformance)
  const performance = {
    totalTrades: 45,
    winRate: 73.3,
    profitLoss: 12.5,
    totalReturn: 28.7
  };
  
  const planType = getPlanType();
  const currentLimit = user?.analyses_limit || planLimits[planType] || 0;
  const usageCount = user?.analyses_used || 0;
  const usagePercentage = currentLimit === Infinity ? 0 : (usageCount / currentLimit) * 100;

  const getPlanBadge = () => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-100 text-gray-700', icon: '🆓' },
      trader: { label: 'Trader', color: 'bg-blue-100 text-blue-700', icon: '🚀' },
      alpha_pro: { label: 'Alpha Pro', color: 'bg-purple-100 text-purple-700', icon: '⭐' }
    };
    return badges[planType] || badges.free;
  };

  const planBadge = getPlanBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header Principal */}
        <div className="text-center relative">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900">
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
                {planType === 'free' && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    DEMONSTRAÇÃO
                  </span>
                )}
                {hasActiveSubscription() && planType !== 'free' && <Crown className="w-5 h-5" />}
              </div>
              
              {/* Botão de Upgrade se for FREE */}
              {planType === 'free' && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade para Trader</span>
                </button>
              )}
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
                  <h2 className="text-xl font-semibold text-white">
                    Uso Mensal - Plano {planType.toUpperCase()}
                  </h2>
                  <p className="text-white/90">
                    Acompanhe seu consumo de {planType === 'free' ? 'simulações' : 'análises'} IA
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
                  <p className="text-3xl font-bold text-blue-600 mb-2">{usageCount}</p>
                  <p className="text-gray-600 font-medium">{planType === 'free' ? 'Simulações' : 'Análises'} Utilizadas</p>
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
                  <p className={`text-3xl font-bold mb-2 ${
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
                      {usageCount}/{currentLimit}
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
                        🚨 Crítico: Apenas {currentLimit - usageCount} {planType === 'free' ? 'simulações' : 'análises'} restantes!
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-red-800 hover:text-red-900 font-medium text-sm underline"
                      >
                        {planType === 'free' ? 'Assinar plano Trader →' : 'Fazer upgrade agora →'}
                      </button>
                    </div>
                  )}
                  {usagePercentage >= 80 && usagePercentage < 90 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-medium mb-2">
                        ⚠️ Atenção: {currentLimit - usageCount} {planType === 'free' ? 'simulações' : 'análises'} restantes
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-yellow-800 hover:text-yellow-900 font-medium text-sm underline"
                      >
                        {planType === 'free' ? 'Assinar plano Trader →' : 'Considere fazer upgrade →'}
                      </button>
                    </div>
                  )}
                  
                  {/* Backend Warning/Blocking */}
                  {user?.warning && !user?.blocked && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-2">
                        ⚠️ Aviso: Você está próximo do seu limite mensal de análises!
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-orange-800 hover:text-orange-900 font-medium text-sm underline"
                      >
                        {planType === 'free' ? 'Assinar plano Trader →' : 'Ver opções de upgrade →'}
                      </button>
                    </div>
                  )}
                  
                  {user?.blocked && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 font-medium mb-2">
                        🚫 Bloqueado: Você atingiu o limite mensal de análises!
                      </p>
                      <p className="text-xs text-red-600 mb-2">
                        Suas análises serão renovadas no início do próximo mês.
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="text-red-800 hover:text-red-900 font-medium text-sm underline"
                      >
                        {planType === 'free' ? 'Assinar plano Trader para análises ilimitadas →' : 'Fazer upgrade para mais análises →'}
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
            <div className="bg-blue-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Análise de Gráficos com IA
                  </h2>
                  <p className="text-white/80">
                    Análise avançada com Tickrify IA
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8">
              {/* AI Analysis Features for TRADER users */}
              {planType !== 'free' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    🧠 IA Completa - Indicadores Analisados (TRADER)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-blue-600">📊 RSI (14)</div>
                      <div className="text-gray-600">Sobrecompra/Sobrevenda</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-green-600">📈 MACD</div>
                      <div className="text-gray-600">Momentum & Crossovers</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-purple-600">🎯 Stochastic</div>
                      <div className="text-gray-600">Oscilador de Momentum</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-orange-600">📏 Médias Móveis</div>
                      <div className="text-gray-600">MM20, MM50, MM200</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-red-600">🔊 Volume</div>
                      <div className="text-gray-600">Confirmação de Sinais</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-indigo-600">📐 Bandas Bollinger</div>
                      <div className="text-gray-600">Volatilidade & Squeeze</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-yellow-600">🕯️ Candlesticks</div>
                      <div className="text-gray-600">Padrões de Reversão</div>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <div className="font-bold text-pink-600">📍 S/R</div>
                      <div className="text-gray-600">Suporte & Resistência</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✅ + Fibonacci, Divergências, Confluências, Gestão de Risco e muito mais!
                    </span>
                  </div>
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
                      {planType === 'free' ? 'Simulações' : 'Análises'} Anteriores
                    </h2>
                    <p className="text-white/80">
                      Histórico das suas {planType === 'free' ? 'simulações' : 'análises'}
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
        {!currentAnalysis && analyses.length === 0 && signals.length === 0 && performance.totalTrades === 0 && (
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
                    ? 'Aproveite suas 10 simulações mensais para testar a plataforma!'
                    : 'Aproveite suas 120 análises mensais com IA premium!'
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
        <div className={`rounded-lg border p-6 ${
          planType === 'free' 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              planType === 'free' 
                ? 'bg-orange-600' 
                : 'bg-yellow-600'
            }`}>
              <span className="text-white text-sm font-bold">⚠️</span>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${
                planType === 'free' 
                  ? 'text-orange-900' 
                  : 'text-yellow-900'
              }`}>
                {planType === 'free' 
                  ? '🆓 Plano FREE - Apenas Demonstração'
                  : 'Importante: Não Aconselhamento Financeiro'
                }
              </h3>
              <p className={`leading-relaxed ${
                planType === 'free' 
                  ? 'text-orange-800' 
                  : 'text-yellow-800'
              }`}>
                {planType === 'free' 
                  ? (
                    <>
                      <strong>Todas as análises no plano FREE são simulações</strong> criadas apenas para demonstração da interface. 
                      <strong> Não são análises reais com IA</strong> e não devem ser usadas para trading real. 
                      Para análises verdadeiras com IA avançada, 
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="underline font-semibold hover:text-orange-900 ml-1"
                      >
                        assine o plano Trader →
                      </button>
                    </>
                  )
                  : (
                    <>
                      Todas as análises fornecidas são apenas para fins educacionais e informativos. 
                      Negociar envolve risco. Sempre conduza sua própria pesquisa e considere consultar 
                      um consultor financeiro antes de tomar decisões de investimento.
                    </>
                  )
                }
              </p>
              
              {planType === 'free' && (
                <div className="mt-4 p-3 bg-white border border-orange-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        🚀 Quer análises reais com IA?
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Plano Trader: R$ 59,90/mês - 120 análises reais
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      Assinar Agora
                    </button>
                  </div>
                </div>
              )}
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