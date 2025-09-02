import React from 'react';
import { Clock, TrendingUp, TrendingDown, Pause } from 'lucide-react';
import { Analysis } from '../../types';
import { useAnalysis } from '../../hooks/useAnalysis';

interface AnalysisHistoryProps {
  analyses: Analysis[];
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ analyses }) => {
  const { analiseIA } = useAnalysis();

  // Função para formatar timestamp de forma amigável
  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '🔥 Agora mesmo';
    if (diffInMinutes < 60) return `⏰ ${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `🕐 ${Math.floor(diffInMinutes / 60)}h atrás`;
    if (diffInMinutes < 10080) return `📅 ${Math.floor(diffInMinutes / 1440)} dias atrás`;
    return `📆 ${date.toLocaleDateString('pt-BR')}`;
  };

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Análises Anteriores
        </h3>
        <p className="text-gray-500 text-center py-8">
          Nenhuma análise realizada ainda. Faça upload de um gráfico para começar.
        </p>
      </div>
    );
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'buy':
      case 'comprar':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sell':
      case 'vender':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Pause className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'buy':
      case 'comprar':
        return 'text-green-600 bg-green-50';
      case 'sell':
      case 'vender':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Análises Anteriores
      </h3>
      
      <div className="space-y-3">
        {analyses.slice(0, 5).map((analysis) => (
          <div key={analysis.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{analysis.symbol}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRecommendationColor(analysis.recommendation)}`}>
                  {getRecommendationIcon(analysis.recommendation)}
                  <span>{analysis.recommendation.toUpperCase()}</span>
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatTimestamp(analysis.timestamp)}
              </span>
            </div>
            
            {/* Resposta da IA */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-gray-900 mb-3">🧠 Resposta da Tickrify IA:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm"><span className="font-medium">📌 Indicação:</span> {analysis.aiDecision?.action || analysis.recommendation}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm"><span className="font-medium">📊 Confiança:</span> {analysis.confidence}%</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-sm"><span className="font-medium">📈 Justificativa:</span> {analysis.reasoning}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">⏱️ Horizonte:</span>
                  <span className="ml-2 text-blue-600">{analysis.aiDecision?.marketContext || 'Curto prazo'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">⚠️ Risco:</span>
                  <span className="ml-2 text-orange-600">{analysis.aiDecision?.riskLevel || 'MEDIUM'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              {analysis.imageData && (
                <img 
                  src={analysis.imageData} 
                  alt="Gráfico analisado" 
                  className="w-16 h-12 object-cover rounded border"
                />
              )}
              <div className="text-right">
                <div className="text-gray-600">
                  Preço Alvo: <span className="font-medium">${analysis.targetPrice?.toLocaleString()}</span>
                </div>
                <div className="text-gray-600">
                  Stop Loss: <span className="font-medium">${analysis.stopLoss?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {analyses.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todas as análises ({analyses.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;