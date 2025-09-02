import React from 'react';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

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

interface StatsCardsProps {
  performance: PerformanceData;
}

export function StatsCards({ performance }: StatsCardsProps) {
  const { isMobile } = useDeviceDetection();

  // Só mostrar se houver dados reais
  if (performance.totalAnalyses === 0) {
    return null;
  }

  const stats = [
    {
      label: 'Total de Análises',
      value: performance.totalAnalyses.toString(),
      change: 'Este mês',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Confiança Média',
      value: `${performance.avgConfidence.toFixed(1)}%`,
      change: 'Média geral',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Sinais BUY',
      value: performance.buySignals.toString(),
      change: 'Oportunidades',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Sinais SELL',
      value: performance.sellSignals.toString(),
      change: 'Alertas',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              {!isMobile && (
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  {stat.change}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</p>
              {isMobile && (
                <span className="text-xs font-medium text-gray-500">
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}