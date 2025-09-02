import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface AnalysisSavedNotificationProps {
  show: boolean;
  onClose: () => void;
  analysis?: {
    symbol: string;
    recommendation: string;
    confidence: number;
    totalCount: number;
  };
}

const AnalysisSavedNotification: React.FC<AnalysisSavedNotificationProps> = ({ 
  show, 
  onClose, 
  analysis 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Aguardar animação
      }, 4000); // Mostrar por 4 segundos

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show || !analysis) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
    }`}>
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Análise Salva!
              </h3>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300); // Aguardar animação
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span><strong>{analysis.symbol}</strong> - {analysis.recommendation}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-medium">{analysis.confidence}% confiança</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <Clock className="w-3 h-3" />
                <span>Salva no histórico ({analysis.totalCount}/50)</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                ✅ Disponível em "Análises Anteriores" por 30 dias
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSavedNotification;
