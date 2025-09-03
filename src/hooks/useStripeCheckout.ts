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

  // Detectar ambiente automaticamente
  const getEnvironmentConfig = () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isVercel = hostname.includes('vercel.app') || hostname.includes('.app');
    const isCustomDomain = !isLocal && !isVercel;
    
    const baseUrl = window.location.origin;
    
    // Priorizar variáveis de ambiente para backend URL
    let backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    if (!backendUrl || backendUrl === 'http://localhost:8000') {
      if (isLocal) {
        backendUrl = 'http://localhost:8000';
      } else {
        // Em produção, inferir a URL do backend baseado no hostname
        backendUrl = `https://api.${hostname}` || 'https://seu-backend.vercel.app';
      }
    }
    
    return { 
      baseUrl, 
      backendUrl, 
      isProduction: !isLocal,
      isLocal,
      isVercel,
      isCustomDomain,
      hostname 
    };
  };

  const redirectToCheckout = async (priceId: string, userEmail?: string): Promise<CheckoutResult> => {
    setIsLoading(true);
    
    try {
      const { baseUrl, backendUrl, isProduction, isLocal, hostname } = getEnvironmentConfig();
      
      console.log('🚀 Iniciando checkout para priceId:', priceId);
      console.log('🔑 STRIPE_PK:', STRIPE_PK ? 'Configurado' : 'Não configurado');
      console.log('🔗 Backend URL:', backendUrl);
      console.log('🌐 Ambiente:', {
        hostname,
        isLocal,
        isProduction,
        baseUrl
      });
      
      // Verificar se o Stripe está configurado
      const isStripeConfigured = STRIPE_PK && 
        STRIPE_PK !== 'pk_test_CONFIGURE_SUA_CHAVE_PUBLICA_AQUI' &&
        priceId !== 'price_CONFIGURE_SEU_PRICE_ID_AQUI' &&
        STRIPE_PK.startsWith('pk_');

      console.log('✅ Stripe configurado:', isStripeConfigured);

      if (!isStripeConfigured) {
        console.warn('⚠️ Stripe não configurado - usando endpoint de demo');
        
        // Usar endpoint de demo
        const response = await fetch(`${backendUrl}/stripe/create-checkout-demo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            mode: 'subscription',
            successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/cancel`,
            user_email: userEmail,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro na resposta do demo:', errorText);
          throw new Error(`Erro ao criar sessão de demo: ${response.status}`);
        }

        const demoResult = await response.json();
        console.log('✅ Demo checkout criado:', demoResult);
        
        // Simular redirecionamento em ambiente de desenvolvimento
        if (isLocal) {
          alert(`🎯 DEMO CHECKOUT\n\nEm produção, você seria redirecionado para:\n${demoResult.url}\n\nPara configurar o Stripe real:\n1. Configure VITE_STRIPE_PUBLISHABLE_KEY no .env\n2. Configure o priceId real no stripe-config.ts`);
        }
        
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
      
      // Chamada com timeout e retry
      const response = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
          successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/cancel`,
          user_email: userEmail,
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', { 
          status: response.status, 
          statusText: response.statusText, 
          body: errorText 
        });
        
        // Tentar parsear como JSON se possível
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText || 'Erro no servidor' };
        }
        
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`);
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

  const createTraderCheckout = async (userEmail?: string): Promise<CheckoutResult> => {
    // Buscar o produto Trader configurado
    const traderProduct = getProductById('prod_trader_real');
    if (!traderProduct) {
      return {
        success: false,
        error: 'Produto Trader não encontrado na configuração'
      };
    }
    
    return redirectToCheckout(traderProduct.priceId, userEmail);
  };

  return {
    redirectToCheckout,
    createTraderCheckout,
    isLoading,
  };
};
