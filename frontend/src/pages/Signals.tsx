import { useState } from 'react';
import { Zap, TrendingUp, TrendingDown, Minus, Download, Filter, Trash2, BarChart3, Target, Brain, Activity } from 'lucide-react';
import { useSignals } from '../hooks/useSignals';
import { SignalCard } from '../components/Signals/SignalCard';

export function Signals() {
  const { signals, isGenerating, generateNewSignal, removeSignal, clearAllSignals } = useSignals();
  const [filter, setFilter] = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'confidence' | 'symbol'>('time');

  const filteredSignals = signals.filter(signal => 
    filter === 'all' || signal.type === filter
  );

  const sortedSignals = [...filteredSignals].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'time':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleExportSignals = () => {
    const csvContent = [
      'Symbol,Type,Price,Confidence,Source,Description,Timestamp',
      ...filteredSignals.map(signal => 
        `${signal.symbol},${signal.type},${signal.price},${signal.confidence}%,${signal.source},"${signal.description}",${new Date(signal.timestamp).toISOString()}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickrify-signals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSignalStats = () => {
    const buyCount = filteredSignals.filter(s => s.type === 'BUY').length;
    const sellCount = filteredSignals.filter(s => s.type === 'SELL').length;
    const holdCount = filteredSignals.filter(s => s.type === 'HOLD').length;
    const avgConfidence = filteredSignals.length > 0 
      ? (filteredSignals.reduce((sum, s) => sum + s.confidence, 0) / filteredSignals.length).toFixed(1)
      : '0';

    return { buyCount, sellCount, holdCount, avgConfidence, total: filteredSignals.length };
  };

  const stats = getSignalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* Header Principal */}
        <div className="text-center relative">
          <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Sinais IA
              </h1>
            </div>
            
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Sinais de Trading Gerados por Inteligência Artificial
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
              <button
                onClick={generateNewSignal}
                disabled={isGenerating}
                className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                  isGenerating 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>{isGenerating ? 'Gerando...' : 'Gerar Sinal'}</span>
              </button>

              <button
                onClick={handleExportSignals}
                disabled={filteredSignals.length === 0}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>

              <button
                onClick={clearAllSignals}
                disabled={signals.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Trash2 className="w-5 h-5" />
                <span>Limpar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status e Estatísticas */}
        <div className="relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Estatísticas dos Sinais
                  </h2>
                  <p className="text-white/80">
                    Performance e métricas em tempo real
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Sinais BUY</h3>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.buyCount}</p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">Oportunidades de compra</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sinais SELL</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-700">{stats.sellCount}</p>
                  <p className="text-red-600 text-sm mt-1">Oportunidades de venda</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Minus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sinais HOLD</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-700">{stats.holdCount}</p>
                  <p className="text-gray-600 text-sm mt-1">Aguardar momento</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Confiança Média</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{stats.avgConfidence}%</p>
                  <p className="text-blue-600 text-sm mt-1">Precisão da IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Ordenação */}
        <div className="relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  Todos ({signals.length})
                </button>
                <button
                  onClick={() => setFilter('BUY')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'BUY'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  BUY ({stats.buyCount})
                </button>
                <button
                  onClick={() => setFilter('SELL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'SELL'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  SELL ({stats.sellCount})
                </button>
                <button
                  onClick={() => setFilter('HOLD')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'HOLD'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  HOLD ({stats.holdCount})
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'time' | 'confidence' | 'symbol')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="time">Mais Recente</option>
                  <option value="confidence">Maior Confiança</option>
                  <option value="symbol">Símbolo A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Sinais */}
        <div className="relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Sinais Ativos
                  </h2>
                  <p className="text-white/80">
                    Recomendações baseadas em análise técnica
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {sortedSignals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum sinal disponível
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Faça uma análise de gráfico no Dashboard para gerar sinais automáticos baseados na IA.
                  </p>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Ir para Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                  {sortedSignals.map((signal) => (
                    <SignalCard 
                      key={signal.id} 
                      signal={signal} 
                      onRemove={removeSignal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações Educativas */}
        <div className="relative">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Como Interpretar os Sinais
                  </h2>
                  <p className="text-white/80">
                    Guia completo para entender as recomendações da IA
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-green-900">Sinal BUY</h3>
                </div>
                <p className="text-green-700 leading-relaxed">
                  Indica oportunidade de compra baseada em análise técnica. Considere entrada quando múltiplos indicadores confirmam a tendência de alta.
                </p>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-red-900">Sinal SELL</h3>
                </div>
                <p className="text-red-700 leading-relaxed">
                  Sugere oportunidade de venda ou saída de posição. Baseado em indicadores que apontam possível reversão ou enfraquecimento da tendência.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Minus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Sinal HOLD</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Recomenda aguardar melhor momento para operar. Mercado em consolidação ou sinais técnicos mistos que não favorecem entrada imediata.
                </p>
              </div>
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
}