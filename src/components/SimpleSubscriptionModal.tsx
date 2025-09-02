import { X, Crown, Check } from 'lucide-react';

interface SimpleSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleSubscriptionModal({ isOpen, onClose }: SimpleSubscriptionModalProps) {
  console.log('🔍 SimpleSubscriptionModal - isOpen:', isOpen);

  if (!isOpen) {
    console.log('❌ SimpleSubscriptionModal não está aberta');
    return null;
  }

  console.log('✅ SimpleSubscriptionModal está aberta, renderizando...');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Escolha seu Plano</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano FREE */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">🆓 FREE</h3>
            <div className="text-3xl font-bold mb-4">R$ 0,00</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                10 análises simuladas
              </li>
              <li className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                Apenas demonstração
              </li>
            </ul>
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg"
            >
              Plano Atual
            </button>
          </div>

          {/* Plano TRADER */}
          <div className="border border-blue-500 rounded-lg p-6 bg-blue-50">
            <h3 className="text-xl font-bold mb-2">🚀 TRADER</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">R$ 59,90</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                120 análises reais
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                IA GPT-4 avançada
              </li>
            </ul>
            <button 
              onClick={() => {
                console.log('🚀 Clicou em Assinar Trader');
                alert('Teste: Clicou em Assinar Trader!');
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              <Crown className="w-4 h-4 inline mr-2" />
              Assinar Trader
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
