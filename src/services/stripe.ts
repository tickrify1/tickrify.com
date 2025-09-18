// Serviço Stripe simplificado - apenas local
export interface StripeCheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
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
      console.log('🔄 Simulando checkout Stripe (modo local)...');
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para URL de sucesso simulada
      const mockSessionId = 'cs_local_' + Date.now();
      const successUrl = params.successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId);
      
      return {
        sessionId: mockSessionId,
        url: successUrl,
      };
    } catch (error: any) {
      console.error('Erro no Stripe Service:', error);
      throw new Error(`Erro ao processar pagamento: ${error.message}`);
    }
  }

  async getPaymentStatus(): Promise<string> {
    return 'complete';
  }

  async cancelSubscription(): Promise<boolean> {
    return true;
  }
}

export const stripeService = StripeService.getInstance();