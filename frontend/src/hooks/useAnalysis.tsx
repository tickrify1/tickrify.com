import { useState, useEffect } from 'react';
import { Analysis } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { usePerformance } from './usePerformance';
import { tickrifyAPI, BackendAnalysisResponse } from '../services/tickrifyAPI';
import { useSubscription } from './useSubscription';
import { useAuth } from './useAuth';
import { useSupabaseDataContext } from './useSupabaseDataProvider';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [subVersion, setSubVersion] = useState(0);
  
  // Usar dados do Supabase
  const { 
    analyses, 
    monthlyUsage, 
    saveAnalysis: saveAnalysisToSupabase,
    saveSignal: saveSignalToSupabase,
    fetchMonthlyUsage
  } = useSupabaseDataContext();
  
  const { updatePerformanceFromAnalysis } = usePerformance();
  const { getPlanType, planLimits } = useSubscription();
  // Re-render quando a assinatura mudar, para atualizar limites imediatamente
  useEffect(() => {
    const onSubUpdated = () => setSubVersion(v => v + 1);
    window.addEventListener('subscriptionUpdated', onSubUpdated as any);
    return () => window.removeEventListener('subscriptionUpdated', onSubUpdated as any);
  }, []);
  const { user } = useAuth();

  // Removido ajuste manual do contador mensal para evitar ReferenceError
  // O controle de uso mensal é feito via contexto (useSupabaseData)

  // Limites e contagem são controlados pelo backend; o frontend não bloqueia preventivamente

  const analyzeChart = async (symbol?: string, imageData?: string) => {
    // Modo de testes: sem bloqueio por plano/limite no frontend
    const planType = getPlanType();

    console.log('🎯 INICIANDO analyzeChart - Uso mensal ANTES da análise:', monthlyUsage);
    setIsAnalyzing(true);
    console.log('🔄 Iniciando análise...', { symbol, hasImage: !!imageData });
    
    try {
      let result: any;
      
      // Sempre tentar usar backend (modo de testes libera limites no backend)
      try {
        console.log('� Tentando análise via backend FastAPI...');
        const userId = user?.id || 'dev-user';
        if (imageData) {
          const backendResult = await tickrifyAPI.analyzeChart(imageData, userId);
          console.log('✅ Análise via backend concluída:', backendResult);
          result = tickrifyAPI.convertToLegacyFormat(backendResult, symbol);
        } else {
          throw new Error('Imagem obrigatória para análise via backend');
        }
      } catch (backendError: any) {
        console.error('❌ Erro no backend de análise (IA real exigida):', backendError);
        // Sem fallback: propagar erro para o componente exibir
        throw backendError;
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
      
      // Salvar análise no banco de dados
      try {
        await saveAnalysisToSupabase(analysis);
        console.log('✅ Análise salva no banco de dados');
      } catch (error) {
        console.error('❌ Erro ao salvar análise:', error);
      }
      
      console.log('✅ Análise concluída:', {
        symbol: analysis.symbol,
        recommendation: analysis.recommendation,
        confidence: result.confianca_percentual || result.confidence,
        aiResponse
      });
      
      // Atualizar uso mensal a partir do backend e abrir modal se alcançou o limite
      try {
        const usage = await fetchMonthlyUsage();
        if (usage && usage.count >= usage.limit) {
          window.dispatchEvent(new CustomEvent('upgradeRequired'));
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar uso mensal:', error);
      }
      
      // Update performance metrics
      updatePerformanceFromAnalysis(analysis);
      
      // Generate signal based on analysis with real data
      setTimeout(async () => {
        await generateSignalFromAnalysis(analysis);
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

  const generateSignalFromAnalysis = async (analysis: Analysis) => {
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

    // Salvar sinal no banco de dados
    try {
      await saveSignalToSupabase(signal);
      console.log('✅ Sinal salvo no banco de dados');
    } catch (error) {
      console.error('❌ Erro ao salvar sinal:', error);
    }
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new CustomEvent('signalGenerated', { detail: signal }));
  };

  // Manter compatibilidade com nome antigo

  // Em modo real, o frontend não bloqueia preventivamente; backend faz controle
  const canAnalyze = () => true;

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
    canAnalyze,
    clearAnalysis,
    clearAllAnalyses
  };
}