import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';

export function Cancel() {
  const { navigateTo } = useNavigation();

  const handleGoBack = () => {
    navigateTo('dashboard');
  };

  const handleTryAgain = () => {
    alert('🔄 TENTAR NOVAMENTE\n\nRedirecionando para a página de assinatura...');
    navigateTo('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>
        
        <p className="text-gray-600 mb-8">
          Não se preocupe! Seu pagamento foi cancelado e nenhuma cobrança foi realizada. Você pode tentar novamente a qualquer momento.
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Ainda interessado?
          </h2>
          <p className="text-sm text-gray-600">
            O Tickrify oferece análise IA avançada para maximizar seus resultados no trading. Experimente nossos recursos premium!
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleTryAgain}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Precisa de ajuda? Entre em contato com nosso suporte
        </p>
      </div>
    </div>
  );
}