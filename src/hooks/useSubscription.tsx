import { useLocalStorage } from './useLocalStorage';
import { getProductByPriceId } from '../stripe-config';

export type PlanType = 'free' | 'trader';

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
  priceId: null, // FREE por padrão
  planType: 'free',
  isActive: true,
  startDate: new Date(),
  endDate: null
};

export const planLimits: Record<PlanType, number> = {
  free: 10, // Limite para plano gratuito 
  trader: 120 // Limite único para o plano Trader
};

function getInitialSubscription(): SubscriptionData {
  return {
    priceId: null, // FREE por padrão para novos usuários
    planType: 'free',
    isActive: true,
    startDate: new Date(),
    endDate: null
  };
}

export function useSubscription() {
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('tickrify-subscription', getInitialSubscription());

  const getPlanType = (): PlanType => {
    return subscription.planType;
  };

  const getCurrentPlan = () => {
    if (!subscription.priceId) return null;
    return getProductByPriceId(subscription.priceId);
  };

  const hasActiveSubscription = (): boolean => {
    return subscription.isActive; // Sempre ativo para plano único
  };

  const switchPlan = async (priceId: string | null): Promise<AuthResult> => {
    try {
      console.log('🔄 Alterando plano para:', priceId);
      
      // Determinar tipo de plano baseado no priceId
      const planType: PlanType = priceId ? 'trader' : 'free';
      
      const newSubscription: SubscriptionData = {
        priceId: priceId || null,
        planType,
        isActive: true,
        startDate: new Date(),
        endDate: null
      };
      
      setSubscription(newSubscription);
      
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