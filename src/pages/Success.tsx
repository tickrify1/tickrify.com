import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Crown, Zap } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from '../stripe-config';

export function Success() {
  const { navigateTo } = useNavigation();
  const { refetch, getCurrentPlan, switchPlan } = useSubscription();
  const { user, refreshUserStats } = useAuth();
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    // Verificar se há session_id na URL (retorno do Stripe)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    const isDemoParam = urlParams.get('demo');
    
    if (sessionIdParam) {
      if (isDemoParam === 'true') {
        console.log('🎯 Modo demo detectado - simulando ativação');
        // Em modo demo, simular a ativação sem chamar APIs reais
        setTimeout(() => {
          console.log('✅ Demo: Plano Trader ativado simuladamente');
        }, 1000);
      } else {
        verifyPaymentAndActivate(sessionIdParam);
      }
    } else {
      // Refetch subscription data to get the latest status
      const timer = setTimeout(() => {
        refetch();
      }, 2000); // Wait 2 seconds for webhook to process

      return () => clearTimeout(timer);
    }
  }, [refetch, switchPlan]);

  const verifyPaymentAndActivate = async (sessionId: string) => {
    try {
      setIsActivating(true);
      console.log('🔍 Verificando pagamento para sessão:', sessionId);
      
      // Verificar o status do pagamento no backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/checkout-session/${sessionId}`);
      if (response.ok) {
        const sessionData = await response.json();
        console.log('✅ Pagamento verificado:', sessionData);
        
        if (sessionData.session?.payment_status === 'paid') {
          // Ativar o plano Trader no frontend
          await switchPlan(import.meta.env.VITE_STRIPE_TRADER_PRICE_ID || 'price_1S2cj4B1hl0IoocUfB4Xwgrp');
          
          // Atualizar estatísticas do usuário se disponível
          if (user?.email) {
            await refreshUserStats();
          }
          
          console.log('✅ Plano Trader ativado com sucesso!');
        }
        
        refetch();
      }
    } catch (error) {
      console.error('❌ Erro ao verificar pagamento:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleContinue = () => {
    navigateTo('dashboard');
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {isActivating && (
          <div className="mb-6">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Ativando seu plano...</p>
          </div>
        )}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Pagamento Confirmado!
        </h1>
        
        <p className="text-gray-600 mb-8">
          {currentPlan 
            ? `Sua assinatura do ${currentPlan.name} foi ativada com sucesso!`
            : 'Sua assinatura do Tickrify foi ativada com sucesso!'
          } Agora você tem acesso completo a todas as funcionalidades premium!
        </p>

        {/* Plan Details */}
        {currentPlan && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{currentPlan.name}</h3>
                <p className="text-blue-700 text-sm">{formatPrice(currentPlan.price)}/mês</p>
              </div>
              <Crown className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recursos Desbloqueados</h2>
          </div>
          
          <div className="space-y-3 text-left">
            {currentPlan?.features ? (
              currentPlan.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))
            ) : (
              [
                'Análises ILIMITADAS com IA',
                'Análise de imagens de gráficos',
                'Sinais automáticos em tempo real',
                'Dashboard avançado',
                'Suporte prioritário'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2"
        >
          <span>Começar a Usar</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Você receberá um email de confirmação em breve
        </p>
      </div>
    </div>
  );
}