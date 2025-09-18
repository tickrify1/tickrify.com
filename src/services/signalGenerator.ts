// Gerador de sinais baseado em análise técnica real
// Estrutura preparada para IA real e indicadores técnicos

import { marketDataService, MarketPrice, TechnicalIndicators } from './marketData';
import { Signal } from '../types';

export interface SignalConfig {
  rsiOverbought: number;
  rsiOversold: number;
  macdThreshold: number;
  volumeThreshold: number;
  confidenceThreshold: number;
  maxSignalsPerHour: number;
}

export interface SignalCriteria {
  rsiSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  macdSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  maSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  volumeSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  priceActionSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  overallConfidence: number;
}

export class SignalGenerator {
  private static instance: SignalGenerator;
  private config: SignalConfig;
  private lastSignals: Map<string, Date> = new Map();

  constructor() {
    this.config = {
      rsiOverbought: 70,
      rsiOversold: 30,
      macdThreshold: 0,
      volumeThreshold: 1.2, // 20% acima da média
      confidenceThreshold: 60,
      maxSignalsPerHour: 3
    };
  }

  static getInstance(): SignalGenerator {
    if (!SignalGenerator.instance) {
      SignalGenerator.instance = new SignalGenerator();
    }
    return SignalGenerator.instance;
  }

  // TODO: Implementar análise técnica real com IA
  async generateSignal(symbol: string): Promise<Signal | null> {
    try {
      console.log(`🔍 Analisando ${symbol} para gerar sinal...`);

      // Verificar rate limiting
      if (!this.canGenerateSignal(symbol)) {
        console.log(`⏰ Rate limit atingido para ${symbol}`);
        return null;
      }

      // Buscar dados de mercado
      const marketPrice = await marketDataService.getMarketPrice(symbol);
      const indicators = await marketDataService.getTechnicalIndicators(symbol);

      // Analisar critérios técnicos
      const criteria = this.analyzeTechnicalCriteria(marketPrice, indicators);

      // Verificar se atende threshold de confiança
      if (criteria.overallConfidence < this.config.confidenceThreshold) {
        console.log(`📊 Confiança baixa para ${symbol}: ${criteria.overallConfidence}%`);
        return null;
      }

      // Determinar tipo de sinal
      const signalType = this.determineSignalType(criteria);

      // Gerar descrição detalhada
      const description = this.generateSignalDescription(criteria, indicators);

      // Criar sinal
      const signal: Signal = {
        id: `${symbol}_${Date.now()}`,
        symbol,
        type: signalType,
        confidence: Math.round(criteria.overallConfidence),
        price: marketPrice.price,
        timestamp: new Date(),
        source: 'Análise Técnica IA',
        description
      };

      // Registrar último sinal
      this.lastSignals.set(symbol, new Date());

      console.log(`✅ Sinal gerado para ${symbol}: ${signalType} (${signal.confidence}%)`);
      return signal;

    } catch (error) {
      console.error(`❌ Erro ao gerar sinal para ${symbol}:`, error);
      return null;
    }
  }

  // TODO: Implementar análise técnica real
  private analyzeTechnicalCriteria(price: MarketPrice, indicators: TechnicalIndicators): SignalCriteria {
    // Análise RSI
    const rsiSignal = this.analyzeRSI(indicators.rsi);
    
    // Análise MACD
    const macdSignal = this.analyzeMACD(indicators.macd);
    
    // Análise Médias Móveis
    const maSignal = this.analyzeMovingAverages(price.price, indicators.movingAverages);
    
    // Análise Volume
    const volumeSignal = this.analyzeVolume(indicators.volume);
    
    // Análise Price Action
    const priceActionSignal = this.analyzePriceAction(price, indicators);

    // Calcular confiança geral
    const signals = [rsiSignal, macdSignal, maSignal, volumeSignal, priceActionSignal];
    const buySignals = signals.filter(s => s === 'BUY').length;
    const sellSignals = signals.filter(s => s === 'SELL').length;
    const neutralSignals = signals.filter(s => s === 'NEUTRAL').length;

    let overallConfidence = 0;
    if (buySignals > sellSignals) {
      overallConfidence = (buySignals / signals.length) * 100;
    } else if (sellSignals > buySignals) {
      overallConfidence = (sellSignals / signals.length) * 100;
    } else {
      overallConfidence = 50; // Neutro
    }

    return {
      rsiSignal,
      macdSignal,
      maSignal,
      volumeSignal,
      priceActionSignal,
      overallConfidence
    };
  }

