import { useState } from 'react';
import { stripeService, StripeCheckoutParams } from '../services/stripe';

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (params: StripeCheckoutParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await stripeService.createCheckoutSession(params);
      
      // Redirecionar para o Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatus = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await stripeService.getPaymentStatus(sessionId);
      return status;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await stripeService.cancelSubscription(subscriptionId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCheckoutSession,
    getPaymentStatus,
    cancelSubscription,
  };
}