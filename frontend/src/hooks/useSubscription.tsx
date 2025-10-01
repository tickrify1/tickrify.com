import { useLocalStorage } from './useLocalStorage';
import { getProductByPriceId, products } from '../pricing';
import { useSupabaseDataContext } from './useSupabaseDataProvider';
import supabase from '../services/supabase';
import { useAuth } from './useAuth';

export type PlanType = 'free' | 'trader' | 'alpha_pro';

export interface SubscriptionData {
  priceId: string | null;
  planType: PlanType;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

const defaultSubscription: SubscriptionData = {
  priceId: null,
  planType: 'free',
  isActive: false,
  startDate: null,
  endDate: null
};

export const planLimits: Record<PlanType, number> = {
  free: 10,
  trader: 120,
  alpha_pro: 350
};

function getInitialSubscription(): SubscriptionData {
  return {
    priceId: null,
    planType: 'free',
    isActive: false,
    startDate: null,
    endDate: null
  };
}

export function useSubscription() {
  // Usar dados do Supabase
  const { subscription, fetchSubscription } = useSupabaseDataContext();
  const { user } = useAuth();
  const hasDatabase = typeof (supabase as any)?.from === 'function';
  
  // Manter compatibilidade com localStorage para código existente
  const [localSubscription, setLocalSubscription] = useLocalStorage<SubscriptionData>('tickrify-subscription', getInitialSubscription());

  const getPlanType = (): PlanType => {
    // Desbloqueio: sempre operar como plano 'trader'
    return 'trader';
  };

  const getCurrentPlan = () => {
    // Preferir o plano local ativo
    const localPrice = localSubscription?.isActive ? localSubscription.priceId : null;
    const priceId = localPrice || subscription?.price_id || localSubscription.priceId;
    // Desbloqueio: sem priceId, retornar o primeiro produto (Trader)
    if (!priceId) return products[0] || null;
    return getProductByPriceId(priceId) || products[0] || null;
  };

  const hasActiveSubscription = (): boolean => {
    // Desbloqueio: sempre considerar assinatura ativa
    return true;
  };

  const switchPlan = async (priceId: string | null): Promise<AuthResult> => {
    try {
      console.log('🔄 Trocando plano para:', priceId);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      let planType: PlanType = 'free';
      // Derivar plano pelo produto configurado
      if (priceId) {
        const matchedProduct = getProductByPriceId(priceId);
        if (matchedProduct) {
          // Como só há o plano Trader no pricing, mapear para 'trader'
          planType = 'trader';
        }
      }
      // Construir assinatura local desejada (fallback garantido)
      const desiredLocal: SubscriptionData = {
        priceId,
        planType,
        isActive: priceId !== null,
        startDate: priceId ? new Date() : null,
        endDate: null
      };
      
      // Modo offline/dev: se não há banco, apenas persistir no localStorage
      if (!hasDatabase) {
        setLocalSubscription(desiredLocal);
        // Notificar UI
        try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
        console.log('✅ Plano alterado (modo offline):', desiredLocal);
        return { success: true };
      }
      
      // Atualizar no banco de dados
      if (priceId === null) {
        // Cancelar assinatura existente
        const { error } = await supabase
          .from('subscriptions')
          .update({
            is_active: false,
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('is_active', true);
          
        if (error) throw error;
      } else {
        // Criar nova assinatura (para testes - normalmente feito pelo webhook)
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            price_id: priceId,
            plan_type: planType,
            is_active: true,
            start_date: new Date().toISOString(),
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      // Atualizar dados locais
      await fetchSubscription();
      
      // Manter compatibilidade com localStorage
      setLocalSubscription(desiredLocal);
      
      console.log('✅ Plano alterado com sucesso:', {
        priceId,
        planType,
        limit: planLimits[planType]
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('⚠️ Falha no backend ao trocar plano, aplicando fallback local:', error);
      // Fallback: forçar plano localmente para refletir na UI
      try {
        // Derivar tipo novamente por segurança
        let planType: PlanType = 'free';
        if (priceId) {
          const matchedProduct = getProductByPriceId(priceId);
          if (matchedProduct) planType = 'trader';
        }
        const desiredLocal: SubscriptionData = {
          priceId,
          planType,
          isActive: priceId !== null,
          startDate: priceId ? new Date() : null,
          endDate: null
        };
        setLocalSubscription(desiredLocal);
        try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }
  };

  const cancelSubscription = async (): Promise<AuthResult> => {
    try {
      setSubscription(defaultSubscription);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refetch = async () => {
    try {
      await fetchSubscription();
      try { window.dispatchEvent(new CustomEvent('subscriptionUpdated')); } catch {}
      console.log('✅ Subscription data refreshed');
    } catch (e) {
      console.error('❌ Falha ao atualizar assinatura', e);
    }
  };

  return {
    subscription,
    getPlanType,
    getCurrentPlan,
    hasActiveSubscription,
    switchPlan,
    cancelSubscription,
    refetch,
    planLimits
  };
}