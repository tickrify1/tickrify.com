import { useLocalStorage } from './useLocalStorage';
import { stripeProducts, getProductByPriceId } from '../stripe-config';

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
  const [subscription, setSubscription] = useLocalStorage<SubscriptionData>('tickrify-subscription', getInitialSubscription());

  const getPlanType = (): PlanType => {
    return subscription.planType;
  };

  const getCurrentPlan = () => {
    if (!subscription.priceId) return null;
    return getProductByPriceId(subscription.priceId);
  };

  const hasActiveSubscription = (): boolean => {
    return subscription.isActive && subscription.planType !== 'free';
  };

  const switchPlan = async (priceId: string | null): Promise<AuthResult> => {
    try {
      console.log('🔄 Trocando plano para:', priceId);
      
      let planType: PlanType = 'free';
      
      // Map price IDs to plan types
      const priceIdToPlanType: Record<string, PlanType> = {
        'price_1RjU3gB1hl0IoocUWlz842SY': 'trader',
        'price_1RjU4WB1hl0IoocUwn9UyTcS': 'alpha_pro'
      };
      
      if (priceId && priceIdToPlanType[priceId]) {
        planType = priceIdToPlanType[priceId];
      }
      
      const newSubscription: SubscriptionData = {
        priceId,
        planType,
        isActive: priceId !== null,
        startDate: priceId ? new Date() : null,
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