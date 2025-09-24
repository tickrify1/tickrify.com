import { useLocalStorage } from './useLocalStorage';
import { stripeProducts, getProductByPriceId } from '../stripe-config';
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
  
  // Manter compatibilidade com localStorage para código existente
  const [localSubscription, setLocalSubscription] = useLocalStorage<SubscriptionData>('tickrify-subscription', getInitialSubscription());

  const getPlanType = (): PlanType => {
    // Usar plano do banco de dados se disponível
    if (subscription) {
      return subscription.plan_type as PlanType;
    }
    // Fallback para localStorage
    return localSubscription.planType;
  };

  const getCurrentPlan = () => {
    // Usar price_id do banco de dados se disponível
    const priceId = subscription?.price_id || localSubscription.priceId;
    if (!priceId) return null;
    return getProductByPriceId(priceId);
  };

  const hasActiveSubscription = (): boolean => {
    // Verificar assinatura ativa no banco de dados
    if (subscription) {
      return subscription.is_active && subscription.plan_type !== 'free';
    }
    // Fallback para localStorage
    return localSubscription.isActive && localSubscription.planType !== 'free';
  };

  const switchPlan = async (priceId: string | null): Promise<AuthResult> => {
    try {
      console.log('🔄 Trocando plano para:', priceId);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      let planType: PlanType = 'free';
      
      // Map price IDs to plan types
      const priceIdToPlanType: Record<string, PlanType> = {
        'price_1RjU3gB1hl0IoocUWlz842SY': 'trader'
      };
      
      if (priceId && priceIdToPlanType[priceId]) {
        planType = priceIdToPlanType[priceId];
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
      const newSubscription: SubscriptionData = {
        priceId,
        planType,
        isActive: priceId !== null,
        startDate: priceId ? new Date() : null,
        endDate: null
      };
      
      setLocalSubscription(newSubscription);
      
      console.log('✅ Plano alterado com sucesso:', {
        priceId,
        planType,
        limit: planLimits[planType]
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro ao trocar plano:', error);
      return { success: false, error: error.message };
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

  const refetch = () => {
    // Simulate refetch - in real app would call API
    console.log('🔄 Refetching subscription data...');
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