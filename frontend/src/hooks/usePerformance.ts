import { useLocalStorage } from './useLocalStorage';
import { Analysis } from '../types';

interface PerformanceData {
  totalAnalyses: number;
  buySignals: number;
  sellSignals: number;
  holdSignals: number;
  avgConfidence: number;
  highConfidenceCount: number;
  lastAnalysisDate: Date | null;
  symbols: string[];
  recommendations: {
    BUY: number;
    SELL: number;
    HOLD: number;
  };
}

const initialPerformance: PerformanceData = {
  totalAnalyses: 0,
  buySignals: 0,
  sellSignals: 0,
  holdSignals: 0,
  avgConfidence: 0,
  highConfidenceCount: 0,
  lastAnalysisDate: null,
  symbols: [],
  recommendations: {
    BUY: 0,
    SELL: 0,
    HOLD: 0
  }
};

function getInitialPerformance(): PerformanceData {
  return {
    totalAnalyses: 0,
    buySignals: 0,
    sellSignals: 0,
    holdSignals: 0,
    avgConfidence: 0,
    highConfidenceCount: 0,
    lastAnalysisDate: null,
    symbols: [],
    recommendations: {
      BUY: 0,
      SELL: 0,
      HOLD: 0
    }
  };
}

export function usePerformance() {
  const [performance, setPerformance] = useLocalStorage<PerformanceData>('tickrify-performance', getInitialPerformance());

  const updatePerformanceFromAnalysis = (analysis: Analysis) => {
    setPerformance(prev => {
      const newSymbols = prev.symbols.includes(analysis.symbol) 
        ? prev.symbols 
        : [...prev.symbols, analysis.symbol];

      const newRecommendations = {
        ...prev.recommendations,
        [analysis.recommendation]: prev.recommendations[analysis.recommendation] + 1
      };

      const totalAnalyses = prev.totalAnalyses + 1;
      const newAvgConfidence = ((prev.avgConfidence * prev.totalAnalyses) + analysis.confidence) / totalAnalyses;
      
      return {
        totalAnalyses,
        buySignals: analysis.recommendation === 'BUY' ? prev.buySignals + 1 : prev.buySignals,
        sellSignals: analysis.recommendation === 'SELL' ? prev.sellSignals + 1 : prev.sellSignals,
        holdSignals: analysis.recommendation === 'HOLD' ? prev.holdSignals + 1 : prev.holdSignals,
        avgConfidence: newAvgConfidence,
        highConfidenceCount: analysis.confidence >= 80 ? prev.highConfidenceCount + 1 : prev.highConfidenceCount,
        lastAnalysisDate: new Date(),
        symbols: newSymbols,
        recommendations: newRecommendations
      };
    });
  };

  const resetPerformance = () => {
    setPerformance(initialPerformance);
  };

  return {
    performance,
    updatePerformanceFromAnalysis,
    resetPerformance
  };
}