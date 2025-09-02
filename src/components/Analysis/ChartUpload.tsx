import React, { useState, useRef } from 'react';
import { Upload, Camera, Image, Zap, AlertCircle, CheckCircle, X, Loader2, Brain, BarChart3, Target, Activity } from 'lucide-react';
import { useAnalysisImproved } from '../../hooks/useAnalysisImproved';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { SubscriptionModal } from '../Subscription/SubscriptionModal';
import AnalysisSavedNotification from './AnalysisSavedNotification';

const ChartUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('');
  const [detectedSymbol, setDetectedSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [savedAnalysisData, setSavedAnalysisData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeChart, isAnalyzing, currentAnalysis, analiseIA, clearAnalysis, canAnalyze, monthlyUsage, planLimits, forceReset, analysisProgress } = useAnalysisImproved();
  const { getPlanType } = useSubscription();
  const { user } = useAuth();
  const { isMobile } = useDeviceDetection();

  // Garantir que novos usuários começam com dados limpos
  React.useEffect(() => {
    // Se é a primeira vez na plataforma, garantir que não há análise prévia
    if (monthlyUsage.count === 0 && currentAnalysis) {
      // Limpar qualquer análise residual
      console.log('🧹 Limpando dados para novo usuário');
      clearAnalysis();
    }
  }, []);

  // Limpeza automática ao carregar a página
  React.useEffect(() => {
    // Sempre limpar análises ao carregar o componente para garantir estado limpo
    console.log('🔄 Limpando estados ao carregar ChartUpload');
    forceReset();
  }, []);

  // Debug dos estados que controlam o botão
  React.useEffect(() => {
    console.log('🔍 [BUTTON DEBUG] Estados do botão:');
    console.log('🔍 [BUTTON DEBUG] selectedFile:', !!selectedFile);
    console.log('🔍 [BUTTON DEBUG] isAnalyzing:', isAnalyzing);
    console.log('🔍 [BUTTON DEBUG] currentAnalysis:', !!currentAnalysis);
    console.log('🔍 [BUTTON DEBUG] analiseIA:', !!analiseIA);
    console.log('🔍 [BUTTON DEBUG] Botão visível:', !!(selectedFile && !isAnalyzing && !currentAnalysis && !analiseIA));
  }, [selectedFile, isAnalyzing, currentAnalysis, analiseIA]);

  // Listener para eventos de análise salva
  React.useEffect(() => {
    const handleAnalysisSaved = (event: CustomEvent) => {
      console.log('📩 Evento de análise salva recebido:', event.detail);
      setSavedAnalysisData(event.detail);
      setShowSavedNotification(true);
    };

    window.addEventListener('analysis-saved', handleAnalysisSaved as EventListener);
    
    return () => {
      window.removeEventListener('analysis-saved', handleAnalysisSaved as EventListener);
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    setDetectedSymbol(''); // Reset detected symbol
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem (PNG, JPG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };



  const handleAnalyze = async () => {
    console.log('🚀🚀🚀 [DEBUG] BOTÃO ANALISAR CLICADO!!!');
    console.log('🎯 [DEBUG] handleAnalyze iniciado');
    console.log('🎯 [DEBUG] selectedFile:', !!selectedFile);
    console.log('🎯 [DEBUG] canAnalyze:', canAnalyze());
    console.log('🎯 [DEBUG] monthlyUsage:', monthlyUsage);
    console.log('🎯 [DEBUG] planType:', getPlanType());
    
    if (!selectedFile) {
      console.log('❌ [DEBUG] Erro: Nenhum arquivo selecionado');
      setError('Selecione uma imagem primeiro');
      return;
    }

    if (!canAnalyze()) {
      console.log('❌ [DEBUG] Erro: Limite mensal esgotado');
      const errorMessage = planType === 'free' 
        ? `Limite de simulações esgotado! Você já usou suas ${monthlyUsage.count} análises de demonstração este mês. Assine o plano Trader para análises reais ilimitadas.`
        : `Limite mensal esgotado! Você já usou ${monthlyUsage.count} análises este mês.`;
      setError(errorMessage);
      return;
    }

    console.log('✅ [DEBUG] Iniciando análise...');
    
    try {
      setError(null);
      
      console.log('📁 [DEBUG] Convertendo arquivo para base64...');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        console.log('📸 [DEBUG] Arquivo convertido para base64');
        const imageData = e.target?.result as string;
        
        try {
          console.log('🚀 [DEBUG] Chamando analyzeChart...');
          const result = await analyzeChart(imageData);
          
          console.log('✅ [DEBUG] Análise concluída:', result);
          
          // Análise concluída com sucesso
          if (result) {
            console.log('🎯 [DEBUG] Análise salva com sucesso');
          }
          
        } catch (error) {
          console.error('❌ [DEBUG] Erro na análise:', error);
          setError(error instanceof Error ? error.message : 'Erro ao analisar imagem');
        }
      };
      reader.readAsDataURL(selectedFile);
      
    } catch (err: any) {
      console.error('❌ [DEBUG] Erro geral:', err);
      setError(err.message || 'Erro ao analisar imagem');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedSymbol('');
    setSymbol('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNovaAnalise = () => {
    console.log('🔄 Iniciando Nova Análise...');
    
    // 1. Limpar todos os estados locais
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedSymbol('');
    setSymbol('');
    setError(null);
    
    // 2. Limpar input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // 3. Limpar análise atual
    clearAnalysis();
    
    // 4. Force re-render
    setTimeout(() => {
      console.log('✅ Nova análise pronta para começar');
    }, 100);
  };

  const planType = getPlanType();
  const currentLimit = planLimits[planType];
  const usagePercentage = currentLimit === Infinity ? 0 : (monthlyUsage.count / currentLimit) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Usage Warning */}
      {usagePercentage >= 80 && currentLimit !== Infinity && (
        <div className={`p-4 rounded-lg border ${
          usagePercentage >= 95 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className={`w-5 h-5 ${
              usagePercentage >= 95 ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <p className={`font-medium ${
              usagePercentage >= 95 ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {usagePercentage >= 95 
                ? `🚨 Crítico: Apenas ${currentLimit - monthlyUsage.count} ${planType === 'free' ? 'simulações' : 'análises'} restantes!`
                : `⚠️ Atenção: ${currentLimit - monthlyUsage.count} ${planType === 'free' ? 'simulações' : 'análises'} restantes este mês`
              }
              {planType === 'free' && <span className="block text-sm mt-1">Estas são análises de demonstração. Para IA real, assine o plano Trader.</span>}
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg shadow-md"
              />
              <button
                onClick={clearSelection}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Imagem selecionada: {selectedFile?.name}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {isMobile ? (
                <Camera className="w-12 h-12 text-gray-400" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isMobile ? 'Tire uma foto ou selecione uma imagem' : 'Arraste uma imagem aqui'}
              </p>
              <p className="text-gray-500 mt-1">
                {isMobile ? 'Toque para abrir a câmera ou galeria' : 'ou clique para selecionar um arquivo'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                PNG, JPG até 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Symbol Input */}
      {selectedFile && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Símbolo do Ativo {detectedSymbol ? '(detectado automaticamente)' : '(opcional)'}
            </label>
            {detectedSymbol && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Detectado: {detectedSymbol}
              </span>
            )}
          </div>
          <input
            type="text"
            value={symbol || detectedSymbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              detectedSymbol ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
            placeholder={detectedSymbol || "Ex: EURUSD, BTCUSDT, AAPL, PETR4"}
            disabled={isAnalyzing}
          />
          {detectedSymbol && (
            <p className="text-xs text-green-600 mt-1">
              Símbolo detectado automaticamente do gráfico. Você pode editá-lo se necessário.
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Debug Button - Temporary */}
      {(currentAnalysis || analiseIA) && (
        <div className="text-center">
          <button
            onClick={() => {
              console.log('🔄 DEBUG: Forçando reset manual...');
              forceReset();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            🔄 Reset Manual (Debug)
          </button>
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !isAnalyzing && !currentAnalysis && !analiseIA && (
        <div className="text-center space-y-4">
          {/* Blocked State */}
          {user?.blocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-900">Limite Atingido</h4>
                  <p className="text-sm text-red-700">
                    Você atingiu o limite mensal de análises. Faça upgrade para continuar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Fazer Upgrade Agora
              </button>
            </div>
          )}
          
          {/* Warning State */}
          {user?.warning && !user?.blocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Próximo do Limite</h4>
                  <p className="text-sm text-yellow-700">
                    Você está próximo do seu limite mensal. Considere fazer upgrade.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || user?.blocked}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3 mx-auto ${
              user?.blocked 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Brain className="w-6 h-6" />
            <span>{user?.blocked ? 'Bloqueado' : 'Analisar com IA'}</span>
            <Zap className="w-6 h-6" />
          </button>

          {/* Alpha Pro sempre tem acesso - remover mensagem de upgrade */}
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analisando com IA</h3>
            <p className="text-gray-600">Nossa IA está processando seu gráfico...</p>
          </div>
          
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className={`p-3 rounded-lg ${analysisProgress > 20 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Lendo Gráfico</div>
              </div>
              <div className={`p-3 rounded-lg ${analysisProgress > 60 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="text-2xl mb-1">🔍</div>
                <div className="text-sm font-medium">Detectando Símbolo</div>
              </div>
              <div className={`p-3 rounded-lg ${analysisProgress > 90 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="text-2xl mb-1">🧠</div>
                <div className="text-sm font-medium">Analisando IA</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progresso da análise</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Detectando símbolo e analisando... 15-30 segundos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {(analiseIA || currentAnalysis) && !isAnalyzing && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Análise Concluída</h3>
            <p className="text-gray-600">Resultado da análise para {symbol}</p>
          </div>

          {/* Main Decision */}
          <div className={`p-6 rounded-xl text-center mb-6 ${
            (analiseIA?.signal === 'BUY') || 
            (!analiseIA && currentAnalysis?.signal === 'BUY')
              ? 'bg-green-50 border-2 border-green-200'
              : (analiseIA?.signal === 'SELL') ||
                (!analiseIA && currentAnalysis?.signal === 'SELL')
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className="text-4xl mb-3">
              {(analiseIA?.signal === 'BUY') || 
               (!analiseIA && currentAnalysis?.signal === 'BUY') ? '🚀' :
               (analiseIA?.signal === 'SELL') ||
               (!analiseIA && currentAnalysis?.signal === 'SELL') ? '📉' : '⏸️'}
            </div>
            <h4 className={`text-2xl font-bold mb-2 ${
              (analiseIA?.signal === 'BUY') || 
              (!analiseIA && currentAnalysis?.signal === 'BUY')
                ? 'text-green-700'
                : (analiseIA?.signal === 'SELL') ||
                  (!analiseIA && currentAnalysis?.signal === 'SELL')
                ? 'text-red-700'
                : 'text-gray-700'
            }`}>
              {(analiseIA?.signal === 'BUY') || 
               (!analiseIA && currentAnalysis?.signal === 'BUY') ? 'COMPRAR' :
               (analiseIA?.signal === 'SELL') ||
               (!analiseIA && currentAnalysis?.signal === 'SELL') ? 'VENDER' : 'AGUARDAR'}
            </h4>
            <div className="bg-white rounded-lg p-3 inline-block">
              <p className="font-semibold text-gray-900">
                Confiança: {analiseIA?.confidence || currentAnalysis?.confidence}%
              </p>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Analysis */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análise Técnica IA
              </h5>
              <p className="text-blue-800 text-sm leading-relaxed">
                {analiseIA?.reasoning || currentAnalysis?.reasoning || 'Análise técnica detalhada com IA baseada no gráfico enviado.'}
              </p>
              {getPlanType() !== 'free' && (
                <div className="mt-3 p-2 bg-green-50 rounded border">
                  <p className="text-xs text-green-700 font-medium">
                    ✅ Análise Real com IA: RSI, MACD, Bandas de Bollinger, Volume, Padrões Candlestick, Suporte/Resistência
                  </p>
                </div>
              )}
            </div>

            {/* Risk Management */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Gestão de Risco
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Stop Loss:</span>
                  <span className="font-bold text-purple-900">${currentAnalysis?.stopLoss?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Take Profit:</span>
                  <span className="font-bold text-purple-900">${currentAnalysis?.priceTarget?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Risk Level:</span>
                  <span className={`font-bold ${
                    currentAnalysis?.riskLevel === 'HIGH' ? 'text-red-600' :
                    currentAnalysis?.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {currentAnalysis?.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          {currentAnalysis?.technicalIndicators && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Indicadores Técnicos
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-2 border border-gray-300 text-center">
                  <p className="text-gray-800 text-sm font-medium">RSI: {currentAnalysis.technicalIndicators.rsi}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-300 text-center">
                  <p className="text-gray-800 text-sm font-medium">MACD: {currentAnalysis.technicalIndicators.macd}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-300 text-center">
                  <p className="text-gray-800 text-sm font-medium">Bollinger: {currentAnalysis.technicalIndicators.bollinger}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-300 text-center">
                  <p className="text-gray-800 text-sm font-medium">Volume: {currentAnalysis.technicalIndicators.volume}</p>
                </div>
              </div>
              
              {/* Detailed AI Analysis for TRADER users */}
              {getPlanType() !== 'free' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h6 className="font-bold text-gray-900 mb-3 flex items-center">
                    🧠 Análise IA Completa (TRADER)
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-blue-700">Estrutura de Mercado:</strong>
                      <br />• Tendência Primária/Secundária
                      <br />• Suportes e Resistências
                      <br />• Linhas de Tendência
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-green-700">Padrões Candlestick:</strong>
                      <br />• Martelo, Doji, Engolfo
                      <br />• Padrões de Reversão
                      <br />• Força dos Sinais
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-purple-700">Indicadores Avançados:</strong>
                      <br />• RSI (14) + Divergências
                      <br />• MACD + Crossovers
                      <br />• Stochastic + Momentum
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-orange-700">Médias Móveis:</strong>
                      <br />• MM20, MM50, MM200
                      <br />• Configurações Técnicas
                      <br />• Sinais de Entrada/Saída
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-red-700">Volume Analysis:</strong>
                      <br />• Volume vs Preço
                      <br />• Confirmação de Movimentos
                      <br />• Padrões de Distribuição
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong className="text-indigo-700">Confluências:</strong>
                      <br />• Múltiplos Sinais
                      <br />• Zonas de Alta Probabilidade
                      <br />• Risk/Reward Otimizado
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✅ Timeframe: {currentAnalysis.timeframe} | Confiança: {currentAnalysis.confidence}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fallback Indicators for currentAnalysis */}
          {!analiseIA && currentAnalysis && currentAnalysis.technicalIndicators && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Indicadores Técnicos
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-300">
                  <p className="text-gray-800 text-sm font-medium">RSI: {currentAnalysis.technicalIndicators.rsi}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-300">
                  <p className="text-gray-800 text-sm font-medium">MACD: {currentAnalysis.technicalIndicators.macd}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-300">
                  <p className="text-gray-800 text-sm font-medium">Bollinger: {currentAnalysis.technicalIndicators.bollinger}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-300">
                  <p className="text-gray-800 text-sm font-medium">Volume: {currentAnalysis.technicalIndicators.volume}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleNovaAnalise}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Nova Análise
            </button>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Image className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Uso Mensal: {monthlyUsage.count}/{currentLimit === Infinity ? '∞' : currentLimit}
            {planType === 'free' && <span className="text-orange-600 ml-2">(Simulação)</span>}
          </span>
        </div>
        <div className="text-sm text-blue-700">
          {planType === 'free' 
            ? 'Análises simuladas para demonstração - Para IA real, assine o plano Trader'
            : 'Análise avançada com IA Alpha Pro'
          }
        </div>
      </div>

      {/* Upgrade Modal */}
      <SubscriptionModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Analysis Saved Notification */}
      {showSavedNotification && savedAnalysisData && (
        <AnalysisSavedNotification 
          show={showSavedNotification} 
          onClose={() => setShowSavedNotification(false)}
          analysis={savedAnalysisData}
        />
      )}
    </div>
  );
};

export default ChartUpload;