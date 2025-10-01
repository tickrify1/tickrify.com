import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { StripeCheckoutParams } from '../services/stripe';
import supabase from '../services/supabase';

const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null as any);

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (params: StripeCheckoutParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}) },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Erro ao criar sessão Stripe');
      const data = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js não carregado (defina VITE_STRIPE_PUBLISHABLE_KEY)');
      await stripe.redirectToCheckout({ sessionId: data.session_id });
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading, error };
}


