import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../hooks/useAuth';
import supabase from './supabase';

// Carregar Stripe com a chave pública (somente se existir)
const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null as any);

// Tipos para os parâmetros do checkout
export interface StripeCheckoutParams {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}

// Tipos para a resposta do checkout
export interface StripeCheckoutResponse {
  session_id: string;
  url: string;
}

// Tipos para as informações do cliente
export interface StripeCustomerInfo {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

// Classe principal de serviço do Stripe
export class StripeService {
  // Criar sessão de checkout
  static async createCheckoutSession(params: StripeCheckoutParams, customerInfo?: StripeCustomerInfo): Promise<StripeCheckoutResponse> {
    try {
      // Preparar payload para enviar ao backend
      const payload = {
        price_id: params.priceId,
        mode: params.mode,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: customerInfo?.email,
        customer_name: customerInfo?.name,
        metadata: customerInfo?.metadata
      };

      // Base URL (desenvolvimento via proxy ou produção via VITE_API_URL)
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

      // Obter token do Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      // Enviar requisição para o backend
      // Compatível com alias /api/checkout
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(payload),
      });

      // Verificar resposta
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar sessão de checkout');
      }

      // Retornar dados da sessão
      return await response.json();
    } catch (error: any) {
      console.error('Erro no serviço Stripe:', error);
      throw error;
    }
  }

  // Redirecionar para checkout
  static async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js não foi carregado');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao redirecionar para checkout:', error);
      throw error;
    }
  }

  // Verificar status da assinatura
  static async verifySubscriptionStatus(subscriptionId: string): Promise<any> {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/stripe/subscription-status?subscription_id=${subscriptionId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao verificar status da assinatura');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erro ao verificar status da assinatura:', error);
      throw error;
    }
  }

  // Cancelar assinatura
  static async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao cancelar assinatura');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  // Atualizar assinatura (mudar plano)
  static async updateSubscription(currentSubscriptionId: string, newPriceId: string): Promise<any> {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/stripe/update-subscription`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          subscription_id: currentSubscriptionId,
          new_price_id: newPriceId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar assinatura');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  }

  // Criar portal do cliente
  static async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    try {
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: returnUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar sessão do portal');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erro ao criar sessão do portal:', error);
      throw error;
    }
  }
}

// Hook para usar o Stripe
export function useStripe() {
  const { user } = useAuth();

  // Criar sessão de checkout com dados do usuário
  const createCheckoutSession = async (params: StripeCheckoutParams) => {
    try {
      // Adicionar informações do usuário se disponível
      let customerInfo: StripeCustomerInfo | undefined;
      
      if (user) {
        customerInfo = {
          email: user.email,
          name: user.name,
          metadata: {
            user_id: user.id
          }
        };
      }

      // Criar sessão de checkout
      const session = await StripeService.createCheckoutSession(params, customerInfo);
      
      // Redirecionar para o checkout
      await StripeService.redirectToCheckout(session.session_id);
      
      return session;
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      throw error;
    }
  };

  // Cancelar assinatura atual
  const cancelSubscription = async (subscriptionId: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    return await StripeService.cancelSubscription(subscriptionId);
  };

  // Atualizar plano de assinatura
  const updateSubscription = async (currentSubscriptionId: string, newPriceId: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    return await StripeService.updateSubscription(currentSubscriptionId, newPriceId);
  };

  // Abrir portal do cliente
  const openCustomerPortal = async (customerId: string) => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const { url } = await StripeService.createCustomerPortalSession(
      customerId,
      window.location.origin + '/settings'
    );
    
    // Redirecionar para o portal
    window.location.href = url;
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    updateSubscription,
    openCustomerPortal
  };
}