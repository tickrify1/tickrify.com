import { useState, useEffect } from 'react';
import { Analysis } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { usePerformance } from './usePerformance';
import { analyzeChartWithAI } from '../services/openai';
import { tickrifyAPI } from '../services/tickrifyAPI';
import { useSubscription } from './useSubscription';
import { useAuth } from './useAuth';

interface MonthlyUsage {
  count: number;
  month: string;
  year: number;
}

function getInitialMonthlyUsage(): MonthlyUsage {
  return {
    count: 0,
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear()
  };
}
export function useAnalysis() {
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [analiseIA, setAnaliseIA] = useState<any>(null);
  const [analyses, setAnalyses] = useLocalStorage<Analysis[]>('tickrify-analyses', []);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useLocalStorage<MonthlyUsage>('tickrify-monthly-usage', 
    getInitialMonthlyUsage()
  );
  
  const { updatePerformanceFromAnalysis } = usePerformance();
  const { getPlanType, planLimits } = useSubscription();
  const { user } = useAuth();

  // Reset monthly usage if new month - COM LOGS DETALHADOS E SEM LOOP
  useEffect(() => {
    const currentMonth = new Date().getMonth().toString();
    const currentYear = new Date().getFullYear();
    
    console.log('🗓️ VERIFICAÇÃO MENSAL:', {
      storedMonth: monthlyUsage.month,
      storedYear: monthlyUsage.year,
      currentMonth,
      currentYear,
      count: monthlyUsage.count
    });
    
    // Só resetar se realmente mudou o mês/ano E o valor atual não é zerado
    if ((monthlyUsage.month !== currentMonth || monthlyUsage.year !== currentYear) && monthlyUsage.count > 0) {
      console.log('🔄 RESET DO CONTADOR MENSAL - novo mês/ano detectado');
      setMonthlyUsage({
        count: 0,
        month: currentMonth,
        year: currentYear
      });
    } else if (monthlyUsage.month !== currentMonth || monthlyUsage.year !== currentYear) {
      console.log('🔄 ATUALIZAÇÃO DE MÊS/ANO - mantendo count zerado');
      setMonthlyUsage({
        count: monthlyUsage.count,
        month: currentMonth,
        year: currentYear
      });
    } else {
      console.log('✅ MESMO MÊS/ANO - contador mantido:', monthlyUsage.count);
    }
  }, []); // Remover monthlyUsage das dependências para evitar loop

  // Verificação inicial separada
  useEffect(() => {
    const currentMonth = new Date().getMonth().toString();
    const currentYear = new Date().getFullYear();
    
    if (monthlyUsage.month !== currentMonth || monthlyUsage.year !== currentYear) {
      console.log('🚀 VERIFICAÇÃO INICIAL - atualizando mês/ano');
      setMonthlyUsage(prev => ({
        count: prev.count,
        month: currentMonth,
        year: currentYear
      }));
    }
  }, []);  // Só executar uma vez na inicialização

  const canAnalyze = (): boolean => {
    const planType = getPlanType();
    const limit = planLimits[planType];
    
    if (limit === Infinity) return true;
    return monthlyUsage.count < limit;
  };

  const analyzeChart = async (symbol?: string, imageData?: string) => {
    // Check usage limits
    if (!canAnalyze()) {
      throw new Error(`Limite mensal esgotado! Você já usou ${monthlyUsage.count} análises este mês. Faça upgrade para continuar.`);
    }

    console.log('🎯 INICIANDO analyzeChart - Uso mensal ANTES da análise:', monthlyUsage);
    setIsAnalyzing(true);
    console.log('🔄 Iniciando análise...', { symbol, hasImage: !!imageData });
    
    try {
      let result: any;
      
      // Tentar usar novo backend FastAPI primeiro
      try {
        console.log('� Tentando análise via backend FastAPI...');
        const userId = user?.id || 'anonymous';
        
        if (imageData) {
          const backendResult = await tickrifyAPI.analyzeChart(imageData, userId);
          console.log('✅ Análise via backend concluída:', backendResult);
          
          // Converter para formato compatível
          result = tickrifyAPI.convertToLegacyFormat(backendResult, symbol);
        } else {
          throw new Error('Imagem obrigatória para análise via backend');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend indisponível, usando análise local:', backendError);
        
        // Fallback para análise local
        result = await analyzeChartWithAI({
          image: imageData || '',
          symbol: symbol || '',
          timeframe: '1H'
        });
      }
      
      console.log('📊 Resultado final da análise:', result);
      
      // Definir analiseIA com dados da análise
      const aiResponse = {
        analise_tecnica: result.analise_tecnica || 'Análise técnica realizada',
        decisao: result.decisao || result.recommendation,
        justificativa_decisao: result.justificativa_decisao || result.reasoning,
        confianca_percentual: result.confianca_percentual || result.confidence,
        indicadores_utilizados: result.indicadores_utilizados || ['Análise IA']
      };
      
      console.log('🧠 Definindo analiseIA:', aiResponse);
      setAnaliseIA(aiResponse);

      // Converter indicadores técnicos para o formato correto
      const technicalIndicators = (result.technicalIndicators || []).map((indicator: any) => ({
        name: indicator.name,
        value: typeof indicator.value === 'string' ? 0 : indicator.value,
        signal: indicator.signal,
        description: indicator.description
      }));

      const analysis: Analysis = {
        id: Date.now().toString(),
        symbol: result.symbol || symbol || 'CHART_ANALYSIS',
        recommendation: result.recommendation || 'HOLD',
        confidence: result.confidence || result.confianca_percentual || 70,
        targetPrice: result.targetPrice || 45000,
        stopLoss: result.stopLoss || 40000,
        timeframe: '1H',
        timestamp: new Date(),
        reasoning: result.reasoning || result.justificativa_decisao || 'Análise realizada com sucesso',
        imageData: imageData,
        technicalIndicators,
        riskManagement: {
          riskReward: 2.8,
          maxRisk: 2,
          positionSize: '2% do capital',
          stopLoss: result.stopLoss || 40000,
          takeProfit: result.targetPrice || 45000,
          maxDrawdown: 5
        },
        aiDecision: {
          action: result.decisao || result.recommendation,
          description: result.justificativa_decisao || result.reasoning,
          candleAnalysis: result.analise_tecnica || 'Análise de candlestick realizada',
          marketContext: 'Análise técnica baseada em gráfico',
          riskLevel: (result.confianca_percentual || result.confidence || 70) >= 80 ? 'LOW' : 
                    (result.confianca_percentual || result.confidence || 70) >= 60 ? 'MEDIUM' : 'HIGH'
        }
      };

      setCurrentAnalysis(analysis);
      console.log('✅ currentAnalysis definido:', analysis);
      console.log('✅ analiseIA definido:', aiResponse);
      
      setAnalyses(prev => [analysis, ...prev.slice(0, 49)]);
      
      console.log('✅ Análise concluída:', {
        symbol: analysis.symbol,
        recommendation: analysis.recommendation,
        confidence: result.confianca_percentual || result.confidence,
        aiResponse
      });
      
      // Update monthly usage - COM LOG DETALHADO
      console.log('📊 ANTES do incremento - Uso mensal atual:', monthlyUsage);
      setMonthlyUsage(prev => {
        const newUsage = {
          ...prev,
          count: prev.count + 1
        };
        console.log('📈 INCREMENTANDO uso mensal:', prev.count, '->', newUsage.count);
        console.log('📅 Mês/Ano:', prev.month, prev.year);
        return newUsage;
      });
      console.log('✅ Comando de incremento enviado - aguardando state update...');
      
      // Update performance metrics
      updatePerformanceFromAnalysis(analysis);
      
      // Generate signal based on analysis with real data
      setTimeout(() => {
        generateSignalFromAnalysis(analysis);
      }, 1000);
      
      console.log('🔄 Estados atualizados - aguardando re-render...');
      
      // Retornar resultado para o componente
      return result;
      
    } catch (error: any) {
      console.error('❌ Erro na análise:', error);
      console.log('⚠️ ERRO CAPTURADO - Uso mensal NÃO será incrementado:', monthlyUsage);
      throw error;
    } finally {
      setIsAnalyzing(false);
      console.log('🏁 Análise finalizada, isAnalyzing:', false);
    }
  };

  const generateSignalFromAnalysis = (analysis: Analysis) => {
    // Criar sinal baseado na análise real
    const signal = {
      id: Date.now().toString(),
      symbol: analysis.symbol,
      type: analysis.recommendation,
      confidence: analysis.confidence,
      price: analysis.targetPrice,
      timestamp: new Date(),
      source: 'Análise IA - Gráfico',
      description: `Sinal gerado da análise: ${analysis.reasoning.substring(0, 100)}...`
    };

    // Adicionar sinal à lista
    const currentSignals = JSON.parse(localStorage.getItem('tickrify-signals') || '[]');
    const newSignals = [signal, ...currentSignals.slice(0, 19)];
    localStorage.setItem('tickrify-signals', JSON.stringify(newSignals));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('signalGenerated', { detail: signal }));
  };

  // Manter compatibilidade com nome antigo

  const clearAnalysis = () => {
    setCurrentAnalysis(null);
    setAnaliseIA(null);
  };

  const clearAllAnalyses = () => {
    setAnalyses([]);
    setCurrentAnalysis(null);
    setAnaliseIA(null);
  };

  return {
    currentAnalysis,
    analiseIA,
    analyses,
    isAnalyzing,
    monthlyUsage,
    planLimits,
    analyzeChart,
    clearAnalysis,
    clearAllAnalyses,
    canAnalyze
  };
}