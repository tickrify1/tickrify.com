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

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SenfkI77B5gR7Q',
    priceId: 'price_1RjU3gB1hl0IoocUWlz842SY',
    name: 'Trader',
    description: 'Ideal para traders ativos que precisam de análises frequentes com IA avançada. Inclui 120 análises mensais com Tickrify IA, alertas personalizados e ferramentas avançadas.',
    mode: 'subscription',
    price: 59.90,
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