  private analyzeRSI(rsi: number): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (rsi <= this.config.rsiOversold) return 'BUY';
    if (rsi >= this.config.rsiOverbought) return 'SELL';
    return 'NEUTRAL';
  }

  private analyzeMACD(macd: TechnicalIndicators['macd']): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (macd.macd > macd.signal && macd.histogram > 0) return 'BUY';
    if (macd.macd < macd.signal && macd.histogram < 0) return 'SELL';
    return 'NEUTRAL';
  }

  private analyzeMovingAverages(price: number, ma: TechnicalIndicators['movingAverages']): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (price > ma.ma20 && ma.ma20 > ma.ma50 && ma.ma50 > ma.ma200) return 'BUY';
    if (price < ma.ma20 && ma.ma20 < ma.ma50 && ma.ma50 < ma.ma200) return 'SELL';
    return 'NEUTRAL';
  }

  private analyzeVolume(volume: TechnicalIndicators['volume']): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (volume.ratio >= this.config.volumeThreshold) return 'BUY';
    if (volume.ratio <= (1 / this.config.volumeThreshold)) return 'SELL';
    return 'NEUTRAL';
  }

  private analyzePriceAction(price: MarketPrice, indicators: TechnicalIndicators): 'BUY' | 'SELL' | 'NEUTRAL' {
    const { bollingerBands, supportResistance } = indicators;
    
    // Análise Bollinger Bands
    if (price.price <= bollingerBands.lower) return 'BUY';
    if (price.price >= bollingerBands.upper) return 'SELL';
    
    // Análise Suporte/Resistência
    const nearSupport = supportResistance.support.some(level => 
      Math.abs(price.price - level) / price.price < 0.02
    );
    const nearResistance = supportResistance.resistance.some(level => 
      Math.abs(price.price - level) / price.price < 0.02
    );
    
    if (nearSupport) return 'BUY';
    if (nearResistance) return 'SELL';
    
    return 'NEUTRAL';
  }

  private determineSignalType(criteria: SignalCriteria): 'BUY' | 'SELL' | 'HOLD' {
    const signals = [
      criteria.rsiSignal,
      criteria.macdSignal,
      criteria.maSignal,
      criteria.volumeSignal,
      criteria.priceActionSignal
    ];

    const buyCount = signals.filter(s => s === 'BUY').length;
    const sellCount = signals.filter(s => s === 'SELL').length;

    if (buyCount > sellCount && buyCount >= 3) return 'BUY';
    if (sellCount > buyCount && sellCount >= 3) return 'SELL';
    return 'HOLD';
  }

  private generateSignalDescription(criteria: SignalCriteria, indicators: TechnicalIndicators): string {
    const descriptions: string[] = [];

    // RSI
    if (criteria.rsiSignal === 'BUY') {
      descriptions.push(`RSI em zona de sobrevenda (${indicators.rsi.toFixed(1)})`);
    } else if (criteria.rsiSignal === 'SELL') {
      descriptions.push(`RSI em zona de sobrecompra (${indicators.rsi.toFixed(1)})`);
    }

    // MACD
    if (criteria.macdSignal === 'BUY') {
      descriptions.push('MACD com crossover bullish');
    } else if (criteria.macdSignal === 'SELL') {
      descriptions.push('MACD com crossover bearish');
    }

    // Médias Móveis
    if (criteria.maSignal === 'BUY') {
      descriptions.push('Preço acima das médias móveis (tendência de alta)');
    } else if (criteria.maSignal === 'SELL') {
      descriptions.push('Preço abaixo das médias móveis (tendência de baixa)');
    }

    // Volume
    if (criteria.volumeSignal === 'BUY') {
      descriptions.push('Volume acima da média confirmando movimento');
    }

    // Price Action
    if (criteria.priceActionSignal === 'BUY') {
      descriptions.push('Preço próximo a suporte importante');
    } else if (criteria.priceActionSignal === 'SELL') {
      descriptions.push('Preço próximo a resistência importante');
    }

    return descriptions.length > 0 
      ? descriptions.join('. ') + '.'
      : 'Análise técnica baseada em múltiplos indicadores.';
  }

  private canGenerateSignal(symbol: string): boolean {
    const lastSignal = this.lastSignals.get(symbol);
    if (!lastSignal) return true;

    const hoursSinceLastSignal = (Date.now() - lastSignal.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSignal >= (1 / this.config.maxSignalsPerHour);
  }

  // TODO: Implementar análise de múltiplos timeframes
  async generateMultiTimeframeSignal(symbol: string): Promise<Signal | null> {
    // Aqui será implementada análise em múltiplos timeframes
    // 1m, 5m, 15m, 1h, 4h, 1d
    console.log(`📊 Análise multi-timeframe para ${symbol} (TODO)`);
    return this.generateSignal(symbol);
  }

  // TODO: Implementar backtesting
  async backtestStrategy(symbol: string, days: number): Promise<any> {
    // Aqui será implementado backtesting da estratégia
    console.log(`📈 Backtesting para ${symbol} - ${days} dias (TODO)`);
    return null;
  }

  // Configuração
  updateConfig(newConfig: Partial<SignalConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuração do gerador atualizada:', this.config);
  }

  getConfig(): SignalConfig {
    return { ...this.config };
  }
}

export const signalGenerator = SignalGenerator.getInstance();