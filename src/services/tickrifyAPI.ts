// Serviço para integração com o backend FastAPI
export interface BackendAnalysisRequest {
  image_base64: string;
  user_id: string;
}

export interface BackendAnalysisResponse {
  acao: 'compra' | 'venda' | 'esperar';
  justificativa: string;
}

// URL base da API (configurável para desenvolvimento/produção)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8001';

export class TickrifyBackendAPI {
  private static instance: TickrifyBackendAPI;

  static getInstance(): TickrifyBackendAPI {
    if (!TickrifyBackendAPI.instance) {
      TickrifyBackendAPI.instance = new TickrifyBackendAPI();
    }
    return TickrifyBackendAPI.instance;
  }

  /**
   * Converte File ou Blob para base64
   */
  private async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Erro ao converter arquivo para base64'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Converte canvas para base64
   */
  private canvasToBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  /**
   * Análise de gráfico via backend FastAPI
   */
  async analyzeChart(
    imageSource: File | Blob | HTMLCanvasElement | string,
    userId: string
  ): Promise<BackendAnalysisResponse> {
    try {
      console.log('🚀 Iniciando análise via backend FastAPI...');

      let imageBase64: string;

      // Converter diferentes tipos de entrada para base64
      if (typeof imageSource === 'string') {
        // Já é base64
        imageBase64 = imageSource;
      } else if (imageSource instanceof HTMLCanvasElement) {
        // Canvas para base64
        imageBase64 = this.canvasToBase64(imageSource);
      } else {
        // File ou Blob para base64
        imageBase64 = await this.fileToBase64(imageSource);
      }

      console.log('📸 Imagem convertida para base64');

      // Preparar requisição
      const requestData: BackendAnalysisRequest = {
        image_base64: imageBase64,
        user_id: userId
      };

      console.log('📤 Enviando requisição para backend...');

      // Fazer requisição para o backend
      const response = await fetch(`${API_BASE_URL}/api/analyze-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro HTTP ${response.status}: ${errorData.detail || 'Erro desconhecido'}`);
      }

      const result: BackendAnalysisResponse = await response.json();
      console.log('✅ Análise concluída:', result);

      // Validar resposta
      if (!result.acao || !result.justificativa) {
        throw new Error('Resposta inválida do backend');
      }

      return result;

    } catch (error) {
      console.error('❌ Erro na análise via backend:', error);
      throw error;
    }
  }

  /**
   * Verificar status da API
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Converter resposta do backend para o formato esperado pelo frontend
   */
  convertToLegacyFormat(backendResponse: BackendAnalysisResponse, symbol?: string): any {
    // Mapear ações do backend para recomendações do frontend
    const actionMap = {
      'compra': 'BUY',
      'venda': 'SELL',
      'esperar': 'HOLD'
    } as const;

    // Mapear confiança baseada na ação
    const confidenceMap = {
      'compra': 75,
      'venda': 75,
      'esperar': 60
    };

    const recommendation = actionMap[backendResponse.acao];
    const confidence = confidenceMap[backendResponse.acao];

    // Gerar preços simulados para compatibilidade
    const basePrice = 42000;
    const targetPrice = recommendation === 'BUY' ? basePrice * 1.05 : 
                      recommendation === 'SELL' ? basePrice * 0.95 : basePrice;
    const stopLoss = recommendation === 'BUY' ? basePrice * 0.98 : 
                    recommendation === 'SELL' ? basePrice * 1.02 : basePrice;

    return {
      analise_tecnica: `Análise realizada via IA: ${backendResponse.justificativa}`,
      decisao: backendResponse.acao.toUpperCase(),
      justificativa_decisao: backendResponse.justificativa,
      confianca_percentual: confidence,
      indicadores_utilizados: ['IA Vision Analysis', 'Pattern Recognition'],
      symbol: symbol || 'CHART_ANALYSIS',
      recommendation,
      confidence,
      targetPrice,
      stopLoss,
      timeframe: '1H',
      timestamp: new Date(),
      reasoning: backendResponse.justificativa,
      technicalIndicators: [
        {
          name: 'IA Analysis',
          value: backendResponse.acao,
          signal: recommendation === 'BUY' ? 'BULLISH' : recommendation === 'SELL' ? 'BEARISH' : 'NEUTRAL',
          description: backendResponse.justificativa
        }
      ]
    };
  }
}

// Instância singleton
export const tickrifyAPI = TickrifyBackendAPI.getInstance();
