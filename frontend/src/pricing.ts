export interface ProductPlan {
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

const env: any = (import.meta as any).env || {};
const TRADER_MONTHLY_PRICE_ID = env.VITE_STRIPE_PRICE_TRADER_MONTHLY || env.VITE_PRICE_TRADER_MONTHLY || 'price_trader_monthly_placeholder';
const TRADER_MONTHLY_AMOUNT = Number(env.VITE_STRIPE_PRICE_TRADER_MONTHLY_AMOUNT || env.VITE_PRICE_TRADER_MONTHLY_AMOUNT || 59.90);

export const products: ProductPlan[] = [
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
  }
];

export function getProductByPriceId(priceId: string): ProductPlan | undefined {
  return products.find(product => product.priceId === priceId);
}

export function getProductById(id: string): ProductPlan | undefined {
  return products.find(product => product.id === id);
}

export function getProductsByPrice(): ProductPlan[] {
  return [...products].sort((a, b) => a.price - b.price);
}

export function getPopularProduct(): ProductPlan | undefined {
  return products.find(product => product.popular);
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


