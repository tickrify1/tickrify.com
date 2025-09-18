import React, { useState, useRef } from 'react';
import { Upload, Camera, Image, Zap, AlertCircle, CheckCircle, X, Loader2, Brain, BarChart3, Target, Activity } from 'lucide-react';
import { useAnalysis } from '../../hooks/useAnalysis';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionModal } from '../Subscription/SubscriptionModal';

const ChartUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('');
  const [detectedSymbol, setDetectedSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeChart, isAnalyzing, canAnalyze, monthlyUsage, planLimits, currentAnalysis, analiseIA, clearAnalysis } = useAnalysis();
  const { getPlanType } = useSubscription();
  const { isMobile } = useDeviceDetection();

  // Garantir que novos usuários começam com dados limpos
  React.useEffect(() => {
    // Se é a primeira vez na plataforma, garantir que não há análise prévia
    if (monthlyUsage.count === 0 && currentAnalysis) {
      // Limpar qualquer análise residual
      console.log('🧹 Limpando dados para novo usuário');
    }
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
    if (!selectedFile) {
      setError('Selecione uma imagem primeiro');
      return;
    }

    // Se for usuário FREE, mostrar modal de upgrade
    if (getPlanType() === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    if (!canAnalyze()) {
      setError(`Limite mensal esgotado! Você já usou ${monthlyUsage.count} análises este mês.`);
      return;
    }

    try {
      setError(null);
      setAnalysisProgress(0);
      
      // Simular progresso da análise (15-30 segundos)
      const analysisTime = 15000 + Math.random() * 15000; // 15-30 segundos
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const increment = (100 / (analysisTime / 500)); // Atualizar a cada 500ms
          return Math.min(prev + increment, 95); // Máximo 95% até terminar
        });
      }, 500);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        try {
          const result = await analyzeChart(symbol || detectedSymbol, imageData);
          
          // Se a IA detectou um símbolo diferente, atualizar
          if (result && result.symbol && result.symbol !== symbol) {
            setDetectedSymbol(result.symbol);
            setSymbol(result.symbol);
          }
          
          clearInterval(progressInterval);
          setAnalysisProgress(100);
        } catch (error) {
          clearInterval(progressInterval);
          setAnalysisProgress(0);
          throw error;
        }
      };
      reader.readAsDataURL(selectedFile);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar imagem');
      setAnalysisProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedSymbol('');
    setSymbol('');
    setError(null);
    setAnalysisProgress(0);
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
    setAnalysisProgress(0);
    
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
                ? `🚨 Crítico: Apenas ${currentLimit - monthlyUsage.count} análises restantes!`
                : `⚠️ Atenção: ${currentLimit - monthlyUsage.count} análises restantes este mês`
              }
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all ${
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
                className="max-w-full max-h-48 sm:max-h-64 rounded-lg shadow-md"
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
              <span className="font-medium text-sm sm:text-base break-words">
                Imagem selecionada: {selectedFile?.name}
              </span>
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

      {/* Analyze Button */}
      {selectedFile && !isAnalyzing && !currentAnalysis && !analiseIA && (
        <div className="text-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-3 mx-auto bg-blue-600 text-white hover:bg-blue-700"
          >
            <Brain className="w-6 h-6" />
            <span>{getPlanType() === 'free' ? 'Fazer Upgrade para Analisar' : 'Analisar com IA'}</span>
            <Zap className="w-6 h-6" />
          </button>

          {getPlanType() === 'free' && (
            <p className="text-blue-600 text-sm mt-2 font-medium">
              🚀 Faça upgrade para desbloquear análise IA avançada
            </p>
          )}
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
            (analiseIA && analiseIA.decisao === 'ENTRAR') || 
            (!analiseIA && currentAnalysis?.recommendation === 'BUY')
              ? 'bg-green-50 border-2 border-green-200'
              : (analiseIA && analiseIA.decisao === 'EVITAR') ||
                (!analiseIA && currentAnalysis?.recommendation === 'SELL')
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className="text-4xl mb-3">
              {(analiseIA && analiseIA.decisao === 'ENTRAR') || 
               (!analiseIA && currentAnalysis?.recommendation === 'BUY') ? '🚀' :
               (analiseIA && analiseIA.decisao === 'EVITAR') ||
               (!analiseIA && currentAnalysis?.recommendation === 'SELL') ? '📉' : '⏸️'}
            </div>
            <h4 className={`text-2xl font-bold mb-2 ${
              (analiseIA && analiseIA.decisao === 'ENTRAR') || 
              (!analiseIA && currentAnalysis?.recommendation === 'BUY')
                ? 'text-green-700'
                : (analiseIA && analiseIA.decisao === 'EVITAR') ||
                  (!analiseIA && currentAnalysis?.recommendation === 'SELL')
                ? 'text-red-700'
                : 'text-gray-700'
            }`}>
              {(analiseIA && analiseIA.decisao === 'ENTRAR') || 
               (!analiseIA && currentAnalysis?.recommendation === 'BUY') ? 'COMPRAR' :
               (analiseIA && analiseIA.decisao === 'EVITAR') ||
               (!analiseIA && currentAnalysis?.recommendation === 'SELL') ? 'VENDER' : 'AGUARDAR'}
            </h4>
            <div className="bg-white rounded-lg p-3 inline-block">
              <p className="font-semibold text-gray-900">
                Confiança: {analiseIA ? analiseIA.confianca_percentual : currentAnalysis?.confidence}%
              </p>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Analysis */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análise Técnica
              </h5>
              <p className="text-blue-800 text-sm leading-relaxed">
                {analiseIA ? analiseIA.analise_tecnica : currentAnalysis?.reasoning || 'Análise técnica detalhada baseada no gráfico enviado.'}
              </p>
            </div>

            {/* Justification */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h5 className="font-semibold text-purple-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Justificativa
              </h5>
              <p className="text-purple-800 text-sm leading-relaxed">
                {analiseIA ? analiseIA.justificativa_decisao : currentAnalysis?.reasoning || 'Justificativa baseada em análise técnica e padrões identificados.'}
              </p>
            </div>
          </div>

          {/* Indicators */}
          {analiseIA && analiseIA.indicadores_utilizados && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Indicadores Utilizados
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {analiseIA.indicadores_utilizados.map((indicador: string, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-2 border border-gray-300 text-center">
                    <p className="text-gray-800 text-sm font-medium">{indicador}</p>
                  </div>
                ))}
              </div>
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
                {currentAnalysis.technicalIndicators.slice(0, 4).map((indicator, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-300">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-800 text-sm font-medium">{indicator.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        indicator.signal === 'BULLISH' ? 'bg-green-100 text-green-800' :
                        indicator.signal === 'BEARISH' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {indicator.signal === 'BULLISH' ? '🚀' : 
                         indicator.signal === 'BEARISH' ? '📉' : '⏸️'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{indicator.description}</p>
                  </div>
                ))}
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
          </span>
        </div>
        <div className="text-sm text-blue-700">
          {planType === 'free' 
            ? 'Plano gratuito com análise IA para demonstração'
            : 'Análise avançada com IA'
          }
        </div>
      </div>

      {/* Upgrade Modal */}
      <SubscriptionModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default ChartUpload;