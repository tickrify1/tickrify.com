import { X } from 'lucide-react';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestModal({ isOpen, onClose }: TestModalProps) {
  console.log('🧪 TestModal - isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('❌ TestModal não está aberta');
    return null;
  }
  
  console.log('✅ TestModal está aberta, renderizando...');
  
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
        className="bg-white rounded-lg p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teste Modal</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Esta é uma modal de teste para verificar se o problema é com a SubscriptionModal específica ou com modals em geral.
        </p>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
