export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features?: string[];
  popular?: boolean;
}

// Stripe configuration with environment variables
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S2bwlB1hl0IoocUwCFKf6KydGRIgE82nz9v8RJDVkDbW5YqRHKOhUe3FkqtQOjJXlQQMYwKVRApPKgY2Z2G8a8m00EMLQq9qJ',
  mode: import.meta.env.NODE_ENV === 'production' ? 'live' : 'test'
};

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_free',
    priceId: 'price_free_local', // Plano FREE sempre será local
    name: 'FREE (Simulação)',
    description: 'Plano gratuito apenas para demonstração. Análises são simuladas, não utilizam IA real.',
    mode: 'payment',
    price: 0,
    currency: 'BRL',
    features: [
      '⚠️ APENAS DEMONSTRAÇÃO',
      '❌ Análises simuladas (não reais)',
      '❌ Sem IA verdadeira',
      '✅ Interface completa para testes',
      '✅ Visualização de funcionalidades',
      '❌ Sem dados reais de mercado',
      '❌ Resultados fictícios'
    ]
  },
  {
    id: 'prod_trader_real',
    priceId: import.meta.env.VITE_STRIPE_TRADER_PRICE_ID || 'price_1S2cj4B1hl0IoocUfB4Xwgrp', // Price ID real do Stripe configurado ✅
    name: 'TRADER (Profissional)',
    description: 'Plano profissional com análises reais de IA, dados de mercado em tempo real e todas as funcionalidades ativas.',
    mode: 'subscription',
    price: 59.90,
    currency: 'BRL',
    interval: 'month',
    popular: true,
    features: [
      '🚀 ANÁLISES REAIS COM IA',
      '✅ Tickrify IA GPT-4 avançada',
      '✅ Análise de imagens de gráficos',
      '✅ Indicadores técnicos profissionais',
      '✅ Alertas personalizados em tempo real',
      '✅ Padrões gráficos automáticos',
      '✅ Dados de mercado reais',
      '✅ Suporte prioritário por email',
      '✅ Dashboard profissional completo',
      '✅ Histórico de análises (50 máx)',
      '✅ Stop loss e take profit calculados'
    ]
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductsByPrice(): StripeProduct[] {
  return [...stripeProducts].sort((a, b) => a.price - b.price);
}

export function getPopularProduct(): StripeProduct | undefined {
  return stripeProducts.find(product => product.popular);
}

export function getProductFeatures(productId: string): string[] {
  const product = getProductById(productId);
  return product?.features || [];
}

export function formatPrice(price: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price);
}