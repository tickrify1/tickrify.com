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

// Carregar IDs de preços do Stripe via variáveis de ambiente (Vite)
const env: any = (import.meta as any).env || {};
const TRADER_MONTHLY_PRICE_ID = env.VITE_STRIPE_PRICE_TRADER_MONTHLY || 'price_trader_monthly_placeholder';
const TRADER_YEARLY_PRICE_ID = env.VITE_STRIPE_PRICE_TRADER_YEARLY || 'price_trader_yearly_placeholder';

// Valores exibidos no UI (opcionalmente configuráveis)
const TRADER_MONTHLY_AMOUNT = Number(env.VITE_STRIPE_PRICE_TRADER_MONTHLY_AMOUNT || 59.90);
const TRADER_YEARLY_AMOUNT = Number(
  env.VITE_STRIPE_PRICE_TRADER_YEARLY_AMOUNT || (TRADER_MONTHLY_AMOUNT * 10).toFixed(2)
);

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SenfkI77B5gR7Q',
    priceId: TRADER_MONTHLY_PRICE_ID,
    name: 'Trader Mensal',
    description: 'Ideal para traders ativos que precisam de análises frequentes com IA avançada. Inclui 120 análises mensais com Tickrify IA, alertas personalizados e ferramentas avançadas.',
    mode: 'subscription',
    price: TRADER_MONTHLY_AMOUNT,
    currency: 'BRL',
    interval: 'month',
    features: [
      '120 análises IA por mês',
      'Tickrify IA avançada',
      'Análise de imagens de gráficos',
      'Indicadores técnicos avançados',
      'Alertas personalizados',
      'Padrões gráficos automáticos',
      'Suporte por email'
    ]
  },
  {
    id: 'prod_SenfkI77B5gR7Q_yearly',
    priceId: TRADER_YEARLY_PRICE_ID,
    name: 'Trader Anual',
    description: 'Plano anual do Trader com os mesmos recursos do mensal, com economia no pacote anual.',
    mode: 'subscription',
    price: TRADER_YEARLY_AMOUNT,
    currency: 'BRL',
    interval: 'year',
    features: [
      '120 análises IA por mês',
      'Tickrify IA avançada',
      'Análise de imagens de gráficos',
      'Indicadores técnicos avançados',
      'Alertas personalizados',
      'Padrões gráficos automáticos',
      'Suporte por email'
    ],
    popular: true
  },
  
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