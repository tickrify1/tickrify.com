// Hook para gerenciar sinais reais baseados em dados de mercado
import { useState, useEffect, useCallback } from 'react';
import { Signal } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { signalGenerator } from '../services/signalGenerator';
import { marketDataService } from '../services/marketData';

export function useRealSignals() {
  const [signals, setSignals] = useLocalStorage<Signal[]>('tickrify-real-signals', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Símbolos para monitorar
  const watchedSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'
  ];

  // Conectar com API de mercado
  const connectToMarket = useCallback(async () => {
    try {
      setIsGenerating(true);
      console.log('🔌 Conectando com dados de mercado...');
      
      const connected = await marketDataService.connectToAPI();
      setIsConnected(connected);
      
      if (connected) {
        console.log('✅ Conectado com sucesso!');
        // Iniciar monitoramento automático
        startAutoSignalGeneration();
      }
      
      return connected;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Gerar sinal para símbolo específico
  const generateSignalForSymbol = useCallback(async (symbol: string) => {
    if (!isConnected) {
      await connectToMarket();
    }

    setIsGenerating(true);
    
    try {
      console.log(`🎯 Gerando sinal para ${symbol}...`);
      
      const newSignal = await signalGenerator.generateSignal(symbol);
      
      if (newSignal) {
        setSignals(prev => {
          // Remover sinais antigos do mesmo símbolo (manter apenas o mais recente)
          const filtered = prev.filter(s => s.symbol !== symbol);
          return [newSignal, ...filtered].slice(0, 20); // Manter últimos 20 sinais
        });
        
        setLastUpdate(new Date());
        console.log(`✅ Sinal gerado: ${newSignal.type} para ${symbol}`);
        return newSignal;
      } else {
        console.log(`⚠️ Nenhum sinal gerado para ${symbol}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Erro ao gerar sinal para ${symbol}:`, error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isConnected, connectToMarket, setSignals]);

  // Gerar sinal aleatório dos símbolos monitorados
  const generateRandomSignal = useCallback(async () => {
    const randomSymbol = watchedSymbols[Math.floor(Math.random() * watchedSymbols.length)];
    return generateSignalForSymbol(randomSymbol);
  }, [generateSignalForSymbol]);

  // Iniciar geração automática de sinais
  const startAutoSignalGeneration = useCallback(() => {
    console.log('🤖 Iniciando geração automática de sinais...');
    
    // Gerar sinal a cada 2-5 minutos
    const interval = setInterval(async () => {
      if (Math.random() > 0.7) { // 30% de chance
        await generateRandomSignal();
      }
    }, 120000 + Math.random() * 180000); // 2-5 minutos

    // Armazenar referência para poder parar
    (window as any).signalGenerationInterval = interval;
  }, [generateRandomSignal]);

  // Parar geração automática
  const stopAutoSignalGeneration = useCallback(() => {
    if ((window as any).signalGenerationInterval) {
      clearInterval((window as any).signalGenerationInterval);
      console.log('⏹️ Geração automática parada.');
    }
  }, []);

  // Analisar todos os símbolos
  const analyzeAllSymbols = useCallback(async () => {
    if (!isConnected) {
      await connectToMarket();
    }

    setIsGenerating(true);
    
    try {
      console.log('📊 Analisando todos os símbolos...');
      
      const newSignals: Signal[] = [];
      
      for (const symbol of watchedSymbols) {
        try {
          const signal = await signalGenerator.generateSignal(symbol);
          if (signal) {
            newSignals.push(signal);
          }
          
          // Delay entre análises para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao analisar ${symbol}:`, error);
        }
      }
      
      if (newSignals.length > 0) {
        setSignals(prev => {
          const combined = [...newSignals, ...prev];
          // Remover duplicatas por símbolo (manter mais recente)
          const unique = combined.filter((signal, index, arr) => 
            arr.findIndex(s => s.symbol === signal.symbol) === index
          );
          return unique.slice(0, 20);
        });
        
        setLastUpdate(new Date());
        console.log(`✅ ${newSignals.length} sinais gerados!`);
      }
      
      return newSignals;
    } catch (error) {
      console.error('❌ Erro na análise geral:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [isConnected, connectToMarket, setSignals]);

  // Remover sinal
  const removeSignal = useCallback((id: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== id));
  }, [setSignals]);

  // Limpar todos os sinais
  const clearAllSignals = useCallback(() => {
    setSignals([]);
    setLastUpdate(null);
  }, [setSignals]);


  // Conectar automaticamente ao inicializar
  useEffect(() => {
    connectToMarket();
    
    // Cleanup ao desmontar
    return () => {
      stopAutoSignalGeneration();
    };
  }, [connectToMarket, stopAutoSignalGeneration]);

  // Estatísticas dos sinais
  const getSignalStats = useCallback(() => {
    const buyCount = signals.filter(s => s.type === 'BUY').length;
    const sellCount = signals.filter(s => s.type === 'SELL').length;
    const holdCount = signals.filter(s => s.type === 'HOLD').length;
    const avgConfidence = signals.length > 0 
      ? (signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length).toFixed(1)
      : '0';

    return { buyCount, sellCount, holdCount, avgConfidence, total: signals.length };
  }, [signals]);

  return {
    signals,
    isGenerating,
    isConnected,
    lastUpdate,
    generateSignalForSymbol,
    generateRandomSignal,
    analyzeAllSymbols,
    removeSignal,
    clearAllSignals,
    connectToMarket,
    startAutoSignalGeneration,
    stopAutoSignalGeneration,
    getSignalStats,
    watchedSymbols
  };
}