import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { StripeCheckoutParams } from '../services/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (params: StripeCheckoutParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama o backend para criar a sessão real do Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Erro ao criar sessão Stripe');
      const data = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js não carregado');
      // Redireciona para o checkout real
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