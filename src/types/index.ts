export interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  timestamp: Date;
  source: string;
  description: string;
}

export interface Analysis {
  id: string;
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  timestamp: Date;
  reasoning: string;
  imageData?: string; // Adicionar campo para imagem
  technicalIndicators: TechnicalIndicator[];
  patterns?: Array<{
    nome: string;
    categoria: 'Reversão' | 'Continuação' | 'Indefinição';
    direção: 'Alta' | 'Baixa' | 'Indefinido';
    sinal: string;
    confirmação: string;
    exemplo: string;
    probabilidade: string;
  }>;
  riskManagement?: {
    riskReward: number;
    maxRisk: number;
    positionSize: string;
    stopLoss: number;
    takeProfit: number;
    maxDrawdown: number;
  };
  sentiment?: {
    social: {
      twitter: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      score: number;
    };
    news: {
      impact: 'HIGH' | 'MEDIUM' | 'LOW';
      sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    };
  };
  onChain?: {
    activeAddresses?: number;
    transactionVolume?: number;
    burnRate?: number;
    longTermHolders?: number;
    mvrvRatio?: number;
    dormancyFlow?: number;
  };
  quantitative?: {
    beta: number;
    sharpeRatio: number;
    volatility: number;
    correlation: number;
  };
  marketContext?: {
    trend: string;
    volatility: string;
    volume: string;
    strength: number;
  };
  aiDecision?: {
    action: string;
    description: string;
    candleAnalysis?: string;
    marketContext?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description: string;
}

export interface Trader {
  id: string;
  name: string;
  avatar: string;
  accuracy: number;
  totalTrades: number;
  winRate: number;
  roi: number;
  followers: number;
  verified: boolean;
}

export interface Performance {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  roi: number;
  accuracy: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

export interface Alert {
  id: string;
  type: 'PRICE' | 'SIGNAL' | 'NEWS' | 'TECHNICAL';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  read: boolean;
  symbol?: string;
}

export interface Prediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  trend: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
}