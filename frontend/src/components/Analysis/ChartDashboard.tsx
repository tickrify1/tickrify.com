import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, Shield, Zap, Brain, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import { Analysis } from '../../types';

interface ChartDashboardProps {
  analysis: Analysis;
}

export function ChartDashboard({ analysis }: ChartDashboardProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return 'from-emerald-500 to-green-600';
      case 'SELL':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-gray-500 to-blue-600';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return '🚀';
      case 'SELL':
        return '📉';
      default:
        return '⏸️';
    }
  };

  const getRiskLevel = () => {
    if (analysis.confidence >= 80) return { level: 'BAIXO', color: 'text-green-600 bg-green-50', icon: '🟢' };
    if (analysis.confidence >= 60) return { level: 'MÉDIO', color: 'text-yellow-600 bg-yellow-50', icon: '🟡' };
    return { level: 'ALTO', color: 'text-red-600 bg-red-50', icon: '🔴' };
  };

  const riskInfo = getRiskLevel();
  const currentPrice = 42000; // Preço base para cálculos
  const potentialGain = ((analysis.targetPrice - currentPrice) / currentPrice * 100).toFixed(1);
  const potentialLoss = ((currentPrice - analysis.stopLoss) / currentPrice * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">📊 Dashboard do Gráfico</h2>
            <p className="text-blue-100">Análise completa de {analysis.symbol}</p>
          </div>
        </div>
      </div>

      {/* Decisão Principal */}
      <div className={`bg-gradient-to-br ${getRecommendationColor(analysis.recommendation)} rounded-2xl p-8 text-white text-center relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="text-8xl mb-4">
            {getRecommendationIcon(analysis.recommendation)}
          </div>
          <h3 className="text-5xl font-black mb-4">
            {analysis.recommendation === 'BUY' ? 'COMPRA AGORA' : 
             analysis.recommendation === 'SELL' ? 'VENDA AGORA' : 'AGUARDE'}
          </h3>
          <p className="text-xl opacity-90 mb-4">
            Confiança da IA: {analysis.confidence}%
          </p>
          <div className="bg-white/20 rounded-xl p-4 inline-block">
            <p className="font-semibold">
              {analysis.recommendation === 'BUY' ? 'Entrar na operação - Sinais favoráveis' :
               analysis.recommendation === 'SELL' ? 'Sair da posição - Sinais de venda' :
               'Aguardar confirmação - Sinais mistos'}
            </p>
          </div>
        </div>
        
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 text-6xl">📈</div>
          <div className="absolute bottom-4 left-4 text-6xl">💰</div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Preço Atual */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">💰 Preço Atual</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">${currentPrice.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Valor de referência</p>
        </div>

        {/* Preço Alvo */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">🎯 Preço Alvo</h4>
          </div>
          <p className="text-3xl font-bold text-emerald-700">${analysis.targetPrice.toLocaleString()}</p>
          <p className="text-sm text-emerald-600 mt-2">Potencial: +{potentialGain}%</p>
        </div>

        {/* Stop Loss */}
        <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">🛡️ Stop Loss</h4>
          </div>
          <p className="text-3xl font-bold text-red-700">${analysis.stopLoss.toLocaleString()}</p>
          <p className="text-sm text-red-600 mt-2">Risco: -{potentialLoss}%</p>
        </div>

        {/* Nível de Risco */}
        <div className={`bg-white rounded-2xl p-6 border-2 shadow-lg ${
          riskInfo.level === 'BAIXO' ? 'border-green-300' :
          riskInfo.level === 'MÉDIO' ? 'border-yellow-300' :
          'border-red-300'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              riskInfo.level === 'BAIXO' ? 'bg-green-600' :
              riskInfo.level === 'MÉDIO' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">⚠️ Nível de Risco</h4>
          </div>
          <p className={`text-3xl font-bold ${
            riskInfo.level === 'BAIXO' ? 'text-green-700' :
            riskInfo.level === 'MÉDIO' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {riskInfo.icon} {riskInfo.level}
          </p>
          <p className="text-sm text-gray-600 mt-2">Baseado na confiança</p>
        </div>
      </div>

      {/* Indicadores Técnicos */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">⚡ Indicadores Técnicos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysis.technicalIndicators.map((indicator, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{indicator.name}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  indicator.signal === 'BULLISH' ? 'text-emerald-600 bg-emerald-100' :
                  indicator.signal === 'BEARISH' ? 'text-red-600 bg-red-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  {indicator.signal === 'BULLISH' ? '🚀 ALTA' : 
                   indicator.signal === 'BEARISH' ? '📉 BAIXA' : '⏸️ NEUTRO'}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">{indicator.value}</p>
              <p className="text-sm text-gray-600">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Padrões Gráficos */}
      {analysis.patterns && analysis.patterns.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">📈 Padrões Detectados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.patterns.map((pattern, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{pattern.nome}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    pattern.categoria === 'Reversão' ? 'text-red-600 bg-red-100' :
                    pattern.categoria === 'Continuação' ? 'text-emerald-600 bg-emerald-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {pattern.categoria}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-700">Direção:</span>
                    <span className={`font-bold ${
                      pattern.direção === 'Alta' ? 'text-emerald-600' :
                      pattern.direção === 'Baixa' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {pattern.direção === 'Alta' ? '🚀 Alta' :
                       pattern.direção === 'Baixa' ? '📉 Baixa' :
                       '⏸️ Indefinido'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Sinal:</span>
                    <p className="text-gray-800 mt-1">{pattern.sinal}</p>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-gray-700">Probabilidade:</span>
                    <p className="text-orange-600 font-bold">{pattern.probabilidade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Análise da IA */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">🧠 Análise Detalhada da IA</h3>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-blue-200">
          <p className="text-gray-700 leading-relaxed text-lg">{analysis.reasoning}</p>
        </div>
      </div>

      {/* Gestão de Risco */}
      {analysis.riskManagement && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">🛡️ Gestão de Risco</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">📊 Risk/Reward</h4>
              <p className="text-3xl font-bold text-blue-600">{analysis.riskManagement.riskReward}:1</p>
              <p className="text-sm text-blue-600 mt-2">Relação risco/retorno</p>
            </div>
            
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-2">⚠️ Risco Máximo</h4>
              <p className="text-3xl font-bold text-orange-600">{analysis.riskManagement.maxRisk}%</p>
              <p className="text-sm text-orange-600 mt-2">Do capital total</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">💼 Tamanho Posição</h4>
              <p className="text-xl font-bold text-purple-600">{analysis.riskManagement.positionSize}</p>
              <p className="text-sm text-purple-600 mt-2">Recomendado</p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo e Próximos Passos */}
      <div className="bg-gradient-to-r from-gray-800 to-blue-900 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-6">🎯 Resumo e Próximos Passos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-bold mb-3 text-lg">📈 Se for {analysis.recommendation}:</h4>
            <ul className="space-y-2 text-blue-100">
              {analysis.recommendation === 'BUY' ? (
                <>
                  <li>• Aguarde confirmação do breakout</li>
                  <li>• Defina stop loss em ${analysis.stopLoss.toLocaleString()}</li>
                  <li>• Monitore volume de negociação</li>
                  <li>• Alvo principal: ${analysis.targetPrice.toLocaleString()}</li>
                </>
              ) : analysis.recommendation === 'SELL' ? (
                <>
                  <li>• Realize lucros gradualmente</li>
                  <li>• Proteja posição em ${analysis.stopLoss.toLocaleString()}</li>
                  <li>• Monitore rompimento de suportes</li>
                  <li>• Alvo de venda: ${analysis.targetPrice.toLocaleString()}</li>
                </>
              ) : (
                <>
                  <li>• Aguarde definição de direção</li>
                  <li>• Monitore breakout do range</li>
                  <li>• Prepare-se para entrada rápida</li>
                  <li>• Defina níveis de entrada</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-bold mb-3 text-lg">⚠️ Riscos a Monitorar:</h4>
            <ul className="space-y-2 text-blue-100">
              <li>• Mudanças no sentimento do mercado</li>
              <li>• Quebra de níveis importantes</li>
              <li>• Notícias fundamentais relevantes</li>
              <li>• Alterações no volume de negociação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}