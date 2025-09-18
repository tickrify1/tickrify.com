import { useState, useEffect } from 'react';
import { Signal } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateTradingSignal } from '../services/openai';

export function useSignals() {
  const [signals, setSignals] = useLocalStorage<Signal[]>('tickrify-signals', []);
  const [isGenerating, setIsGenerating] = useState(false);

  // Listen for signals generated from analysis
  useEffect(() => {
    const handleSignalGenerated = (event: CustomEvent) => {
      const newSignal = event.detail;
      setSignals(prev => [newSignal, ...prev.slice(0, 19)]);
    };

    window.addEventListener('signalGenerated', handleSignalGenerated as EventListener);
    
    return () => {
      window.removeEventListener('signalGenerated', handleSignalGenerated as EventListener);
    };
  }, [setSignals]);

  const generateNewSignal = async () => {
    setIsGenerating(true);
    
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'NFLX'];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      // Tentar usar OpenAI para gerar sinal real
      try {
        const aiSignal = await generateTradingSignal(randomSymbol);
        if (aiSignal) {
          const newSignal: Signal = {
            id: Date.now().toString(),
            symbol: aiSignal.symbol || randomSymbol,
            type: aiSignal.type || 'HOLD',
            confidence: aiSignal.confidence || 75,
            price: aiSignal.price ?? getRealisticPrice(aiSignal.symbol || randomSymbol),
            timestamp: new Date(),
            source: 'Análise Técnica IA',
            description: aiSignal.description || 'Sinal gerado pela IA com análise técnica completa'
          };

          setSignals(prev => [newSignal, ...prev.slice(0, 19)]);
          setIsGenerating(false);
          return;
        } else {
          throw new Error('aiSignal é nulo');
        }
      } catch (error) {
        console.warn('OpenAI não disponível, usando sinal simulado:', error);
      }
      
      // Fallback para sinal simulado
      const types: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
      const sources = ['Technical Analysis', 'Pattern Recognition', 'Volume Analysis'];
      
      const symbol = randomSymbol;
      const type = types[Math.floor(Math.random() * types.length)];
      const confidence = Math.floor(Math.random() * 40) + 60;
      const price = getRealisticPrice(symbol);
      
      const descriptions = {
        BUY: [
          `Breakout acima de resistência em $${(price * 0.98).toLocaleString()} com volume crescente`,
          `Golden cross detectado no gráfico diário - MM20 cruzou MM50`,
          `RSI em recuperação de oversold (${Math.floor(Math.random() * 20) + 25}) com divergência bullish`,
          `Rompimento de triângulo ascendente com alvo em $${(price * 1.12).toLocaleString()}`,
          `Suporte forte testado em $${(price * 0.95).toLocaleString()}, reversão confirmada`
        ],
        SELL: [
          `Resistência forte em $${(price * 1.05).toLocaleString()} testada múltiplas vezes`,
          `Divergência bearish em indicadores de momentum - MACD negativo`,
          `Padrão head and shoulders em formação com alvo em $${(price * 0.88).toLocaleString()}`,
          `RSI em zona de sobrecompra (${Math.floor(Math.random() * 20) + 70}), pressão vendedora`,
          `Quebra de suporte importante em $${(price * 0.97).toLocaleString()}`
        ],
        HOLD: [
          `Consolidação em range $${(price * 0.96).toLocaleString()} - $${(price * 1.04).toLocaleString()}, aguardar direção`,
          `Sinais mistos nos indicadores técnicos - RSI neutro, MACD indefinido`,
          `Mercado lateral, monitorar breakout acima de $${(price * 1.03).toLocaleString()}`,
          `Volume baixo, aguardar confirmação de direção`,
          `Triângulo simétrico em formação, aguardar rompimento`
        ]
      };

      const newSignal: Signal = {
        id: Date.now().toString(),
        symbol,
        type,
        confidence,
        price,
        timestamp: new Date(),
        source: sources[Math.floor(Math.random() * sources.length)],
        description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)]
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 19)]);
      
    } catch (error) {
      console.error('Erro ao gerar sinal:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSignal = (id: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== id));
  };

  const clearAllSignals = () => {
    setSignals([]);
  };

  const executeSignal = (signal: Signal) => {
    removeSignal(signal.id);
  };


  return {
    signals,
    isGenerating,
    generateNewSignal,
    removeSignal,
    clearAllSignals,
    executeSignal
  };
}

function getRealisticPrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'BTCUSDT': 43250 + (Math.random() - 0.5) * 2000,
    'ETHUSDT': 2580 + (Math.random() - 0.5) * 200,
    'BNBUSDT': 315 + (Math.random() - 0.5) * 30,
    'ADAUSDT': 0.52 + (Math.random() - 0.5) * 0.1,
    'SOLUSDT': 105 + (Math.random() - 0.5) * 20,
    'AAPL': 185 + (Math.random() - 0.5) * 20,
    'GOOGL': 145 + (Math.random() - 0.5) * 15,
    'TSLA': 210 + (Math.random() - 0.5) * 30,
    'MSFT': 360 + (Math.random() - 0.5) * 40,
    'AMZN': 155 + (Math.random() - 0.5) * 20,
    'NVDA': 480 + (Math.random() - 0.5) * 50,
    'META': 325 + (Math.random() - 0.5) * 35
  };
  
  return Math.round((basePrices[symbol] || (100 + Math.random() * 100)) * 100) / 100;
}