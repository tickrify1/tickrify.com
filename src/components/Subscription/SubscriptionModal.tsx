import { useState } from 'react';
import { X, Crown, Check } from 'lucide-react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createTraderCheckout } = useStripeCheckout();

  if (!isOpen) return null;

  const handleUpgradeToTrader = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando upgrade para plano Trader...');
      
      const result = await createTraderCheckout();
      
      if (result.success) {
        console.log('✅ Redirecionando para checkout do Stripe...');
        // O usuário será redirecionado para o Stripe Checkout
      } else {
        console.error('❌ Erro no checkout:', result.error);
        alert(`Erro ao processar pagamento: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Erro no upgrade:', error);
      alert('Erro ao processar upgrade. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 md:p-4 plan-modal"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl md:rounded-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto plan-modal-content">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 rounded-t-xl md:rounded-t-2xl plan-header">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 plan-title">
                Escolha seu Plano
              </h2>
              <p className="text-sm md:text-base text-gray-600 plan-subtitle">
                Você está atualmente no plano{' '}
                <span className="font-semibold text-blue-600">FREE</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors ml-2 plan-close-button bg-white border border-gray-300 shadow-sm"
              disabled={isLoading}
              aria-label="Fechar modal"
              title="Fechar"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            
            {/* Plano FREE - Atual */}
            <div className="border border-gray-200 rounded-xl p-4 md:p-6 relative bg-gray-50 plan-card">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full plan-badge">
                  PLANO ATUAL
                </span>
              </div>
              
              <div className="mb-6 pr-20">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 plan-title">
                  🆓 FREE (Demonstração)
                </h3>
                <div className="mb-3 plan-price">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    R$ 0,00
                  </span>
                  <span className="text-sm md:text-base font-normal text-gray-500">
                    /mês
                  </span>
                </div>
                <p className="text-xs md:text-sm text-orange-600 font-medium leading-relaxed">
                  ⚠️ Apenas para demonstração - Análises simuladas
                </p>
              </div>

              <div className="space-y-3 mb-8 plan-feature-list">
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">10 análises simuladas por mês</span>
                </div>
                <div className="plan-feature-item">
                  <X className="w-4 h-4 text-red-500 plan-feature-icon" />
                  <span className="text-gray-500 plan-feature-text">Análises são fictícias</span>
                </div>
                <div className="plan-feature-item">
                  <X className="w-4 h-4 text-red-500 plan-feature-icon" />
                  <span className="text-gray-500 plan-feature-text">Sem IA real</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">Interface completa para testes</span>
                </div>
              </div>

              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed plan-button"
              >
                Plano Atual
              </button>
            </div>

            {/* Plano TRADER - Upgrade */}
            <div className="border-2 border-blue-500 rounded-xl p-4 md:p-6 relative bg-gradient-to-br from-blue-50 to-indigo-50 plan-card">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex items-center plan-badge">
                  <Crown className="w-3 h-3 mr-1" />
                  RECOMENDADO
                </span>
              </div>
              
              <div className="mb-6 pr-24">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 plan-title">
                  🚀 TRADER (Profissional)
                </h3>
                <div className="mb-3 plan-price">
                  <span className="text-2xl md:text-3xl font-bold text-blue-600">
                    R$ 59,90
                  </span>
                  <span className="text-sm md:text-base font-normal text-gray-500">
                    /mês
                  </span>
                </div>
                <p className="text-xs md:text-sm text-green-600 font-medium leading-relaxed">
                  ✅ Análises reais com IA avançada
                </p>
              </div>

              <div className="space-y-3 mb-8 plan-feature-list">
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">120 análises reais por mês</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">IA GPT-4 avançada</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">Análise real de gráficos</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">Indicadores técnicos reais</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">Dados de mercado em tempo real</span>
                </div>
                <div className="plan-feature-item">
                  <Check className="w-4 h-4 text-green-500 plan-feature-icon" />
                  <span className="plan-feature-text">Suporte prioritário</span>
                </div>
              </div>

              <button
                onClick={handleUpgradeToTrader}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center plan-button"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar Trader - R$ 59,90/mês
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Informações importantes */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              ℹ️ Informações Importantes
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>FREE:</strong> Análises são simuladas apenas para demonstração</li>
              <li>• <strong>TRADER:</strong> Análises reais com IA, dados reais de mercado</li>
              <li>• Você pode cancelar sua assinatura a qualquer momento</li>
              <li>• Pagamento processado de forma segura pelo Stripe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
