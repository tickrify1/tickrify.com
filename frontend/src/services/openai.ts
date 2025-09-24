// Serviço IA Adaptável - OpenAI e Gemini com Prompt Profissional
export interface AIAnalysisRequest {
  image: string; // base64
  symbol?: string;
  timeframe?: string;
  provider?: 'openai' | 'gemini';
}

export interface AIAnalysisResponse {
  analise_tecnica: string;
  decisao: string;
  justificativa_decisao: string;
  confianca_percentual: number;
  indicadores_utilizados: string[];
  simbolo_detectado?: string;
  preco_atual?: string;
  timeframe_detectado?: string;
  estrutura_mercado?: {
    tendencia_principal: string;
    sub_tendencias: string[];
    topos_fundos: string;
  };
  suportes_resistencias?: {
    suportes: number[];
    resistencias: number[];
    forca_niveis: string;
  };
  padroes_candlestick?: Array<{
    nome: string;
    tipo: string;
    confiabilidade: string;
    implicacao: string;
  }>;
  padroes_graficos?: Array<{
    nome: string;
    categoria: string;
    direcao_rompimento: string;
    alvo_projetado?: number;
  }>;
  gestao_risco?: {
    ponto_entrada: number;
    stop_loss: number;
    take_profit: number;
    relacao_risco_retorno: number;
  };
}

export interface FullAnalysisResponse extends AIAnalysisResponse {
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  technicalIndicators: Array<{
    name: string;
    value: number | string;
    signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    description: string;
  }>;
}

// Prompt Profissional para Análise Técnica
const PROFESSIONAL_TRADING_PROMPT = "PROMPT_MOVIDO_PARA_O_BACKEND";
