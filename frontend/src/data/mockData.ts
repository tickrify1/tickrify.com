// Dados sempre vazios para novos usuários
import { Signal, Analysis, Trader, Performance, MarketData, Alert, Prediction } from '../types';

// Arrays sempre vazios para usuários novos
export const mockSignals: Signal[] = [];
export const mockAnalyses: Analysis[] = [];
export const mockTraders: Trader[] = [];
export const mockAlerts: Alert[] = [];
export const mockPredictions: Prediction[] = [];

// Performance sempre zerada para novos usuários
export const mockPerformance: Performance = {
  totalTrades: 0,
  winRate: 0,
  totalProfit: 0,
  totalLoss: 0,
  roi: 0,
  accuracy: 0,
  sharpeRatio: 0,
  maxDrawdown: 0
};

// Dados de mercado sempre vazios
export const mockMarketData: MarketData[] = [];

// Dados de gráfico sempre vazios
export const chartData = [];