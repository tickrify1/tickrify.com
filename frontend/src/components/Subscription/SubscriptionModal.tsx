import { useEffect, useRef, useState } from 'react';
import { X, Crown, Check, Zap, Star, Shield, Target, Brain } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { products, formatPrice } from '../../pricing';
import { useAuth } from '../../hooks/useAuth';
import { useStripe } from '../../hooks/useStripe';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string | null;
}

// Extract Badge component
const Badge = ({ children, className }) => (
  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${className}`}>
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
      {children}
    </div>
  </div>
);

// Extract PlanCard component
const PlanCard = ({ product, isCurrentPlan, isSelected, selectable, handlePlanSelect, isLoading }) => (
  <div
    key={product.id}
    className={`relative rounded-2xl border-2 p-4 sm:p-5 transition-all hover:shadow-xl min-w-0 w-full max-w-xs mx-auto ${
      product.popular
        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 transform sm:scale-105'
        : isCurrentPlan
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-blue-300'
    } flex flex-col justify-between`}
  >
    {product.popular && <Badge><Star className="w-4 h-4" /><span>POPULAR</span></Badge>}
    {isCurrentPlan && <Badge className="right-4"><div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">ATUAL</div></Badge>}
    <div className="text-center mb-4 sm:mb-6">
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 ${product.popular ? 'bg-blue-600' : 'bg-gray-600'}`}><Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></div>
      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h3>
      <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">{formatPrice(product.price)}</div>
      <p className="text-gray-600 text-xs sm:text-base">{product.interval === 'year' ? 'por ano' : 'por mês'}</p>
    </div>
    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-8">
      {product.features?.map((feature, index) => (
        <div key={index} className="flex items-start space-x-2 sm:space-x-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-gray-700 text-xs sm:text-sm">{feature}</span>
        </div>
      ))}
    </div>
    <button
      onClick={() => {
        if (selectable && !isLoading) {
          console.log('Selecionando plano:', product.priceId);
          handlePlanSelect(product.priceId);
        }
      }}
      disabled={isLoading || !selectable}
      className={`w-full py-2 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 text-xs sm:text-base ${
        isCurrentPlan
          ? 'bg-green-100 text-green-700 cursor-not-allowed'
          : product.popular
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
          : 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-105'
      } ${isLoading && isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading && isSelected ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processando...</span>
        </>
      ) : isCurrentPlan ? (
        <>
          <Check className="w-5 h-5" />
          <span>Plano Atual</span>
        </>
      ) : (
        <>
          <Crown className="w-5 h-5" />
          <span>Escolher Plano</span>
        </>
      )}
    </button>
  </div>
);

export function SubscriptionModal({ isOpen, onClose, initialPlanId }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(initialPlanId || null);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentPlan, getPlanType } = useSubscription();
  const { user, login } = useAuth();
  const { createCheckoutSession } = useStripe();
  const currentPlan = getCurrentPlan();
  const isFree = getPlanType() === 'free';
  
  const resumingRef = useRef(false);

  if (!isOpen) return null;

  // Simplifica a lógica de seleção
  const canSelect = (_product: any, isCurrentPlan: boolean) => {
    return !isCurrentPlan;
  };

  const handlePlanSelect = async (priceId: string) => {
    setIsLoading(true);
    setSelectedPlan(priceId);
    try {
      const product = products.find(p => p.priceId === priceId);
      if (!product) throw new Error('Plano não encontrado');
      // Se não estiver logado, guardar intenção e abrir login
      if (!user) {
        try {
          localStorage.setItem('tickrify-pending-price', priceId);
        } catch {}
        await login('', '');
        // Não continuar aqui; retomaremos após login pelo useEffect abaixo
        return;
      }
      // Sem bypass: usar Stripe para todos os usuários
      const origin = window.location.origin.replace(/\/$/, '');
      await createCheckoutSession({
        priceId: priceId,
        mode: product.mode,
        successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/cancel`
      });
    } catch (error) {
      console.error('Erro ao processar plano:', error);
      alert('Erro ao processar. Tente novamente.');
      setSelectedPlan(null); // só limpa seleção em caso de erro
    } finally {
      setIsLoading(false);
      // Não limpar selectedPlan aqui para manter feedback visual até redirecionar
    }
  };

  // Após login, retomar automaticamente o checkout se houve intenção anterior
  useEffect(() => {
    if (!isOpen || !user || resumingRef.current) return;
    let pending: string | null = null;
    try { pending = localStorage.getItem('tickrify-pending-price'); } catch {}
    if (!pending) return;
    const product = products.find(p => p.priceId === pending);
    if (!product) {
      try { localStorage.removeItem('tickrify-pending-price'); } catch {}
      return;
    }
    resumingRef.current = true;
    (async () => {
      try {
        setIsLoading(true);
        const origin = window.location.origin.replace(/\/$/, '');
        await createCheckoutSession({
          priceId: pending as string,
          mode: product.mode,
          successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/cancel`
        });
      } catch (err) {
        console.error('Erro ao retomar checkout:', err);
      } finally {
        setIsLoading(false);
        try { localStorage.removeItem('tickrify-pending-price'); } catch {}
        resumingRef.current = false;
      }
    })();
  }, [isOpen, user, createCheckoutSession]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Escolha Seu Plano</h2>
            <p className="text-blue-100">Desbloqueie todo o potencial da análise IA</p>
            
            {currentPlan && (
              <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 inline-block">
                <span className="text-sm">Plano atual: <strong>{currentPlan.name}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-4 sm:p-8">
          <div className="flex flex-wrap justify-center gap-6">
            {products.map((product) => {
              const isCurrentPlan = currentPlan?.priceId === product.priceId;
              const isSelected = selectedPlan === product.priceId;
              const selectable = canSelect(product, isCurrentPlan);
              return (
                <PlanCard
                  key={product.id}
                  product={product}
                  isCurrentPlan={isCurrentPlan}
                  isSelected={isSelected}
                  selectable={selectable}
                  handlePlanSelect={handlePlanSelect}
                  isLoading={isLoading}
                />
              );
            })}
          </div>

          {/* Benefits Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              🚀 Por que escolher o Tickrify?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">IA Avançada</h4>
                <p className="text-gray-600 text-sm">
                  Análise com Tickrify IA para identificar padrões complexos
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Alta Precisão</h4>
                <p className="text-gray-600 text-sm">
                  Taxa de acerto superior a 85% em nossas recomendações
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Gestão de Risco</h4>
                <p className="text-gray-600 text-sm">
                  Stop loss e take profit calculados automaticamente
                </p>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Garantia de 30 dias ou seu dinheiro de volta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}