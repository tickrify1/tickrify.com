import React, { useState } from 'react';
import { Settings, Key, Globe, Shield, Mail, MessageCircle, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export function CustomAPI() {
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSaveConfig = () => {
    // Simular salvamento
    setIsConfigured(true);
    alert('✅ Configuração salva! Nossa equipe entrará em contato em até 24h para finalizar a integração.');
  };

  const handleContactTeam = () => {
    const subject = encodeURIComponent('Configuração API Personalizada - Tickrify');
    const body = encodeURIComponent(`Olá equipe Tickrify!

Gostaria de configurar minha API personalizada com os seguintes detalhes:

📊 Plano: Personalizado
🔧 Tipo de integração: [Descreva aqui]
📈 Volume esperado: [Ex: 1000 análises/dia]
🎯 Casos de uso: [Descreva seus casos de uso]

Dados técnicos:
- API Key: [Será fornecida após contato]
- Webhook URL: [Será configurada após contato]
- Formato preferido: JSON/REST

Aguardo contato para finalizar a configuração!

Atenciosamente,
[Seu nome]`);

    window.open(`mailto:tech@tickrify.com?subject=${subject}&body=${body}`);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`🚀 Olá Tickrify! 

Tenho o plano Personalizado e gostaria de configurar minha API customizada.

Preciso de:
✅ Configuração de API Key
✅ Setup de Webhooks  
✅ Integração personalizada
✅ Suporte técnico dedicado

Podem me ajudar? 😊`);

    window.open(`https://wa.me/5511999999999?text=${message}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Header */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-emerald-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                API Personalizada
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-6">
              Configuração avançada para integração customizada
            </p>
          </div>
        </div>

        {/* Contact Team Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    🤝 Suporte Técnico Dedicado
                  </h2>
                  <p className="text-white/90">
                    Nossa equipe configura tudo para você
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 mb-8 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      🔧 Configuração Completa pela Equipe Tickrify
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Não se preocupe com configurações técnicas! Nossa equipe especializada faz tudo para você.
                    </p>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Configuração de API Keys seguras</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Setup de Webhooks personalizados</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Integração com seus sistemas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Documentação técnica completa</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Suporte técnico 24/7</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Contact */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Técnico</h3>
                      <p className="text-gray-600 text-sm">Suporte especializado</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 text-sm">
                    Entre em contato com nossa equipe técnica para configuração personalizada.
                  </p>
                  <button
                    onClick={handleContactTeam}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Enviar Email</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* WhatsApp Contact */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                      <p className="text-gray-600 text-sm">Atendimento direto</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4 text-sm">
                    Fale diretamente com nossa equipe via WhatsApp para suporte imediato.
                  </p>
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Abrir WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-blue-600/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    🛠️ Serviços Inclusos
                  </h2>
                  <p className="text-white/90">
                    O que nossa equipe faz para você
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">🔧 Configuração Técnica</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">API Keys Seguras</p>
                        <p className="text-gray-600 text-sm">Geração e configuração de chaves de acesso</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Webhooks Personalizados</p>
                        <p className="text-gray-600 text-sm">Configuração de endpoints para seus sistemas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Rate Limiting</p>
                        <p className="text-gray-600 text-sm">Configuração de limites personalizados</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">🚀 Suporte Avançado</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Integração Customizada</p>
                        <p className="text-gray-600 text-sm">Adaptação para seus sistemas específicos</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Documentação Técnica</p>
                        <p className="text-gray-600 text-sm">Guias completos e exemplos de código</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Suporte Dedicado 24/7</p>
                        <p className="text-gray-600 text-sm">Atendimento prioritário e especializado</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 to-blue-600/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ⚙️ Configuração em Andamento
              </h3>
              <p className="text-gray-600 mb-6">
                Entre em contato com nossa equipe para ativar sua API personalizada. 
                Configuramos tudo para você em até 24 horas!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleContactTeam}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contatar Equipe</span>
                </button>
                
                <button
                  onClick={handleWhatsAppContact}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}