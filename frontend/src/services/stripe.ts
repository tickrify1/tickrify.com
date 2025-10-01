import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../hooks/useAuth';
import supabase from './supabase';

const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || (import.meta as any).env?.STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null as any);

export interface StripeCheckoutParams {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutResponse {
  session_id: string;
  url: string;
}

export interface StripeCustomerInfo {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  static async createCheckoutSession(params: StripeCheckoutParams, customerInfo?: StripeCustomerInfo): Promise<StripeCheckoutResponse> {
    const payload = {
      price_id: params.priceId,
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: customerInfo?.email,
      customer_name: customerInfo?.name,
      metadata: customerInfo?.metadata
    };
    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    const response = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Erro ao criar sessão de checkout');
    }
    return await response.json();
  }

  static async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe.js não foi carregado');
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) throw error;
  }
}

export function useStripe() {
  const { user } = useAuth();

  const createCheckoutSession = async (params: StripeCheckoutParams) => {
    let customerInfo: StripeCustomerInfo | undefined;
    if (user) {
      customerInfo = { email: user.email, name: user.name, metadata: { user_id: user.id } } as any;
    }
    const session = await StripeService.createCheckoutSession(params, customerInfo);
    await StripeService.redirectToCheckout(session.session_id);
    return session;
  };

  return { createCheckoutSession };
}


