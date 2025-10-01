import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Shield, Brain, BarChart3, Zap, Clock, Star } from 'lucide-react';
import { Analysis } from '../../types';
import ReadMore from '../ReadMore';
import { ChartDashboard } from './ChartDashboard';
import { useAnalysis } from '../../hooks/useAnalysis';

interface AnalysisResultsProps {
  analysis: Analysis;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const { analiseIA } = useAnalysis();

  console.log('🎯 AnalysisResults - analiseIA:', analiseIA);
  console.log('🎯 AnalysisResults - analysis:', analysis);

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
        return TrendingUp;
      case 'SELL':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const Icon = getRecommendationIcon(analysis.recommendation);

  return (
    <div className="space-y-6">
      {/* Resposta da IA - Seção Principal */}
      {analiseIA && (
        <>
        <div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    🧠 Análise Tickrify IA
                  </h2>
                  <p className="text-white/90">
                    Análise técnica profissional
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Indicação Principal */}
              <div className={`p-8 rounded-2xl shadow-lg text-center mb-6 ${
                analiseIA.decisao === 'ENTRAR' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                analiseIA.decisao === 'EVITAR' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                'bg-gradient-to-br from-gray-500 to-blue-600'
              }`}>
                <div className="text-6xl mb-4">
                  {analiseIA.decisao === 'ENTRAR' ? '🚀' :
                   analiseIA.decisao === 'EVITAR' ? '📉' : '⏸️'}
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  📌 {analiseIA.decisao.toUpperCase()}
                </h2>
                <div className="bg-white/20 rounded-xl p-3 inline-block">
                  <p className="text-white font-semibold text-lg">
                    📊 Confiança: {analiseIA.confianca_percentual}%
                  </p>
                </div>
              </div>

              {/* Detalhes da Análise */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Justificativa */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                    📈 Justificativa Técnica
                  </h3>
                  <ReadMore text={analiseIA.justificativa_decisao} maxChars={220} className="text-blue-800" />
                </div>

                {/* Análise Técnica */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                    📉 Análise Técnica
                  </h3>
                  <ReadMore text={analiseIA.analise_tecnica} maxChars={220} className="text-purple-800" />
                </div>

                {/* Indicadores */}
                {analiseIA.indicadores_utilizados && (
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
                      📊 Indicadores Utilizados
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {analiseIA.indicadores_utilizados.map((indicador, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-orange-300 text-center">
                          <p className="text-orange-800 text-sm font-medium">{indicador}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className={`bg-gradient-to-r ${
              analiseIA.indicacao === 'ENTRADA EM COMPRA' ? 'from-emerald-600 to-green-600' :
              analiseIA.indicacao === 'ENTRADA EM VENDA' ? 'from-red-600 to-pink-600' :
              'from-gray-600 to-blue-600'
            } p-6`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    🧠 Análise Tickrify IA
                  </h2>
                  <p className="text-white/90">
                    Análise técnica profissional
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Indicação Principal */}
              <div className={`p-8 rounded-2xl shadow-lg text-center mb-6 ${
                analiseIA.indicacao === 'ENTRADA EM COMPRA' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                analiseIA.indicacao === 'ENTRADA EM VENDA' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                'bg-gradient-to-br from-gray-500 to-blue-600'
              }`}>
                <div className="text-6xl mb-4">
                  {analiseIA.indicacao === 'ENTRADA EM COMPRA' ? '🚀' :
                   analiseIA.indicacao === 'ENTRADA EM VENDA' ? '📉' : '⏸️'}
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  📌 {analiseIA.indicacao.toUpperCase()}
                </h2>
                <div className="bg-white/20 rounded-xl p-3 inline-block">
                  <p className="text-white font-semibold text-lg">
                    📊 Confiança: {analiseIA.confianca}%
                  </p>
                </div>
              </div>

              {/* Detalhes da Análise */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Justificativa */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                    📈 Justificativa Técnica
                  </h3>
                  <p className="text-blue-800 leading-relaxed">{analiseIA.justificativa}</p>
                </div>

                {/* Indicadores */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                    📉 Indicadores Analisados
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium text-purple-900">MACD: {analiseIA.indicadores?.macd}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium text-purple-900">RSI: {analiseIA.indicadores?.rsi}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium text-purple-900">Média Móvel: {analiseIA.indicadores?.media_movel}</p>
                    </div>
                  </div>
                </div>

                {/* Horizonte e Risco */}
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
                    ⏱️ Horizonte & Risco
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium text-orange-900">⏱️ Horizonte: {analiseIA.horizonte}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-medium text-orange-900">⚠️ Risco: {analiseIA.risco}</p>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                    🧾 Observações Finais
                  </h3>
                  <div className="space-y-2">
                    {analiseIA.observacoes?.map((obs, index) => (
                      <div key={index} className="bg-white rounded-lg p-3">
                        <p className="text-green-800 text-sm">• {obs}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Dashboard Completo */}
      <ChartDashboard analysis={analysis} />

      {/* Resumo da Análise */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className={`bg-gradient-to-r ${getRecommendationColor(analysis.recommendation)} p-6`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📊 Resumo da Análise
                </h2>
                <p className="text-white/90">
                  {analysis.symbol} - {analysis.timeframe}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  analysis.recommendation === 'BUY' ? 'bg-emerald-600' :
                  analysis.recommendation === 'SELL' ? 'bg-red-600' :
                  'bg-gray-600'
                }`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {analysis.recommendation === 'BUY' ? '🚀 COMPRAR' :
                   analysis.recommendation === 'SELL' ? '📉 VENDER' :
                   '⏸️ AGUARDAR'}
                </h3>
                <p className="text-gray-600">Recomendação</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 whitespace-nowrap">{analysis.confidence}%</h3>
                <p className="text-gray-600">Confiança</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 whitespace-nowrap">{analysis.timeframe}</h3>
                <p className="text-gray-600">Timeframe</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Análise Detalhada
              </h4>
              <ReadMore text={analysis.reasoning} maxChars={240} className="text-gray-700" />
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default AnalysisResults;