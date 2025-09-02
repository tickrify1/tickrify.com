import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { getProductById } from '../stripe-config';

// Configuração dinâmica do Stripe
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK && STRIPE_PK !== 'pk_test_CONFIGURE_SUA_CHAVE_PUBLICA_AQUI' 
  ? loadStripe(STRIPE_PK) 
  : null;

export interface CheckoutResult {
  success: boolean;
  error?: string;
  demo?: boolean;
}

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const redirectToCheckout = async (priceId: string): Promise<CheckoutResult> => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando checkout para priceId:', priceId);
      console.log('🔑 STRIPE_PK:', STRIPE_PK);
      console.log('🔗 Backend URL:', import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000');
      
      // Verificar se o Stripe está configurado
      const isStripeConfigured = STRIPE_PK && 
        STRIPE_PK !== 'pk_test_CONFIGURE_SUA_CHAVE_PUBLICA_AQUI' &&
        priceId !== 'price_CONFIGURE_SEU_PRICE_ID_AQUI' &&
        STRIPE_PK.startsWith('pk_');

      console.log('✅ Stripe configurado:', isStripeConfigured);

      if (!isStripeConfigured) {
        console.warn('⚠️ Stripe não configurado - usando endpoint de demo');
        
        // Usar endpoint de demo
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/stripe/create-checkout-demo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            mode: 'subscription',
            successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cancel`,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao criar sessão de demo');
        }

        const demoResult = await response.json();
        console.log('✅ Demo checkout criado:', demoResult);
        
        // Simular redirecionamento em ambiente de desenvolvimento
        alert(`� DEMO CHECKOUT\n\nEm produção, você seria redirecionado para:\n${demoResult.url}\n\nPara configurar o Stripe real:\n1. Configure VITE_STRIPE_PUBLISHABLE_KEY no .env\n2. Configure o priceId real no stripe-config.ts`);
        
        // Simular sucesso após configuração
        setTimeout(() => {
          window.location.href = `/success?session_id=${demoResult.sessionId}&demo=true`;
        }, 2000);
        
        return { success: true, demo: true };
      }

      // Fluxo normal do Stripe (chaves configuradas)
      console.log('✅ Usando Stripe real - carregando...');
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe não foi carregado corretamente');
      }

      console.log('🌐 Chamando backend para criar sessão...');
      // Chamar backend para criar sessão real
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.detail || 'Erro ao criar sessão de checkout');
      }

      const { sessionId, url } = await response.json();
      console.log('✅ Sessão criada:', sessionId);
      console.log('🔗 URL do checkout:', url);

      // Redirecionar para checkout real do Stripe
      console.log('🚀 Redirecionando para Stripe Checkout...');
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        console.error('❌ Erro no redirecionamento:', result.error);
        throw new Error(result.error.message);
      }

      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Erro no checkout:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao processar pagamento' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const createTraderCheckout = async (): Promise<CheckoutResult> => {
    // Buscar o produto Trader configurado
    const traderProduct = getProductById('prod_trader_real');
    if (!traderProduct) {
      return {
        success: false,
        error: 'Produto Trader não encontrado na configuração'
      };
    }
    
    return redirectToCheckout(traderProduct.priceId);
  };

  return {
    redirectToCheckout,
    createTraderCheckout,
    isLoading,
  };
};
