import { loadStripe } from '@stripe/stripe-js';

// Configurações do Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51...'; // Adicione sua chave pública aqui
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Inicializar Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export interface StripeCheckoutParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  mode: 'payment' | 'subscription';
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createCheckoutSession(params: StripeCheckoutParams): Promise<StripeCheckoutResponse> {
    try {
      console.log('🔄 Criando sessão de checkout no Stripe...');
      
      // URLs padrão se não fornecidas
      const successUrl = params.successUrl || `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = params.cancelUrl || `${window.location.origin}/cancel`;
      
      // Criar sessão no backend
      const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: params.priceId,
          successUrl,
          cancelUrl,
          mode: params.mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const session = await response.json();
      
      // Redirecionar para o Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe não foi carregado corretamente');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error: any) {
      console.error('Erro no Stripe Service:', error);
      throw new Error(`Erro ao processar pagamento: ${error.message}`);
    }
  }

  async getPaymentStatus(sessionId: string): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_URL}/checkout-session/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const session = await response.json();
      return session.payment_status;
    } catch (error: any) {
      console.error('Erro ao verificar status do pagamento:', error);
      return 'incomplete';
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/cancel-subscription/${subscriptionId}`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      return false;
    }
  }
}

export const stripeService = StripeService.getInstance();