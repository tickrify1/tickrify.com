import { useState, useEffect } from 'react';

export interface PerformanceData {
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  totalReturn: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export const usePerformance = () => {
  const [performance, setPerformance] = useState<PerformanceData>({
    totalTrades: 0,
    winRate: 0,
    profitLoss: 0,
    totalReturn: 0,
    avgWin: 0,
    avgLoss: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento dos dados de performance
    const loadPerformanceData = async () => {
      try {
        setLoading(true);
        
        // Simular dados mock por enquanto
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: PerformanceData = {
          totalTrades: 45,
          winRate: 73.3,
          profitLoss: 12.5,
          totalReturn: 28.7,
          avgWin: 2.8,
          avgLoss: -1.4,
          maxDrawdown: -8.2,
          sharpeRatio: 1.85,
        };
        
        setPerformance(mockData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados de performance');
        console.error('Erro ao carregar performance:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, []);

  const refreshPerformance = async () => {
    setLoading(true);
    // Recarregar dados
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  return {
    performance,
    loading,
    error,
    refreshPerformance,
  };
};
