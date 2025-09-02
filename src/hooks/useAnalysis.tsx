import { useState, useEffect } from 'react';
import { Analysis } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { usePerformance } from './usePerformance';
import { analyzeChartWithAI } from '../services/openai';
import { analyzeTickrify, convertTickrifyToFrontend, checkBackendHealth } from '../services/backendApi';
import { useSubscription } from './useSubscription';

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

  // Reset monthly usage if new month
  useEffect(() => {
    const currentMonth = new Date().getMonth().toString();
    const currentYear = new Date().getFullYear();
    
    if (monthlyUsage.month !== currentMonth || monthlyUsage.year !== currentYear) {
      setMonthlyUsage({
        count: 0,
        month: currentMonth,
        year: currentYear
      });
    }
  }, [monthlyUsage, setMonthlyUsage]);

  const canAnalyze = (): boolean => {
    const planType = getPlanType();
    const limit = planLimits[planType];
    
    if (limit === Infinity) return true;
    return monthlyUsage.count < limit;
  };

  const analyzeChart = async (symbol?: string, imageData?: string, selectedFile?: File) => {
    console.log('🚀 [ANALYSIS] Iniciando análise...');
    
    // Check usage limits
    if (!canAnalyze()) {
      console.log('❌ [ANALYSIS] Limite mensal esgotado');
      throw new Error(`Limite mensal esgotado! Você já usou ${monthlyUsage.count} análises este mês. Faça upgrade para continuar.`);
    }

    setIsAnalyzing(true);
    
    try {
      let result: any;
      
      // Tentar usar o backend FastAPI primeiro
      const backendAvailable = await checkBackendHealth();
      
      if (backendAvailable && selectedFile) {
        console.log('🚀 [ANALYSIS] Usando backend FastAPI...');
        try {
          const backendResponse = await analyzeTickrify(selectedFile);
          result = convertTickrifyToFrontend(backendResponse, symbol || 'CHART', imageData || '');
          
          // Verificar se todos os campos necessários estão presentes
          if (!result.analise_tecnica || !result.decisao) {
            throw new Error('Conversão retornou dados incompletos');
          }
          
        } catch (backendError) {
          console.warn('❌ [ANALYSIS] Backend FastAPI falhou, usando OpenAI direto:', backendError);
          // Fallback para OpenAI direto
          result = await analyzeChartWithAI({
            image: imageData || '',
            symbol: symbol || '',
            timeframe: '1H'
          });
          console.log('✅ [ANALYSIS] Resultado do OpenAI direto:', result);
        }
      } else {
        console.log('🧠 [ANALYSIS] Usando OpenAI direto...');
        // Verificar se tem chave OpenAI configurada
        const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
        console.log('🔑 [ANALYSIS] OpenAI key presente:', !!openaiKey);
        
        if (!openaiKey || openaiKey === 'your-openai-key-here') {
          console.log('❌ [ANALYSIS] Chave OpenAI não configurada');
          throw new Error('Chave da OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env para usar análise real.');
        }
        
        console.log('📤 [ANALYSIS] Chamando analyzeChartWithAI...');
        result = await analyzeChartWithAI({
          image: imageData || '',
          symbol: symbol || '',
          timeframe: '1H'
        });
        console.log('✅ [ANALYSIS] Resultado do analyzeChartWithAI:', result);
      }
      
      console.log('📊 [ANALYSIS] Resultado da análise recebido:', result);
      
      // Definir analiseIA com dados reais da API
      console.log('🧠 [ANALYSIS] Criando aiResponse...');
      const aiResponse = {
        analise_tecnica: result.analise_tecnica,
        decisao: result.decisao,
        justificativa_decisao: result.justificativa_decisao,
        confianca_percentual: result.confianca_percentual,
        indicadores_utilizados: result.indicadores_utilizados,
        market_snapshot: {
          // SEMPRE garantir que símbolo e preço estejam presentes
          simbolo_mercado: result.market_snapshot?.simbolo_mercado || result.simbolo_detectado || symbol || 'ATIVO',
          preco_atual: result.market_snapshot?.preco_atual || result.preco_atual || "Analisando...",
          variacao_24h: result.market_snapshot?.variacao_24h || "N/D", 
          variacao_percentual: result.market_snapshot?.variacao_percentual || "N/D",
          maxima_24h: result.market_snapshot?.maxima_24h || "N/D",
          minima_24h: result.market_snapshot?.minima_24h || "N/D",
          volume_24h: result.market_snapshot?.volume_24h || "N/D",
          tendencia_atual: result.market_snapshot?.tendencia_atual || "Analisando",
          forca_tendencia: result.market_snapshot?.forca_tendencia || "moderada",
          indicadores_resumo: result.market_snapshot?.indicadores_resumo || result.indicadores_utilizados || ["Análise Técnica"],
          confluencias_tecnicas: result.market_snapshot?.confluencias_tecnicas || ["Análise em andamento"],
          resumo_rapido: result.market_snapshot?.resumo_rapido || 
            `${result.simbolo_detectado || symbol || 'Ativo'} analisado - ${result.decisao || 'análise'} identificada com confiança de ${result.confianca_percentual || 75}%`
        }
      };
      
      console.log('🧠 [ANALYSIS] aiResponse criado:', aiResponse);
      console.log('🧠 [ANALYSIS] aiResponse.analise_tecnica:', aiResponse.analise_tecnica);
      console.log('🧠 [ANALYSIS] aiResponse.decisao:', aiResponse.decisao);
      console.log('💰 [ANALYSIS] Market Snapshot no aiResponse:', aiResponse.market_snapshot);
      
      console.log('🔄 [ANALYSIS] Executando setAnaliseIA...');
      setAnaliseIA(aiResponse);
      console.log('✅ [ANALYSIS] setAnaliseIA executado com dados:', !!aiResponse);

      // Forçar re-render imediato
      setTimeout(() => {
        console.log('🔄 [ANALYSIS] Forçando re-render...');
        setAnaliseIA({...aiResponse});
      }, 100);

      console.log('📋 [ANALYSIS] Criando objeto Analysis...');
      const analysis: Analysis = {
        id: Date.now().toString(),
        symbol: result.symbol,
        recommendation: result.recommendation,
        confidence: result.confianca_percentual,
        targetPrice: result.targetPrice,
        stopLoss: result.stopLoss,
        timeframe: '1H',
        timestamp: new Date(),
        reasoning: result.reasoning,
        imageData: imageData,
        technicalIndicators: result.technicalIndicators,
        riskManagement: {
          riskReward: 2.8,
          maxRisk: 2,
          positionSize: '2% do capital',
          stopLoss: result.stopLoss,
          takeProfit: result.targetPrice,
          maxDrawdown: 5
        },
        aiDecision: {
          action: result.decisao,
          description: result.justificativa_decisao,
          candleAnalysis: result.analise_tecnica,
          marketContext: 'Análise técnica baseada em gráfico',
          riskLevel: result.confianca_percentual >= 80 ? 'LOW' : result.confianca_percentual >= 60 ? 'MEDIUM' : 'HIGH'
        }
      };

      console.log('📋 [ANALYSIS] Objeto Analysis criado com sucesso:', analysis);
      console.log('📋 [ANALYSIS] Analysis.symbol:', analysis.symbol);
      console.log('📋 [ANALYSIS] Analysis.recommendation:', analysis.recommendation);
      console.log('📋 [ANALYSIS] Analysis.reasoning:', analysis.reasoning?.substring(0, 100) + '...');
      
      console.log('🔄 [ANALYSIS] Executando setCurrentAnalysis...');
      setCurrentAnalysis(analysis);
      console.log('✅ [ANALYSIS] setCurrentAnalysis executado com sucesso');
      
      console.log('🔄 [ANALYSIS] Executando setAnalyses...');
      setAnalyses(prev => [analysis, ...prev.slice(0, 49)]);
      console.log('✅ [ANALYSIS] setAnalyses executado com sucesso');
      
      console.log('✅ [ANALYSIS] Análise concluída com sucesso:', {
        symbol: analysis.symbol,
        recommendation: analysis.recommendation,
        confidence: result.confianca_percentual,
        aiResponse
      });
      
      // Update monthly usage
      setMonthlyUsage(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      console.log('📊 [ANALYSIS] Monthly usage atualizado');
      
      // Update performance metrics
      updatePerformanceFromAnalysis(analysis);
      console.log('📈 [ANALYSIS] Performance metrics atualizados');
      
      // Generate signal based on analysis with real data
      setTimeout(() => {
        generateSignalFromAnalysis(analysis);
        console.log('🎯 [ANALYSIS] Signal gerado');
      }, 1000);
      
      console.log('🔄 [ANALYSIS] Estados atualizados - aguardando re-render...');
      
      // Retornar resultado para o componente
      return result;
      
    } catch (error: any) {
      console.error('Erro na análise:', error);
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
    console.log('🧹 Limpando análise atual...');
    setCurrentAnalysis(null);
    setAnaliseIA(null);
  };

  const clearAllAnalyses = () => {
    console.log('🧹 Limpando todas as análises...');
    setAnalyses([]);
    setCurrentAnalysis(null);
    setAnaliseIA(null);
  };

  const forceReset = () => {
    console.log('🔄 Forçando reset completo...');
    setCurrentAnalysis(null);
    setAnaliseIA(null);
    setIsAnalyzing(false);
    setAnalyses([]);
    // Força re-render
    setTimeout(() => {
      console.log('✅ Reset completo finalizado');
    }, 100);
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
    forceReset,
    canAnalyze
  };
}