import { useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { useAuth } from './useAuth';
import { Analysis, Signal } from '../types';

/**
 * Hook para gerenciar dados do Supabase de forma centralizada
 */
export function useSupabaseData() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasDatabase = typeof (supabase as any)?.from === 'function';
  
  // Estados para diferentes tipos de dados
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<{count: number, limit: number}>({count: 0, limit: 10});

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // Limpar dados quando não há usuário autenticado
      setAnalyses([]);
      setSignals([]);
      setSubscription(null);
      setMonthlyUsage({count: 0, limit: 10});
      setIsLoading(false);
    }
  }, [user]);

  // Função para buscar todos os dados do usuário
  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar em paralelo para melhor performance
      await Promise.all([
        fetchAnalyses(),
        fetchSignals(),
        fetchSubscription(),
        fetchMonthlyUsage()
      ]);
    } catch (err: any) {
      console.error('Erro ao buscar dados do usuário:', err);
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar análises do usuário
  const fetchAnalyses = async () => {
    if (!user) return;
    
    try {
      if (!hasDatabase) {
        const stored = localStorage.getItem('tickrify-analyses');
        const formattedAnalyses: Analysis[] = stored ? JSON.parse(stored) : [];
        setAnalyses(formattedAnalyses);
        return formattedAnalyses;
      }
      const { data, error } = await (supabase as any)
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const formattedAnalyses: Analysis[] = data.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        recommendation: item.recommendation,
        confidence: item.confidence,
        targetPrice: item.target_price,
        stopLoss: item.stop_loss,
        timeframe: item.timeframe,
        timestamp: new Date(item.timestamp),
        reasoning: item.reasoning,
        imageData: item.image_url,
        technicalIndicators: item.technical_indicators || []
      }));
      setAnalyses(formattedAnalyses);
      localStorage.setItem('tickrify-analyses', JSON.stringify(formattedAnalyses));
      return formattedAnalyses;
    } catch (err) {
      console.error('Erro ao buscar análises:', err);
      throw err;
    }
  };

  // Buscar sinais do usuário
  const fetchSignals = async () => {
    if (!user) return;
    
    try {
      if (!hasDatabase) {
        const stored = localStorage.getItem('tickrify-signals');
        const formattedSignals: Signal[] = stored ? JSON.parse(stored) : [];
        setSignals(formattedSignals);
        return formattedSignals;
      }
      const { data, error } = await (supabase as any)
        .from('signals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const formattedSignals: Signal[] = data.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        type: item.type,
        confidence: item.confidence,
        price: item.price,
        timestamp: new Date(item.timestamp),
        source: item.source,
        description: item.description
      }));
      setSignals(formattedSignals);
      localStorage.setItem('tickrify-signals', JSON.stringify(formattedSignals));
      return formattedSignals;
    } catch (err) {
      console.error('Erro ao buscar sinais:', err);
      throw err;
    }
  };

  // Buscar assinatura do usuário
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      if (!hasDatabase) {
        const userSubscription = {
          id: null,
          user_id: user.id,
          price_id: null,
          plan_type: 'free',
          is_active: false,
          start_date: null,
          end_date: null,
          status: 'inactive'
        } as any;
        setSubscription(userSubscription);
        localStorage.setItem('tickrify-subscription', JSON.stringify({
          priceId: null,
          planType: 'free',
          isActive: false,
          startDate: null,
          endDate: null
        }));
        return userSubscription;
      }
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') { throw error; }
      const userSubscription = data || {
        id: null,
        user_id: user.id,
        price_id: null,
        plan_type: 'free',
        is_active: false,
        start_date: null,
        end_date: null,
        status: 'inactive'
      };
      setSubscription(userSubscription);
      localStorage.setItem('tickrify-subscription', JSON.stringify({
        priceId: userSubscription.price_id,
        planType: userSubscription.plan_type,
        isActive: userSubscription.is_active,
        startDate: userSubscription.start_date,
        endDate: userSubscription.end_date
      }));
      return userSubscription;
    } catch (err) {
      console.error('Erro ao buscar assinatura:', err);
      throw err;
    }
  };

  // Buscar uso mensal do usuário
  const fetchMonthlyUsage = async () => {
    if (!user) return;
    
    try {
      if (!hasDatabase) {
        const stored = localStorage.getItem('tickrify-monthly-usage');
        const storedCount = stored ? (JSON.parse(stored).count || 0) : 0;
        const subscription = await fetchSubscription();
        const planType = subscription?.plan_type || 'free';
        const planLimits = { 'free': 10, 'trader': 120, 'alpha_pro': 350 } as const;
        const limit = planLimits[planType as keyof typeof planLimits] || 10;
        const usage = { count: storedCount, limit };
        setMonthlyUsage(usage);
        return usage;
      }
      const now = new Date();
      const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
      const { data, error } = await (supabase as any)
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .single();
      const subscription = await fetchSubscription();
      const planType = subscription?.plan_type || 'free';
      const planLimits = { 'free': 10, 'trader': 120, 'alpha_pro': 350 };
      const limit = planLimits[planType as keyof typeof planLimits] || 10;
      const count = (data && !error) ? data.count : 0;
      const usage = { count, limit };
      setMonthlyUsage(usage);
      localStorage.setItem('tickrify-monthly-usage', JSON.stringify({
        count: usage.count,
        month: new Date().getMonth().toString(),
        year: new Date().getFullYear()
      }));
      return usage;
    } catch (err) {
      console.error('Erro ao buscar uso mensal:', err);
      throw err;
    }
  };

  // Salvar uma nova análise
  const saveAnalysis = async (analysis: Omit<Analysis, 'id'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (!hasDatabase) {
        const newAnalysis: Analysis = {
          id: Date.now().toString(),
          symbol: analysis.symbol,
          recommendation: analysis.recommendation,
          confidence: analysis.confidence,
          targetPrice: analysis.targetPrice,
          stopLoss: analysis.stopLoss,
          timeframe: analysis.timeframe,
          timestamp: analysis.timestamp,
          reasoning: analysis.reasoning,
          imageData: analysis.imageData,
          technicalIndicators: analysis.technicalIndicators
        };
        setAnalyses(prev => [newAnalysis, ...prev]);
        localStorage.setItem('tickrify-analyses', JSON.stringify([newAnalysis, ...analyses]));
        setMonthlyUsage(prev => ({ ...prev, count: prev.count + 1 }));
        localStorage.setItem('tickrify-monthly-usage', JSON.stringify({
          count: monthlyUsage.count + 1,
          month: new Date().getMonth().toString(),
          year: new Date().getFullYear()
        }));
        return newAnalysis;
      }
      const analysisData = {
        user_id: user.id,
        symbol: analysis.symbol,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
        target_price: analysis.targetPrice,
        stop_loss: analysis.stopLoss,
        timeframe: analysis.timeframe,
        timestamp: analysis.timestamp.toISOString(),
        reasoning: analysis.reasoning,
        image_url: analysis.imageData,
        technical_indicators: analysis.technicalIndicators
      };
      const { data, error } = await (supabase as any)
        .from('analyses')
        .insert(analysisData)
        .select()
        .single();
      if (error) throw error;
      const newAnalysis: Analysis = {
        id: data.id,
        symbol: data.symbol,
        recommendation: data.recommendation,
        confidence: data.confidence,
        targetPrice: data.target_price,
        stopLoss: data.stop_loss,
        timeframe: data.timeframe,
        timestamp: new Date(data.timestamp),
        reasoning: data.reasoning,
        imageData: data.image_url,
        technicalIndicators: data.technical_indicators || []
      };
      setAnalyses(prev => [newAnalysis, ...prev]);
      localStorage.setItem('tickrify-analyses', JSON.stringify([newAnalysis, ...analyses]));
      await incrementMonthlyUsage();
      return newAnalysis;
    } catch (err) {
      console.error('Erro ao salvar análise:', err);
      throw err;
    }
  };

  // Incrementar uso mensal
  const incrementMonthlyUsage = async () => {
    if (!user) return;
    
    try {
      if (!hasDatabase) {
        setMonthlyUsage(prev => ({ ...prev, count: prev.count + 1 }));
        localStorage.setItem('tickrify-monthly-usage', JSON.stringify({
          count: monthlyUsage.count + 1,
          month: new Date().getMonth().toString(),
          year: new Date().getFullYear()
        }));
        return monthlyUsage.count + 1;
      }
      // Obter mês e ano atual
      const now = new Date();
      const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`; // formato: MM-YYYY
      
      // Verificar se já existe registro para este mês
      const { data: existingData, error: fetchError } = await (supabase as any)
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingData) {
        // Atualizar registro existente
        const { error } = await (supabase as any)
          .from('usage_limits')
          .update({
            count: existingData.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (error) throw error;
        
        setMonthlyUsage(prev => ({ ...prev, count: prev.count + 1 }));
      } else {
        // Criar novo registro
        const { error } = await (supabase as any)
          .from('usage_limits')
          .insert({
            user_id: user.id,
            month_year: currentMonthYear,
            count: 1,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        setMonthlyUsage(prev => ({ ...prev, count: 1 }));
      }
      
      // Atualizar localStorage para compatibilidade
      localStorage.setItem('tickrify-monthly-usage', JSON.stringify({
        count: monthlyUsage.count + 1,
        month: new Date().getMonth().toString(),
        year: new Date().getFullYear()
      }));
      
      return monthlyUsage.count + 1;
    } catch (err) {
      console.error('Erro ao incrementar uso mensal:', err);
      throw err;
    }
  };

  // Salvar um novo sinal
  const saveSignal = async (signal: Omit<Signal, 'id'>) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    try {
      if (!hasDatabase) {
        const newSignal: Signal = {
          id: Date.now().toString(),
          symbol: signal.symbol,
          type: signal.type,
          confidence: signal.confidence,
          price: signal.price,
          timestamp: signal.timestamp,
          source: signal.source,
          description: signal.description
        };
        setSignals(prev => [newSignal, ...prev]);
        localStorage.setItem('tickrify-signals', JSON.stringify([newSignal, ...signals]));
        return newSignal;
      }
      const signalData = {
        user_id: user.id,
        symbol: signal.symbol,
        type: signal.type,
        confidence: signal.confidence,
        price: signal.price,
        timestamp: signal.timestamp.toISOString(),
        source: signal.source,
        description: signal.description
      };
      const { data, error } = await (supabase as any)
        .from('signals')
        .insert(signalData)
        .select()
        .single();
      if (error) throw error;
      const newSignal: Signal = {
        id: data.id,
        symbol: data.symbol,
        type: data.type,
        confidence: data.confidence,
        price: data.price,
        timestamp: new Date(data.timestamp),
        source: data.source,
        description: data.description
      };
      setSignals(prev => [newSignal, ...prev]);
      localStorage.setItem('tickrify-signals', JSON.stringify([newSignal, ...signals]));
      return newSignal;
    } catch (err) {
      console.error('Erro ao salvar sinal:', err);
      throw err;
    }
  };

  return {
    // Dados
    analyses,
    signals,
    subscription,
    monthlyUsage,
    
    // Estado
    isLoading,
    error,
    
    // Funções de busca
    fetchUserData,
    fetchAnalyses,
    fetchSignals,
    fetchSubscription,
    fetchMonthlyUsage,
    
    // Funções de modificação
    saveAnalysis,
    saveSignal,
    incrementMonthlyUsage
  };
}


